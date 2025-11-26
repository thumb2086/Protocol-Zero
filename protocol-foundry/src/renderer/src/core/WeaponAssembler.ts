/**
 * WeaponAssembler - Assembles weapons from blueprints or custom builds
 * Handles mount point positioning and mesh merging
 */

import { Mesh, Scene, Vector3, StandardMaterial, PBRMaterial, Color3 } from '@babylonjs/core';
import { ComponentFactory } from './factory/ComponentFactory';
import { ProfileLib } from './factory/ProfileLib';
import { SkinSystem } from './SkinSystem';
import type { WeaponBlueprint, WeaponBuild, PartData, ComponentSpec } from '../types/WeaponData';

export class WeaponAssembler {
    private factory: ComponentFactory;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.factory = new ComponentFactory(scene);
    }

    /**
     * Assemble a weapon from a blueprint using mount point system
     */
    assembleFromBlueprint(blueprint: WeaponBlueprint): Mesh {
        console.log(`[WeaponAssembler] Assembling weapon from blueprint: ${blueprint.name}`);

        const root = new Mesh(`${blueprint.name}_Root`, this.scene);
        const weaponId = blueprint.name.toLowerCase();

        // Create materials
        const materials = this.createDefaultMaterials();

        // Apply skin if specified
        if (blueprint.skin) {
            console.log(`[WeaponAssembler] Applying skin: ${blueprint.skin}`);
            const skinTexture = SkinSystem.generateSkin(blueprint.skin, this.scene);

            if (skinTexture) {
                // Apply to all materials
                Object.values(materials).forEach(mat => {
                    mat.albedoTexture = skinTexture;
                });
            }
        }

        // ============================================================
        // STEP 1: Create Receiver (contains mount points)
        // ============================================================
        let receiver: Mesh | null = null;
        if (blueprint.components.receiver) {
            receiver = this.factory.createReceiver(
                weaponId,
                blueprint.components.receiver,
                materials.receiver
            );
            receiver.parent = root;
            console.log(`[WeaponAssembler] Created receiver with mount points`);
        }

        if (!receiver) {
            console.error('[WeaponAssembler] Cannot assemble weapon without receiver');
            return root;
        }

        // ============================================================
        // STEP 2: Attach components to mount points
        // ============================================================

        // Attach Barrel to mount_barrel
        if (blueprint.components.barrel) {
            const barrelMount = this.factory.getMountPoint(receiver, 'mount_barrel');
            if (barrelMount) {
                const barrel = this.factory.createBarrel(
                    weaponId,
                    blueprint.components.barrel,
                    materials.barrel
                );
                barrel.parent = barrelMount;
                barrel.position = Vector3.Zero(); // Position relative to mount point
                console.log(`[WeaponAssembler] Attached barrel to mount_barrel`);
            }
        }

        // Attach Stock to mount_stock (if exists)
        if (blueprint.components.stock) {
            const stockMount = this.factory.getMountPoint(receiver, 'mount_stock');
            if (stockMount) {
                const stock = this.factory.createStock(
                    weaponId,
                    blueprint.components.stock,
                    materials.stock
                );
                stock.parent = stockMount;
                stock.position = Vector3.Zero();
                console.log(`[WeaponAssembler] Attached stock to mount_stock`);
            }
        }

        // Attach Magazine to mount_magazine
        if (blueprint.components.magazine) {
            const magazineMount = this.factory.getMountPoint(receiver, 'mount_magazine');
            if (magazineMount) {
                const magazine = this.factory.createMagazine(
                    weaponId,
                    blueprint.components.magazine,
                    materials.magazine
                );
                magazine.parent = magazineMount;
                magazine.position = Vector3.Zero();
                console.log(`[WeaponAssembler] Attached magazine to mount_magazine`);
            }
        }

        // Attach Grip to mount_grip (if exists)
        if (blueprint.components.grip) {
            const gripMount = this.factory.getMountPoint(receiver, 'mount_grip');
            if (gripMount) {
                const grip = this.factory.createGrip(
                    weaponId,
                    blueprint.components.grip,
                    materials.grip
                );
                grip.parent = gripMount;
                grip.position = Vector3.Zero();
                console.log(`[WeaponAssembler] Attached grip to mount_grip`);
            }
        }

        // Apply global scale
        if (blueprint.scale) {
            root.scaling = new Vector3(blueprint.scale, blueprint.scale, blueprint.scale);
        }

        console.log(`[WeaponAssembler] Assembly complete for ${blueprint.name}`);
        return root;
    }


    /**
     * Swap a component on an assembled weapon
     * Allows hot-swapping parts without rebuilding the entire weapon
     */
    swapComponent(
        weaponRoot: Mesh,
        componentType: 'barrel' | 'scope' | 'stock' | 'magazine' | 'grip',
        weaponId: string,
        newSpec: ComponentSpec,
        material: PBRMaterial
    ): void {
        console.log(`[WeaponAssembler] Swapping ${componentType} on weapon`);

        // Find receiver (should be first child of root)
        const receiver = weaponRoot.getChildren().find(child =>
            child instanceof Mesh && child.name.includes('receiver')
        ) as Mesh;

        if (!receiver) {
            console.error('[WeaponAssembler] Cannot swap component: receiver not found');
            return;
        }

        // Get the appropriate mount point
        const mountName = `mount_${componentType}`;
        const mountPoint = this.factory.getMountPoint(receiver, mountName);

        if (!mountPoint) {
            console.error(`[WeaponAssembler] Cannot swap component: ${mountName} not found`);
            return;
        }

        // Remove old component
        const oldComponent = mountPoint.getChildren().find(child => child instanceof Mesh) as Mesh;
        if (oldComponent) {
            console.log(`[WeaponAssembler] Disposing old ${componentType}`);
            oldComponent.dispose();
        }

        // Create and attach new component
        let newComponent: Mesh;
        switch (componentType) {
            case 'barrel':
                newComponent = this.factory.createBarrel(weaponId, newSpec, material);
                break;
            case 'scope':
                newComponent = this.factory.createScope(weaponId, newSpec, material);
                break;
            case 'stock':
                newComponent = this.factory.createStock(weaponId, newSpec, material);
                break;
            case 'magazine':
                newComponent = this.factory.createMagazine(weaponId, newSpec, material);
                break;
            case 'grip':
                newComponent = this.factory.createGrip(weaponId, newSpec, material);
                break;
            default:
                console.error(`[WeaponAssembler] Unknown component type: ${componentType}`);
                return;
        }

        newComponent.parent = mountPoint;
        newComponent.position = Vector3.Zero();
        console.log(`[WeaponAssembler] Successfully swapped ${componentType}`);
    }

    /**
     * Remove a component from an assembled weapon
     */
    removeComponent(weaponRoot: Mesh, componentType: string): void {
        console.log(`[WeaponAssembler] Removing ${componentType} from weapon`);

        // Find receiver
        const receiver = weaponRoot.getChildren().find(child =>
            child instanceof Mesh && child.name.includes('receiver')
        ) as Mesh;

        if (!receiver) {
            console.error('[WeaponAssembler] Cannot remove component: receiver not found');
            return;
        }

        // Get mount point
        const mountName = `mount_${componentType}`;
        const mountPoint = this.factory.getMountPoint(receiver, mountName);

        if (!mountPoint) {
            console.error(`[WeaponAssembler] Cannot remove component: ${mountName} not found`);
            return;
        }

        // Dispose component
        const component = mountPoint.getChildren().find(child => child instanceof Mesh) as Mesh;
        if (component) {
            component.dispose();
            console.log(`[WeaponAssembler] Successfully removed ${componentType}`);
        } else {
            console.warn(`[WeaponAssembler] No component found at ${mountName}`);
        }
    }

    /**
     * Create default materials for weapon parts
     */
    private createDefaultMaterials(): Record<string, PBRMaterial> {
        const matReceiver = new PBRMaterial('mat_receiver', this.scene);
        matReceiver.albedoColor = new Color3(0.15, 0.15, 0.18);
        matReceiver.roughness = 0.8; // Debug
        matReceiver.metallic = 0;    // Debug
        matReceiver.emissiveColor = Color3.Black();

        const matBarrel = new PBRMaterial('mat_barrel', this.scene);
        matBarrel.albedoColor = new Color3(0.1, 0.1, 0.1);
        matBarrel.roughness = 0.8; // Debug
        matBarrel.metallic = 0;    // Debug
        matBarrel.emissiveColor = Color3.Black();

        const matStock = new PBRMaterial('mat_stock', this.scene);
        matStock.albedoColor = new Color3(0.18, 0.16, 0.14);
        matStock.roughness = 0.8; // Debug
        matStock.metallic = 0;    // Debug
        matStock.emissiveColor = Color3.Black();

        const matMag = new PBRMaterial('mat_mag', this.scene);
        matMag.albedoColor = new Color3(0.2, 0.2, 0.2);
        matMag.roughness = 0.8; // Debug
        matMag.metallic = 0;    // Debug
        matMag.emissiveColor = Color3.Black();

        const matGrip = new PBRMaterial('mat_grip', this.scene);
        matGrip.albedoColor = new Color3(0.1, 0.1, 0.1);
        matGrip.roughness = 0.8; // Debug
        matGrip.metallic = 0;    // Debug
        matGrip.emissiveColor = Color3.Black();

        return {
            receiver: matReceiver,
            barrel: matBarrel,
            stock: matStock,
            magazine: matMag,
            grip: matGrip
        };
    }

    /**
     * Assemble weapon from custom build (future implementation)
     */
    async assembleFromBuild(build: WeaponBuild, parts: Map<string, PartData>): Promise<Mesh> {
        console.log(`[WeaponAssembler] Custom build assembly not yet implemented: ${build.name}`);

        // TODO: Implement custom build assembly
        // For now, return empty mesh
        const root = new Mesh(`${build.name}_Root`, this.scene);
        return root;
    }
}

