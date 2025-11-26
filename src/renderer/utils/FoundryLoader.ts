export interface WeaponMetadata {
    id: string
    name: string
    type: string
    blueprintPath?: string
    modelPath?: string
    thumbnail?: string
    author?: string
    createdAt?: string
}

/**
 * Foundry Loader - Loads weapon data from protocol-foundry-repository
 * Renderer-safe version using IPC or mock data
 */
export class FoundryLoader {
    private weaponCache: WeaponMetadata[] = []

    /**
     * Load all available weapons from the repository
     * In renderer process, we use mock data or fetch from IPC
     */
    async loadWeaponManifest(): Promise<WeaponMetadata[]> {
        try {
            // Check if we have electron API available
            if (window.electron && window.electron.ipcRenderer) {
                // TODO: Request weapons from main process via IPC
                console.log('[FoundryLoader] IPC available, but not implemented yet')
                return this.getMockWeapons()
            } else {
                // Browser mode or no IPC - use mock data
                console.log('[FoundryLoader] Using mock weapon data')
                return this.getMockWeapons()
            }
        } catch (error) {
            console.error('[FoundryLoader] Error loading weapons:', error)
            return this.getMockWeapons()
        }
    }

    /**
     * Get weapon list (cached)
     */
    getWeaponList(): WeaponMetadata[] {
        return this.weaponCache
    }

    /**
     * Get specific weapon blueprint
     */
    async getWeaponBlueprint(id: string): Promise<any | null> {
        const weapon = this.weaponCache.find(w => w.id === id)
        if (!weapon) return null

        // TODO: Fetch blueprint via IPC or HTTP
        console.log(`[FoundryLoader] Blueprint fetch not implemented for ${id}`)
        return null
    }

    /**
     * Get mock weapons for testing
     */
    private getMockWeapons(): WeaponMetadata[] {
        const mockWeapons = [
            {
                id: 'vandal-flux',
                name: 'Flux Vandal',
                type: 'Rifle',
                author: 'Protocol Team',
                createdAt: new Date().toISOString()
            },
            {
                id: 'vandal-gaia',
                name: 'Gaia Vandal',
                type: 'Rifle',
                author: 'Protocol Team',
                createdAt: new Date().toISOString()
            },
            {
                id: 'phantom-default',
                name: 'Standard Phantom',
                type: 'Rifle',
                author: 'Protocol Team',
                createdAt: new Date().toISOString()
            },
            {
                id: 'classic-standard',
                name: 'Classic Pistol',
                type: 'Pistol',
                author: 'Protocol Team',
                createdAt: new Date().toISOString()
            }
        ]

        this.weaponCache = mockWeapons
        return mockWeapons
    }
}

// Type declarations for window.electron
declare global {
    interface Window {
        electron?: {
            ipcRenderer: {
                invoke: (channel: string, ...args: any[]) => Promise<any>
                on: (channel: string, callback: (...args: any[]) => void) => void
            }
        }
    }
}
