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
