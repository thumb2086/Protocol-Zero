/**
 * Protocol: Zero - Blueprint Type Definitions
 * 完整的武器藍圖型別定義系統
 */

// =============== Core Blueprint Interface ===============

export interface WeaponBlueprint {
    id: string                    // Unique identifier, e.g., "community_vandal_001"
    name: string                  // Display name, e.g., "Fusion Vandal"
    author: string                // GitHub username or creator name
    type: WeaponType              // Weapon category
    baseModel: BaseModel          // Which base model to use

    components: WeaponComponents  // All weapon parts configuration
    stats: WeaponStats            // Base weapon statistics
    skin?: SkinConfig             // Optional skin/texture configuration

    createdAt: string             // ISO timestamp
    version: string               // Blueprint version, e.g., "1.0.0"
}

// =============== Enums & Union Types ===============

export type WeaponType = 'rifle' | 'smg' | 'pistol' | 'sniper' | 'shotgun'
export type BaseModel = 'vandal' | 'phantom' | 'classic'
export type ScopeType = 'red_dot' | 'holo' | 'sniper' | 'acog'
export type GripType = 'vertical' | 'angled' | 'stub'
export type StockType = 'fixed' | 'collapsible' | 'heavy'
export type BarrelType = 'standard' | 'long' | 'short' | 'silenced'

// =============== Component Configurations ===============

export interface WeaponComponents {
    receiver: ReceiverConfig
    barrel: BarrelConfig
    stock?: StockConfig           // Optional for pistols
    magazine: MagazineConfig
    scope?: ScopeConfig           // Optional attachment
    grip?: GripConfig             // Optional attachment
}

export interface ReceiverConfig {
    style: BaseModel              // 'vandal', 'phantom', 'classic'
    material?: string             // Material override
    color?: string                // Color hex code
}

export interface BarrelConfig {
    type: BarrelType
    length: number                // In game units (0.5 - 1.5)
    rangeModifier: number         // Multiplier for effective range (0.8 - 1.3)
    velocityModifier: number      // Multiplier for bullet velocity (0.9 - 1.2)
}

export interface StockConfig {
    type: StockType
    recoilReduction: number       // Percentage (0 - 0.25)
    aimStability: number          // Percentage (0 - 0.20)
}

export interface MagazineConfig {
    capacity: number              // Bullet count (15 - 50)
    reloadSpeed: number           // Multiplier (0.8 - 1.2)
    style: 'curved' | 'straight' | 'drum'
}

export interface ScopeConfig {
    type: ScopeType
    magnification: number         // 1.0 (none) to 8.0 (sniper)
    adsSpeed: number              // ADS speed multiplier (0.5 - 1.0)
    clarity: number               // Visual clarity (0.5 - 1.0)
}

export interface GripConfig {
    type: GripType
    recoilReduction: number       // Horizontal recoil reduction (0 - 0.15)
    adsMovement: number           // Movement speed while ADS (0.7 - 1.0)
}

// =============== Weapon Statistics ===============

export interface WeaponStats {
    // Core Stats
    damage: number                // Base damage per shot (10 - 100)
    fireRate: number              // Rounds per minute (200 - 1200)
    range: number                 // Effective range in meters (10 - 100)

    // Accuracy
    firstShotSpread: number       // Initial accuracy (0 - 0.5)
    hipfireSpread: number         // Hipfire spread (0.5 - 2.0)

    // Recoil
    recoilPattern: number[][]     // [[x, y], ...] pattern coordinates
    recoilRecovery: number        // Recovery speed (0.1 - 1.0)

    // Penetration
    penetration: number           // Wall penetration power (0 - 100)
    armorPiercing: number         // Armor damage multiplier (0.5 - 1.5)

    // Magazine
    magazineSize: number          // Bullets per magazine
    reserveAmmo: number           // Total reserve bullets
    reloadTime: number            // Seconds to reload

    // Movement
    movementSpeed: number         // Movement speed multiplier (0.7 - 1.0)
    adsSpeed: number              // Aim down sight speed (0.2 - 0.8 seconds)
}

// =============== Skin Configuration ===============

export interface SkinConfig {
    name: string                  // Skin name
    type: 'solid' | 'gradient' | 'pattern' | 'procedural'

    // Color options
    primaryColor?: string         // Hex color
    secondaryColor?: string       // For gradients/patterns

    // Pattern options
    pattern?: 'slash' | 'zebra' | 'camouflage' | 'digital'
    patternScale?: number         // Pattern size (0.5 - 2.0)

    // Material properties
    metallic?: number             // Metallic factor (0 - 1)
    roughness?: number            // Roughness (0 - 1)
    emissive?: string             // Emissive color (for glowing parts)
}

// =============== Validation Result ===============

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings?: string[]
}

// =============== Blueprint Metadata ===============

export interface BlueprintMetadata {
    downloads: number
    rating: number                // 1-5 stars
    verified: boolean             // Official verification
    tags: string[]                // e.g., ['close-range', 'high-damage']
}

// =============== Export Helpers ===============

/**
 * Create a default weapon blueprint with sensible defaults
 */
export function createDefaultBlueprint(baseModel: BaseModel): WeaponBlueprint {
    return {
        id: `custom_${baseModel}_${Date.now()}`,
        name: `Custom ${baseModel.charAt(0).toUpperCase() + baseModel.slice(1)}`,
        author: 'local',
        type: baseModel === 'classic' ? 'pistol' : 'rifle',
        baseModel,
        components: {
            receiver: { style: baseModel },
            barrel: { type: 'standard', length: 1.0, rangeModifier: 1.0, velocityModifier: 1.0 },
            magazine: { capacity: 25, reloadSpeed: 1.0, style: 'straight' }
        },
        stats: getDefaultStats(baseModel),
        createdAt: new Date().toISOString(),
        version: '1.0.0'
    }
}

/**
 * Get default stats for a base model
 */
function getDefaultStats(baseModel: BaseModel): WeaponStats {
    const defaults: Record<BaseModel, Partial<WeaponStats>> = {
        vandal: {
            damage: 40,
            fireRate: 600,
            range: 50,
            magazineSize: 25,
            reserveAmmo: 100
        },
        phantom: {
            damage: 35,
            fireRate: 660,
            range: 40,
            magazineSize: 30,
            reserveAmmo: 120
        },
        classic: {
            damage: 35,
            fireRate: 400,
            range: 30,
            magazineSize: 12,
            reserveAmmo: 48
        }
    }

    return {
        damage: defaults[baseModel].damage || 35,
        fireRate: defaults[baseModel].fireRate || 600,
        range: defaults[baseModel].range || 40,
        firstShotSpread: 0.1,
        hipfireSpread: 1.0,
        recoilPattern: [[0, 1], [0.5, 2], [-0.5, 2.5]],
        recoilRecovery: 0.5,
        penetration: 50,
        armorPiercing: 1.0,
        magazineSize: defaults[baseModel].magazineSize || 25,
        reserveAmmo: defaults[baseModel].reserveAmmo || 100,
        reloadTime: 2.5,
        movementSpeed: 0.9,
        adsSpeed: 0.4
    }
}
