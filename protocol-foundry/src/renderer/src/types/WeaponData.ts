/**
 * Protocol-Foundry Type Definitions
 * Data structures for parametric weapon generation
 */

export interface ComponentSpec {
    // Dimensions
    length?: number;
    width?: number;
    height?: number;
    diameter?: number;
    depth?: number;

    // Shape modifiers
    fillet?: number;
    curve?: number;

    // References
    profile?: string; // Reference to profile file

    // Component-specific
    capacity?: number; // For magazines
}

export interface MountPoint {
    position: [number, number, number]; // [x, y, z]
    rotation?: [number, number, number]; // Optional euler angles
}

export interface WeaponBlueprint {
    name: string;
    type: 'pistol' | 'rifle' | 'smg' | 'sniper' | 'shotgun';
    description?: string;

    // Component specifications
    components: {
        receiver: ComponentSpec;
        barrel: ComponentSpec;
        stock?: ComponentSpec;
        magazine: ComponentSpec;
        grip?: ComponentSpec;
        suppressor?: ComponentSpec;
        [key: string]: ComponentSpec | undefined; // Allow custom components
    };

    // Mount points for assembly
    mountPoints: {
        barrelMount: [number, number, number];
        stockMount?: [number, number, number];
        magazineMount: [number, number, number];
        gripMount?: [number, number, number];
        suppressorMount?: [number, number, number];
        [key: string]: [number, number, number] | undefined;
    };

    // Global settings
    scale?: number; // Overall scale factor
    skin?: string; // Procedural skin pattern (e.g., "slash", "zebra")
}

export interface MaterialSpec {
    color: [number, number, number]; // RGB [0-1]
    emissive?: [number, number, number]; // Emissive color
    metallic?: number; // Metallic factor [0-1]
    roughness?: number; // Roughness factor [0-1]
    specular?: [number, number, number]; // Specular color
}

export interface PartData {
    id: string; // Unique identifier
    name: string; // Display name
    type: 'receiver' | 'barrel' | 'stock' | 'magazine' | 'grip' | 'suppressor' | 'custom';
    spec: ComponentSpec;
    material: MaterialSpec;
    createdAt?: string; // ISO timestamp
    author?: string; // Creator name
}

export interface WeaponBuild {
    id: string; // Unique identifier
    name: string; // Display name
    description?: string;
    baseBlueprint?: string; // Optional base blueprint reference

    // Part references (can be blueprint parts or custom parts)
    parts: {
        receiver: string; // part ID or "blueprint:receiver"
        barrel: string;
        stock?: string;
        magazine: string;
        grip?: string;
        suppressor?: string;
        [key: string]: string | undefined;
    };

    // Metadata
    createdAt?: string;
    author?: string;
    tags?: string[];
}

export interface Profile2D {
    name: string;
    type: '2d_profile' | 'lathe_profile';
    description?: string;
    parameters?: Record<string, number>;
    points: [number, number][]; // Array of [x, y] coordinates
}

// Validation rules (for GitHub sync)
export interface ValidationRules {
    maxComponentSize: number; // Maximum dimension in any axis
    maxMagazineCapacity: number; // Prevent cheat values
    allowedProfiles: string[]; // Whitelist of allowed profiles
}

export const DEFAULT_VALIDATION_RULES: ValidationRules = {
    maxComponentSize: 100,
    maxMagazineCapacity: 50,
    allowedProfiles: ['rectangle', 'barrel', 'ak_grip', 'pistol_grip', 'tactical_grip']
};
