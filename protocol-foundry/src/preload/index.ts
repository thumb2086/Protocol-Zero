import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Foundry API for file system operations
const foundryAPI = {
    readFile: (path: string) => ipcRenderer.invoke('foundry:readFile', path),
    writeFile: (path: string, data: string) => ipcRenderer.invoke('foundry:writeFile', path, data),
    listFiles: (dir: string) => ipcRenderer.invoke('foundry:listFiles', dir),
    ensureDir: (dir: string) => ipcRenderer.invoke('foundry:ensureDir', dir),
    getPath: (type: 'foundry' | 'blueprints' | 'profiles', ...parts: string[]) =>
        ipcRenderer.invoke('foundry:getPath', type, ...parts)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('foundry', foundryAPI)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore
    window.electron = electronAPI
    // @ts-ignore
    window.foundry = foundryAPI
}
