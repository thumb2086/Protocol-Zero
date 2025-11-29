import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import { GameServer } from './server'

let mainWindow: BrowserWindow | null = null

// Initialize UDP Game Server (可選，用環境變量控制)
// const ENABLE_GAME_SERVER = process.env.ENABLE_GAME_SERVER !== 'false'
// const gameServer = ENABLE_GAME_SERVER ? new GameServer(41234) : null

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true, // For Havok/Babylon if needed, but context isolation is better
            contextIsolation: false // Simplifying for prototype, should be true in prod
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show()
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

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC Handler for part equipping
    ipcMain.on('equip-part', (_event, data: { slot: string; partData: any }) => {
        console.log('[Main] Received equip-part request:', data)

        if (mainWindow && mainWindow.webContents) {
            try {
                mainWindow.webContents.send('part-equipped', {
                    slot: data.slot,
                    partData: data.partData,
                    success: true
                })
                console.log('[Main] Part equip request forwarded to renderer')
            } catch (error) {
                console.error('[Main] Error forwarding part equip request:', error)
                mainWindow.webContents.send('part-equipped', {
                    slot: data.slot,
                    partData: data.partData,
                    success: false,
                    error: String(error)
                })
            }
        } else {
            console.warn('[Main] No main window available to forward part equip request')
        }
    })

    // IPC Handler for weapon selection
    ipcMain.on('weapon:select', (_event, weaponId: string) => {
        console.log('[Main] Received weapon:select request:', weaponId)
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('weapon:changed', weaponId)
        }
    })

    // Start the UDP game server (暫時禁用)
    // if (ENABLE_GAME_SERVER && gameServer) {
    //     console.log('[Protocol: Zero] Starting Game Server...')
    //     gameServer.start()
    // } else {
    //     console.log('[Protocol: Zero] Game Server disabled')
    // }

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    // if (ENABLE_GAME_SERVER && gameServer) {
    //     console.log('[Protocol: Zero] Stopping Game Server...')
    //     gameServer.stop()
    // }

    if (process.platform !== 'darwin') {
        app.quit()
    }
})
