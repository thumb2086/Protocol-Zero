import { SceneLoader, Scene, AbstractMesh, Vector3 } from '@babylonjs/core'

export interface CommunityWeapon {
    id: string
    name: string
    blueprint: string
    model: string
    author: string
    created: string
}

export interface Manifest {
    version: string
    updated: string
    weapons: CommunityWeapon[]
}

export class GitHubWeaponLoader {
    private static REPO_OWNER = 'thumb2086'
    private static REPO_NAME = 'protocol-foundry-repository'
    private static BRANCH = 'main'
    private static BASE_URL = `https://raw.githubusercontent.com/${GitHubWeaponLoader.REPO_OWNER}/${GitHubWeaponLoader.REPO_NAME}/${GitHubWeaponLoader.BRANCH}/`

    /**
     * Fetch the list of available community weapons
     */
    static async fetchManifest(): Promise<Manifest | null> {
        try {
            const response = await fetch(`${this.BASE_URL}manifest.json`)
            if (!response.ok) throw new Error('Manifest not found')
            return await response.json()
        } catch (error) {
            console.error('Failed to fetch weapon manifest:', error)
            return null
        }
    }

    /**
     * Get the full URL for a model file
     */
    static getModelUrl(relativePath: string): string {
        return `${this.BASE_URL}${relativePath}`
    }
}
