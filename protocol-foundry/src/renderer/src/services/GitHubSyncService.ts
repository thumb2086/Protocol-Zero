/**
 * GitHubSyncService - Community weapon sharing via GitHub
 * 
 * Uses Octokit to:
 * - Authenticate with GitHub Personal Access Token
 * - Upload weapon builds as JSON files to repository
 * - Upload 3D models (GLB) to repository
 * - Update manifest.json for indexing
 * - Validate submissions against anti-cheat rules
 */

import { Octokit } from '@octokit/rest'
import type { WeaponBuild, PartData } from '../types/WeaponData'

export interface GitHubConfig {
    owner: string
    repo: string
    branch: string
}

export class GitHubSyncService {
    private octokit: Octokit | null = null
    private isAuthenticated = false
    private username: string | null = null
    private config: GitHubConfig = {
        owner: 'thumb2086',
        repo: 'protocol-foundry-repository',
        branch: 'main'
    }

    constructor() {
        console.log('[GitHubSync] Service initialized')
        this.loadSavedToken()
    }

    /**
     * Load saved token from Electron secure storage
     */
    private async loadSavedToken(): Promise<void> {
        try {
            // @ts-ignore - electron API exposed via preload
            const result = await window.electron?.ipcRenderer?.invoke('github:getToken')

            if (result?.success && result.token) {
                console.log('[GitHubSync] Found saved token, authenticating...')
                await this.authenticate(result.token)
            }
        } catch (error) {
            console.log('[GitHubSync] No saved token found')
        }
    }

    /**
     * Authenticate with GitHub using Personal Access Token
     */
    async authenticate(token: string): Promise<boolean> {
        try {
            console.log('[GitHubSync] Authenticating with GitHub...')

            this.octokit = new Octokit({ auth: token })

            // Verify token by getting user info
            const { data: user } = await this.octokit.rest.users.getAuthenticated()

            this.isAuthenticated = true
            this.username = user.login

            console.log('[GitHubSync] Authenticated as:', this.username)

            // Save token securely
            try {
                // @ts-ignore
                await window.electron?.ipcRenderer?.invoke('github:saveToken', token)
                console.log('[GitHubSync] Token saved securely')
            } catch (saveError) {
                console.warn('[GitHubSync] Failed to save token:', saveError)
            }

            return true
        } catch (error) {
            console.error('[GitHubSync] Authentication failed:', error)
            this.isAuthenticated = false
            this.username = null
            this.octokit = null
            return false
        }
    }

    /**
     * Upload a weapon build to GitHub
     */
    async uploadBuild(
        build: WeaponBuild,
        modelBlob?: Blob
    ): Promise<{ success: boolean; prUrl?: string; error?: string }> {
        console.log('[GitHubSync] Upload build requested:', build.name)

        if (!this.isAuthenticated || !this.octokit) {
            return {
                success: false,
                error: 'Not authenticated. Please sign in to GitHub first.'
            }
        }

        // Validate build
        const isValid = this.validateBuild(build)
        if (!isValid) {
            return {
                success: false,
                error: 'Build validation failed. Please check your weapon parameters.'
            }
        }

        try {
            const timestamp = Date.now()
            const buildId = `${build.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`

            const uploads: Promise<any>[] = []

            // 1. Upload JSON blueprint
            const blueprintPath = `blueprints/community/${buildId}.json`
            const blueprintContent = JSON.stringify(build, null, 2)

            uploads.push(
                this.uploadFile(
                    blueprintPath,
                    blueprintContent,
                    `Add weapon build: ${build.name}`
                )
            )

            // 2. Upload GLB model if provided
            if (modelBlob) {
                const modelPath = `models/community/${buildId}.glb`
                const modelContent = await this.blobToBase64(modelBlob)

                uploads.push(
                    this.uploadFile(
                        modelPath,
                        modelContent,
                        `Add 3D model for: ${build.name}`,
                        true // binary file
                    )
                )
            }

            // Wait for all uploads
            await Promise.all(uploads)

            // 3. Update manifest.json
            await this.updateManifest(buildId, build)

            console.log('[GitHubSync] Upload successful!')

            return {
                success: true,
                prUrl: `https://github.com/${this.config.owner}/${this.config.repo}/tree/${this.config.branch}`
            }
        } catch (error) {
            console.error('[GitHubSync] Upload failed:', error)
            return {
                success: false,
                error: `Upload failed: ${(error as Error).message}`
            }
        }
    }

    /**
     * Upload a custom part to GitHub
     */
    async uploadPart(part: PartData): Promise<{ success: boolean; prUrl?: string; error?: string }> {
        console.log('[GitHubSync] Upload part requested:', part.name)

        if (!this.isAuthenticated || !this.octokit) {
            return {
                success: false,
                error: 'Not authenticated. Please sign in to GitHub first.'
            }
        }

        // Validate part
        const isValid = this.validatePart(part)
        if (!isValid) {
            return {
                success: false,
                error: 'Part validation failed. Please check your part parameters.'
            }
        }

        try {
            const timestamp = Date.now()
            const partId = `${part.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`
            const partPath = `parts/${part.type}s/${partId}.json`

            const content = JSON.stringify(part, null, 2)

            await this.uploadFile(
                partPath,
                content,
                `Add ${part.type}: ${part.name}`
            )

            console.log('[GitHubSync] Part upload successful!')

            return {
                success: true,
                prUrl: `https://github.com/${this.config.owner}/${this.config.repo}/tree/${this.config.branch}`
            }
        } catch (error) {
            console.error('[GitHubSync] Part upload failed:', error)
            return {
                success: false,
                error: `Upload failed: ${(error as Error).message}`
            }
        }
    }

    /**
     * Upload a file to GitHub repository
     */
    private async uploadFile(
        path: string,
        content: string,
        message: string,
        isBinary: boolean = false
    ): Promise<void> {
        if (!this.octokit) throw new Error('Not authenticated')

        try {
            // Check if file exists
            let sha: string | undefined
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path,
                    ref: this.config.branch
                })

                if ('sha' in data) {
                    sha = data.sha
                }
            } catch (error: any) {
                if (error.status !== 404) throw error
                // File doesn't exist, that's fine
            }

            // Create or update file
            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner: this.config.owner,
                repo: this.config.repo,
                path,
                message,
                content: isBinary ? content : Buffer.from(content).toString('base64'),
                sha,
                branch: this.config.branch
            })

            console.log('[GitHubSync] File uploaded:', path)
        } catch (error) {
            console.error('[GitHubSync] File upload failed:', path, error)
            throw error
        }
    }

    /**
     * Update manifest.json with new build entry
     */
    private async updateManifest(buildId: string, build: WeaponBuild): Promise<void> {
        if (!this.octokit) throw new Error('Not authenticated')

        try {
            const manifestPath = 'manifest.json'

            // Get current manifest
            let manifest: any = {
                version: '1.0.0',
                updated: new Date().toISOString(),
                weapons: []
            }

            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: manifestPath,
                    ref: this.config.branch
                })

                if ('content' in data) {
                    const content = Buffer.from(data.content, 'base64').toString('utf-8')
                    manifest = JSON.parse(content)
                    manifest.sha = data.sha
                }
            } catch (error: any) {
                if (error.status !== 404) throw error
                // Manifest doesn't exist, use default
            }

            // Add new weapon entry
            manifest.weapons = manifest.weapons || []
            manifest.weapons.push({
                id: buildId,
                name: build.name,
                blueprint: `blueprints/community/${buildId}.json`,
                model: `models/community/${buildId}.glb`,
                author: this.username || 'unknown',
                created: new Date().toISOString()
            })

            manifest.updated = new Date().toISOString()

            // Upload updated manifest
            await this.uploadFile(
                manifestPath,
                JSON.stringify(manifest, null, 2),
                `Update manifest: add ${build.name}`
            )

            console.log('[GitHubSync] Manifest updated')
        } catch (error) {
            console.error('[GitHubSync] Manifest update failed:', error)
            throw error
        }
    }

    /**
     * Convert Blob to base64 string
     */
    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                // Remove data URL prefix
                const base64 = result.split(',')[1]
                resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    }

    /**
     * Validate a weapon build against anti-cheat rules
     */
    private validateBuild(build: WeaponBuild): boolean {
        console.log('[GitHubSync] Validating build:', build.name)

        // Basic checks
        if (!build.name || build.name.length === 0) {
            console.error('[GitHubSync] Build name is required')
            return false
        }

        if (!build.parts || !build.parts.receiver || !build.parts.barrel || !build.parts.magazine) {
            console.error('[GitHubSync] Build missing required parts')
            return false
        }

        return true
    }

    /**
     * Validate a custom part against anti-cheat rules
     */
    private validatePart(part: PartData): boolean {
        console.log('[GitHubSync] Validating part:', part.name)

        // Basic checks
        if (!part.name || part.name.length === 0) {
            console.error('[GitHubSync] Part name is required')
            return false
        }

        if (!part.type || !part.spec) {
            console.error('[GitHubSync] Part missing type or spec')
            return false
        }

        // Check for reasonable size limits (prevent giant weapons)
        const maxSize = 100
        if (part.spec.length && part.spec.length > maxSize) return false
        if (part.spec.width && part.spec.width > maxSize) return false
        if (part.spec.height && part.spec.height > maxSize) return false
        if (part.spec.diameter && part.spec.diameter > maxSize) return false

        // Check magazine capacity
        if (part.type === 'magazine' && part.spec.capacity) {
            if (part.spec.capacity > 50) {
                console.error('[GitHubSync] Magazine capacity too high (max 50)')
                return false
            }
        }

        return true
    }

    /**
     * Check if user is authenticated
     */
    isUserAuthenticated(): boolean {
        return this.isAuthenticated
    }

    /**
     * Get current username
     */
    getUsername(): string | null {
        return this.username
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        this.isAuthenticated = false
        this.username = null
        this.octokit = null

        // Clear saved token
        try {
            // @ts-ignore
            await window.electron?.ipcRenderer?.invoke('github:clearToken')
        } catch (error) {
            console.warn('[GitHubSync] Failed to clear token:', error)
        }

        console.log('[GitHubSync] Signed out')
    }
}

// Singleton instance
export const githubSync = new GitHubSyncService()
