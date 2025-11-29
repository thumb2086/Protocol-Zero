/**
 * Protocol: Zero - Part Library
 * 零件資料庫：定義所有可用零件及其遊戲屬性
 */

import {
    ScopeConfig,
    GripConfig,
    StockConfig,
    BarrelConfig,
    MagazineConfig,
    SkinConfig
} from '../types/BlueprintDefinition'

// =============== Scope Library ===============

export const SCOPE_LIBRARY: Record<string, ScopeConfig> = {
    'red_dot': {
        type: 'red_dot',
        magnification: 1.0,
        adsSpeed: 0.9,           // 10% faster ADS
        clarity: 1.0
    },
    'holo': {
        type: 'holo',
        magnification: 1.5,
        adsSpeed: 0.85,          // 15% slower ADS
        clarity: 0.95
    },
    'acog': {
        type: 'acog',
        magnification: 4.0,
        adsSpeed: 0.65,          // 35% slower ADS
        clarity: 0.9
    },
    'sniper_8x': {
        type: 'sniper',
        magnification: 8.0,
        adsSpeed: 0.5,           // 50% slower ADS
        clarity: 1.0
    }
}

// =============== Grip Library ===============

export const GRIP_LIBRARY: Record<string, GripConfig> = {
    'vertical': {
        type: 'vertical',
        recoilReduction: 0.10,    // 10% vertical recoil reduction
        adsMovement: 0.85         // 15% slower movement while ADS
    },
    'angled': {
        type: 'angled',
        recoilReduction: 0.15,    // 15% horizontal + vertical recoil reduction
        adsMovement: 0.92         // 8% slower movement while ADS
    },
    'stub': {
        type: 'stub',
        recoilReduction: 0.05,    // 5% recoil reduction
        adsMovement: 0.98         // 2% slower movement (minimal penalty)
    }
}

// =============== Stock Library ===============

export const STOCK_LIBRARY: Record<string, StockConfig> = {
    'fixed': {
        type: 'fixed',
        recoilReduction: 0.15,    // 15% recoil reduction
        aimStability: 0.10        // 10% better aim stability
    },
    'collapsible': {
        type: 'collapsible',
        recoilReduction: 0.10,    // 10% recoil reduction
        aimStability: 0.05        // 5% better aim stability (more mobile)
    },
    'heavy': {
        type: 'heavy',
        recoilReduction: 0.25,    // 25% recoil reduction (best)
        aimStability: 0.20        // 20% better aim stability
    }
}

// =============== Barrel Library ===============

export const BARREL_LIBRARY: Record<string, BarrelConfig> = {
    'standard': {
        type: 'standard',
        length: 1.0,
        rangeModifier: 1.0,       // No change
        velocityModifier: 1.0     // No change
    },
    'long': {
        type: 'long',
        length: 1.3,
        rangeModifier: 1.2,       // +20% range
        velocityModifier: 1.1     // +10% bullet velocity
    },
    'short': {
        type: 'short',
        length: 0.7,
        rangeModifier: 0.85,      // -15% range
        velocityModifier: 0.95    // -5% bullet velocity
    },
    'silenced': {
        type: 'silenced',
        length: 1.2,
        rangeModifier: 0.95,      // -5% range (suppressor penalty)
        velocityModifier: 0.98    // -2% bullet velocity
    }
}

// =============== Magazine Library ===============

export const MAGAZINE_LIBRARY: Record<string, MagazineConfig> = {
    'standard_25': {
        capacity: 25,
        reloadSpeed: 1.0,
        style: 'straight'
    },
    'extended_30': {
        capacity: 30,
        reloadSpeed: 0.95,        // 5% slower reload
        style: 'straight'
    },
    'drum_50': {
        capacity: 50,
        reloadSpeed: 0.75,        // 25% slower reload
        style: 'drum'
    },
    'curved_30': {
        capacity: 30,
        reloadSpeed: 1.0,
        style: 'curved'
    },
    'pistol_12': {
        capacity: 12,
        reloadSpeed: 1.1,         // 10% faster reload
        style: 'straight'
    }
}

// =============== Skin Library ===============

export const SKIN_LIBRARY: Record<string, SkinConfig> = {
    'default': {
        name: 'Default',
        type: 'solid',
        primaryColor: '#2a2a2a',
        metallic: 0.3,
        roughness: 0.7
    },
    'flux': {
        name: 'Flux',
        type: 'gradient',
        primaryColor: '#0099ff',
        secondaryColor: '#00ffcc',
        metallic: 0.8,
        roughness: 0.2,
        emissive: '#0055aa'
    },
    'gaia': {
        name: 'Gaia',
        type: 'solid',
        primaryColor: '#4a3520',
        metallic: 0.1,
        roughness: 0.9
    },
    'voxel': {
        name: 'Voxel',
        type: 'pattern',
        pattern: 'digital',
        primaryColor: '#ff00ff',
        secondaryColor: '#00ffff',
        patternScale: 1.5,
        metallic: 0.5,
        roughness: 0.5
    },
    'zebra': {
        name: 'Zebra',
        type: 'pattern',
        pattern: 'zebra',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        patternScale: 1.0,
        metallic: 0.0,
        roughness: 0.8
    },
    'slash': {
        name: 'Slash',
        type: 'pattern',
        pattern: 'slash',
        primaryColor: '#ff0000',
        secondaryColor: '#000000',
        patternScale: 0.8,
        metallic: 0.4,
        roughness: 0.6
    }
}

// =============== Helper Functions ===============

/**
 * Get all parts of a specific type
 */
export function getPartsByType(type: 'scope' | 'grip' | 'stock' | 'barrel' | 'magazine' | 'skin'): Record<string, any> {
    switch (type) {
        case 'scope': return SCOPE_LIBRARY
        case 'grip': return GRIP_LIBRARY
        case 'stock': return STOCK_LIBRARY
        case 'barrel': return BARREL_LIBRARY
        case 'magazine': return MAGAZINE_LIBRARY
        case 'skin': return SKIN_LIBRARY
        default: return {}
    }
}

/**
 * Get a specific part by ID and type
 */
export function getPart(type: string, id: string): any | null {
    const library = getPartsByType(type as any)
    return library[id] || null
}

/**
 * Get all part IDs for a type
 */
export function getPartIds(type: string): string[] {
    return Object.keys(getPartsByType(type as any))
}

/**
 * Validate if a part exists
 */
export function partExists(type: string, id: string): boolean {
    return getPart(type, id) !== null
}
