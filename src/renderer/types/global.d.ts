// Global type declarations for Protocol-Zero
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
                select: (weaponId: string) => Promise<void>
                onLoaded: (callback: (weaponId: string) => void) => void
                equipPart: (slot: string, partData: any) => void
                onPartEquipped: (callback: (data: { slot: string; partData: any; success: boolean; error?: string }) => void) => void
            }
        }
    }
}

export { }
