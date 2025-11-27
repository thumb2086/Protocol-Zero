/**
 * IPC Bridge - Communication between UI and Main Process
 */
export class IPCBridge {
    private static instance: IPCBridge

    private constructor() {
        // Singleton pattern
    }

    static getInstance(): IPCBridge {
        if (!IPCBridge.instance) {
            IPCBridge.instance = new IPCBridge()
        }
        return IPCBridge.instance
    }

    /**
     * Request weapon change
     */
    async requestWeaponChange(weaponId: string): Promise<void> {
        console.log(`[IPC] Requesting weapon change: ${weaponId}`)

        // Check if electron API is available
        if (window.electron && window.electron.ipcRenderer) {
            try {
                await window.electron.ipcRenderer.invoke('weapon:select', weaponId)
                console.log(`[IPC] Weapon change request sent: ${weaponId}`)
            } catch (error) {
                console.error('[IPC] Error sending weapon change request:', error)
            }
        } else {
            console.warn('[IPC] Electron API not available, running in browser mode')
            // Emit custom event for browser testing
            window.dispatchEvent(new CustomEvent('weapon:change', { detail: { weaponId } }))
        }
    }

    /**
     * Listen for weapon change events
     */
    onWeaponChanged(callback: (weaponId: string) => void): void {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.on('weapon:loaded', (_event, weaponId) => {
                console.log(`[IPC] Weapon loaded: ${weaponId}`)
                callback(weaponId)
            })
        } else {
            // Browser fallback
            window.addEventListener('weapon:change', ((event: CustomEvent) => {
                callback(event.detail.weaponId)
            }) as EventListener)
        }
    }
}

// Type declarations for window.electron
declare global {
    interface Window {
        electron?: {
            ipcRenderer: {
                invoke: (channel: string, ...args: any[]) => Promise<any>
                on: (channel: string, callback: (...args: any[]) => void) => void
                send: (channel: string, ...args: any[]) => void
            }
        }
        api?: {
            weapon: {
                equipPart: (slot: string, partData: any) => void
                onPartEquipped: (callback: (data: { slot: string; partData: any; success: boolean }) => void) => void
            }
        }
    }
}
