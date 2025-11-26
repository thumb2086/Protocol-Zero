/**
 * PartManager - Manages weapon blueprints, parts, and builds
 * Handles serialization/deserialization and file I/O via Electron IPC
 */

import type { WeaponBlueprint, PartData, WeaponBuild, Profile2D } from '../types/WeaponData';

export class PartManager {
    private blueprintsCache: Map<string, WeaponBlueprint> = new Map();
    private partsCache: Map<string, PartData> = new Map();
    private buildsCache: Map<string, WeaponBuild> = new Map();
    private profilesCache: Map<string, Profile2D> = new Map();

    constructor() {
        this.initialize();
    }

    /**
     * Initialize the foundry directories
     */
    private async initialize(): Promise<void> {
        try {
            // Ensure foundry directories exist
            const partsPathRes = await window.foundry.getPath('foundry', 'warehouse', 'parts');
            if (partsPathRes.success && partsPathRes.path) {
                await window.foundry.ensureDir(partsPathRes.path);
            }

            const buildsPathRes = await window.foundry.getPath('foundry', 'warehouse', 'builds');
            if (buildsPathRes.success && buildsPathRes.path) {
                await window.foundry.ensureDir(buildsPathRes.path);
            }

            console.log('[PartManager] Initialized foundry directories');
        } catch (error) {
            console.error('[PartManager] Failed to initialize:', error);
        }
    }

    // ===== Blueprint Management =====

    /**
     * Load a weapon blueprint from the blueprints folder
     */
    async loadBlueprint(name: string): Promise<WeaponBlueprint | null> {
        // Check cache first
        if (this.blueprintsCache.has(name)) {
            return this.blueprintsCache.get(name)!;
        }

        try {
            const pathRes = await window.foundry.getPath('blueprints', `${name}.json`);
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get blueprint path:', pathRes.error);
                return null;
            }

            const result = await window.foundry.readFile(pathRes.path);
            if (!result.success || !result.data) {
                console.error('[PartManager] Failed to read blueprint:', result.error);
                return null;
            }

            const blueprint: WeaponBlueprint = JSON.parse(result.data);
            this.blueprintsCache.set(name, blueprint);
            console.log(`[PartManager] Loaded blueprint: ${name}`);
            return blueprint;
        } catch (error) {
            console.error(`[PartManager] Error loading blueprint ${name}:`, error);
            return null;
        }
    }

    /**
     * List all available blueprints
     */
    async listBlueprints(): Promise<string[]> {
        try {
            const pathRes = await window.foundry.getPath('blueprints');
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get blueprints path:', pathRes.error);
                return [];
            }

            const result = await window.foundry.listFiles(pathRes.path);
            if (!result.success || !result.files) {
                console.error('[PartManager] Failed to list blueprints:', result.error);
                return [];
            }

            return result.files
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''));
        } catch (error) {
            console.error('[PartManager] Error listing blueprints:', error);
            return [];
        }
    }

    // ===== Profile Management =====

    /**
     * Load a 2D profile from the profiles folder
     */
    async loadProfile(name: string): Promise<Profile2D | null> {
        // Check cache first
        if (this.profilesCache.has(name)) {
            return this.profilesCache.get(name)!;
        }

        try {
            const pathRes = await window.foundry.getPath('profiles', `${name}.profile.json`);
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get profile path:', pathRes.error);
                return null;
            }

            const result = await window.foundry.readFile(pathRes.path);
            if (!result.success || !result.data) {
                console.error('[PartManager] Failed to read profile:', result.error);
                return null;
            }

            const profile: Profile2D = JSON.parse(result.data);
            this.profilesCache.set(name, profile);
            console.log(`[PartManager] Loaded profile: ${name}`);
            return profile;
        } catch (error) {
            console.error(`[PartManager] Error loading profile ${name}:`, error);
            return null;
        }
    }

    // ===== Part Management =====

    /**
     * Save a custom part to the warehouse
     */
    async savePart(part: PartData): Promise<boolean> {
        try {
            const pathRes = await window.foundry.getPath('foundry', 'warehouse', 'parts', `${part.id}.part.json`);
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get part path:', pathRes.error);
                return false;
            }

            const data = JSON.stringify(part, null, 2);
            const result = await window.foundry.writeFile(pathRes.path, data);

            if (result.success) {
                this.partsCache.set(part.id, part);
                console.log(`[PartManager] Saved part: ${part.id}`);
                return true;
            } else {
                console.error('[PartManager] Failed to write part:', result.error);
                return false;
            }
        } catch (error) {
            console.error(`[PartManager] Error saving part ${part.id}:`, error);
            return false;
        }
    }

    /**
     * Load a custom part from the warehouse
     */
    async loadPart(id: string): Promise<PartData | null> {
        // Check cache first
        if (this.partsCache.has(id)) {
            return this.partsCache.get(id)!;
        }

        try {
            const pathRes = await window.foundry.getPath('foundry', 'warehouse', 'parts', `${id}.part.json`);
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get part path:', pathRes.error);
                return null;
            }

            const result = await window.foundry.readFile(pathRes.path);
            if (!result.success || !result.data) {
                console.error('[PartManager] Failed to read part:', result.error);
                return null;
            }

            const part: PartData = JSON.parse(result.data);
            this.partsCache.set(id, part);
            console.log(`[PartManager] Loaded part: ${id}`);
            return part;
        } catch (error) {
            console.error(`[PartManager] Error loading part ${id}:`, error);
            return null;
        }
    }

    /**
     * List all custom parts
     */
    async listParts(): Promise<PartData[]> {
        try {
            const pathRes = await window.foundry.getPath('foundry', 'warehouse', 'parts');
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get parts path:', pathRes.error);
                return [];
            }

            const result = await window.foundry.listFiles(pathRes.path);
            if (!result.success || !result.files) {
                console.error('[PartManager] Failed to list parts:', result.error);
                return [];
            }

            const parts: PartData[] = [];
            for (const file of result.files.filter(f => f.endsWith('.part.json'))) {
                const id = file.replace('.part.json', '');
                const part = await this.loadPart(id);
                if (part) parts.push(part);
            }

            return parts;
        } catch (error) {
            console.error('[PartManager] Error listing parts:', error);
            return [];
        }
    }

    // ===== Build Management =====

    /**
     * Save a weapon build
     */
    async saveBuild(build: WeaponBuild): Promise<boolean> {
        try {
            const pathRes = await window.foundry.getPath('foundry', 'warehouse', 'builds', `${build.id}.gun.json`);
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get build path:', pathRes.error);
                return false;
            }

            const data = JSON.stringify(build, null, 2);
            const result = await window.foundry.writeFile(pathRes.path, data);

            if (result.success) {
                this.buildsCache.set(build.id, build);
                console.log(`[PartManager] Saved build: ${build.id}`);
                return true;
            } else {
                console.error('[PartManager] Failed to write build:', result.error);
                return false;
            }
        } catch (error) {
            console.error(`[PartManager] Error saving build ${build.id}:`, error);
            return false;
        }
    }

    /**
     * Load a weapon build
     */
    async loadBuild(id: string): Promise<WeaponBuild | null> {
        // Check cache first
        if (this.buildsCache.has(id)) {
            return this.buildsCache.get(id)!;
        }

        try {
            const pathRes = await window.foundry.getPath('foundry', 'warehouse', 'builds', `${id}.gun.json`);
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get build path:', pathRes.error);
                return null;
            }

            const result = await window.foundry.readFile(pathRes.path);
            if (!result.success || !result.data) {
                console.error('[PartManager] Failed to read build:', result.error);
                return null;
            }

            const build: WeaponBuild = JSON.parse(result.data);
            this.buildsCache.set(id, build);
            console.log(`[PartManager] Loaded build: ${id}`);
            return build;
        } catch (error) {
            console.error(`[PartManager] Error loading build ${id}:`, error);
            return null;
        }
    }

    /**
     * List all weapon builds
     */
    async listBuilds(): Promise<WeaponBuild[]> {
        try {
            const pathRes = await window.foundry.getPath('foundry', 'warehouse', 'builds');
            if (!pathRes.success || !pathRes.path) {
                console.error('[PartManager] Failed to get builds path:', pathRes.error);
                return [];
            }

            const result = await window.foundry.listFiles(pathRes.path);
            if (!result.success || !result.files) {
                console.error('[PartManager] Failed to list builds:', result.error);
                return [];
            }

            const builds: WeaponBuild[] = [];
            for (const file of result.files.filter(f => f.endsWith('.gun.json'))) {
                const id = file.replace('.gun.json', '');
                const build = await this.loadBuild(id);
                if (build) builds.push(build);
            }

            return builds;
        } catch (error) {
            console.error('[PartManager] Error listing builds:', error);
            return [];
        }
    }

    /**
     * Clear all caches
     */
    clearCaches(): void {
        this.blueprintsCache.clear();
        this.partsCache.clear();
        this.buildsCache.clear();
        this.profilesCache.clear();
        console.log('[PartManager] Cleared all caches');
    }
}

// Singleton instance
export const partManager = new PartManager();
