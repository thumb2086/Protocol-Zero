import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile, readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// ===== Protocol-Foundry IPC Handlers =====

// Get the foundry data path
function getFoundryPath(...parts: string[]): string {
    return join(app.getPath('userData'), 'foundry', ...parts);
}

// Get the project blueprints path (in development)
function getBlueprintsPath(...parts: string[]): string {
    if (is.dev) {
        return join(process.cwd(), 'blueprints', ...parts);
    }
    return join(process.resourcesPath, 'blueprints', ...parts);
}

// Get the project profiles path (in development)
function getProfilesPath(...parts: string[]): string {
    if (is.dev) {
        return join(process.cwd(), 'profiles', ...parts);
    }
    return join(process.resourcesPath, 'profiles', ...parts);
}

// foundry:readFile - Read a JSON file
ipcMain.handle('foundry:readFile', async (_, filePath: string) => {
    try {
        const data = await readFile(filePath, 'utf-8');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});

// foundry:writeFile - Write a JSON file
ipcMain.handle('foundry:writeFile', async (_, filePath: string, data: string) => {
    try {
        await writeFile(filePath, data, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});

// foundry:listFiles - List files in a directory
ipcMain.handle('foundry:listFiles', async (_, dirPath: string) => {
    try {
        const files = await readdir(dirPath);
        return { success: true, files };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});

// foundry:ensureDir - Create directory if it doesn't exist
ipcMain.handle('foundry:ensureDir', async (_, dirPath: string) => {
    try {
        if (!existsSync(dirPath)) {
            await mkdir(dirPath, { recursive: true });
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});

// foundry:getPath - Get foundry data paths
ipcMain.handle('foundry:getPath', async (_, type: 'foundry' | 'blueprints' | 'profiles', ...parts: string[]) => {
    try {
        let path: string;
        switch (type) {
            case 'foundry':
                path = getFoundryPath(...parts);
                break;
            case 'blueprints':
                path = getBlueprintsPath(...parts);
                break;
            case 'profiles':
                path = getProfilesPath(...parts);
                break;
            default:
                throw new Error(`Unknown path type: ${type}`);
        }
        return { success: true, path };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});

// ===== GitHub Token Secure Storage =====

// github:saveToken - Securely store GitHub token using safeStorage
ipcMain.handle('github:saveToken', async (_, token: string) => {
    try {
        if (!app.isReady()) {
            throw new Error('App not ready for secure storage');
        }

        const { safeStorage } = require('electron');

        if (!safeStorage.isEncryptionAvailable()) {
            console.warn('[GitHub] Encryption not available, storing in plain text (not recommended)');
            // Fallback: store in userData (not encrypted)
            const tokenPath = getFoundryPath('github-token.txt');
            await mkdir(getFoundryPath(), { recursive: true });
            await writeFile(tokenPath, token, 'utf-8');
            return { success: true, encrypted: false };
        }

        // Encrypt and store token
        const encrypted = safeStorage.encryptString(token);
        const tokenPath = getFoundryPath('github-token.enc');
        await mkdir(getFoundryPath(), { recursive: true });
        await writeFile(tokenPath, encrypted);

        console.log('[GitHub] Token saved securely');
        return { success: true, encrypted: true };
    } catch (error) {
        console.error('[GitHub] Failed to save token:', error);
        return { success: false, error: (error as Error).message };
    }
});

// github:getToken - Retrieve encrypted GitHub token
ipcMain.handle('github:getToken', async () => {
    try {
        if (!app.isReady()) {
            throw new Error('App not ready for secure storage');
        }

        const { safeStorage } = require('electron');

        // Try to read encrypted token first
        const encTokenPath = getFoundryPath('github-token.enc');
        if (existsSync(encTokenPath)) {
            if (!safeStorage.isEncryptionAvailable()) {
                throw new Error('Cannot decrypt token: encryption not available');
            }

            const encrypted = await readFile(encTokenPath);
            const token = safeStorage.decryptString(encrypted);
            return { success: true, token, encrypted: true };
        }

        // Fallback: try plain text token (legacy/development)
        const plainTokenPath = getFoundryPath('github-token.txt');
        if (existsSync(plainTokenPath)) {
            const token = await readFile(plainTokenPath, 'utf-8');
            console.warn('[GitHub] Using plain text token (not encrypted)');
            return { success: true, token, encrypted: false };
        }

        // No token found
        return { success: false, error: 'No token found' };
    } catch (error) {
        console.error('[GitHub] Failed to get token:', error);
        return { success: false, error: (error as Error).message };
    }
});

// github:clearToken - Remove stored token
ipcMain.handle('github:clearToken', async () => {
    try {
        const { unlink } = require('fs/promises');

        const encTokenPath = getFoundryPath('github-token.enc');
        const plainTokenPath = getFoundryPath('github-token.txt');

        const promises: Promise<void>[] = [];

        if (existsSync(encTokenPath)) {
            promises.push(unlink(encTokenPath));
        }
        if (existsSync(plainTokenPath)) {
            promises.push(unlink(plainTokenPath));
        }

        await Promise.all(promises);
        console.log('[GitHub] Token cleared');
        return { success: true };
    } catch (error) {
        console.error('[GitHub] Failed to clear token:', error);
        return { success: false, error: (error as Error).message };
    }
});

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.foundry')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
