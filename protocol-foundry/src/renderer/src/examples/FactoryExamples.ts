/**
 * Example: Creating and Saving a Custom Part
 * 
 * This demonstrates how to create a custom weapon part,
 * save it to the warehouse, and load it back.
 * 
 * Usage: Import this in your component or service
 */

import { partManager } from '../core/PartManager';
import type { PartData } from '../types/WeaponData';

/**
 * Example 1: Create and save a custom red receiver
 */
export async function createCustomReceiver() {
    const customReceiver: PartData = {
        id: 'receiver_red_dragon',
        name: 'Red Dragon Receiver',
        type: 'receiver',
        spec: {
            width: 4.5,
            height: 6.5,
            length: 32,
            fillet: 0.4
        },
        material: {
            color: [0.8, 0.1, 0.1], // Red
            emissive: [0.2, 0, 0],  // Slight red glow
            metallic: 0.6,
            roughness: 0.3
        },
        createdAt: new Date().toISOString(),
        author: 'Player1'
    };

    const success = await partManager.savePart(customReceiver);
    if (success) {
        console.log('✅ Custom receiver saved to warehouse!');
    } else {
        console.error('❌ Failed to save custom receiver');
    }

    return customReceiver;
}

/**
 * Example 2: Create a custom golden barrel
 */
export async function createGoldenBarrel() {
    const goldenBarrel: PartData = {
        id: 'barrel_golden_eagle',
        name: 'Golden Eagle Barrel',
        type: 'barrel',
        spec: {
            diameter: 1.8,
            length: 50,
            profile: 'barrel'
        },
        material: {
            color: [0.8, 0.7, 0.2], // Gold
            specular: [1, 1, 0.5],
            metallic: 0.9,
            roughness: 0.1
        },
        createdAt: new Date().toISOString(),
        author: 'Player1'
    };

    await partManager.savePart(goldenBarrel);
    console.log('✅ Golden barrel saved!');
    return goldenBarrel;
}

/**
 * Example 3: Create a custom extended magazine
 */
export async function createExtendedMagazine() {
    const extendedMag: PartData = {
        id: 'mag_drum_60',
        name: '60-Round Drum Magazine',
        type: 'magazine',
        spec: {
            width: 3,
            height: 5,
            length: 18,
            capacity: 50, // Max allowed by validation
            curve: 0.314 // Slight curve
        },
        material: {
            color: [0.1, 0.1, 0.1], // Black
            metallic: 0.4,
            roughness: 0.7
        },
        createdAt: new Date().toISOString(),
        author: 'Player1'
    };

    await partManager.savePart(extendedMag);
    console.log('✅ Extended magazine saved!');
    return extendedMag;
}

/**
 * Example 4: Load all custom parts
 */
export async function listMyParts() {
    const parts = await partManager.listParts();
    console.log(`📦 Found ${parts.length} custom parts in warehouse:`);
    parts.forEach(part => {
        console.log(`  - ${part.name} (${part.type})`);
    });
    return parts;
}

/**
 * Example 5: Create a complete custom build
 */
export async function createCustomBuild() {
    const build = {
        id: 'build_dragon_slayer',
        name: 'Dragon Slayer',
        description: 'A custom red and gold rifle with extended magazine',
        baseBlueprint: 'vandal',
        parts: {
            receiver: 'receiver_red_dragon',    // Custom part
            barrel: 'barrel_golden_eagle',      // Custom part
            stock: 'blueprint:stock',           // Use blueprint default
            magazine: 'mag_drum_60',            // Custom part
            grip: 'blueprint:grip'              // Use blueprint default
        },
        createdAt: new Date().toISOString(),
        author: 'Player1',
        tags: ['custom', 'gold', 'red', 'extended-mag']
    };

    const success = await partManager.saveBuild(build);
    if (success) {
        console.log('✅ Custom build "Dragon Slayer" saved!');
    }

    return build;
}

/**
 * Example 6: Load and display weapon blueprints
 */
export async function showAvailableBlueprints() {
    const blueprints = await partManager.listBlueprints();
    console.log('📘 Available weapon blueprints:');
    blueprints.forEach(name => console.log(`  - ${name}`));

    // Load one blueprint
    if (blueprints.includes('vandal')) {
        const vandal = await partManager.loadBlueprint('vandal');
        if (vandal) {
            console.log('📘 Vandal blueprint loaded:', vandal);
        }
    }
}

/**
 * Run all examples
 */
export async function runFactoryExamples() {
    console.log('🏭 Protocol-Foundry Examples Starting...\n');

    // Show available blueprints
    await showAvailableBlueprints();
    console.log('');

    // Create custom parts
    await createCustomReceiver();
    await createGoldenBarrel();
    await createExtendedMagazine();
    console.log('');

    // List all parts
    await listMyParts();
    console.log('');

    // Create custom build
    await createCustomBuild();
    console.log('');

    console.log('🎉 Factory examples completed!');
}
