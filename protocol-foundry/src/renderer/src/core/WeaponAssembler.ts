/**
 * WeaponAssembler - Assembles weapons from blueprints or custom builds
 * Handles mount point positioning and mesh merging
 */

import { Mesh, Scene, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { ComponentFactory } from './factory/ComponentFactory';
import { ProfileLib } from './factory/ProfileLib';
import type { WeaponBlueprint, WeaponBuild, PartData, ComponentSpec } from '../types/WeaponData';

export class WeaponAssembler {
    private factory: ComponentFactory;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.factory = new ComponentFactory(scene);
    }

    /**
     * Assemble a weapon from a blueprint
     */
    assembleFromBlueprint(blueprint: WeaponBlueprint): Mesh {
        console.log(`[WeaponAssembler] Assembling weapon from blueprint: ${blueprint.name}`);

        const root = new Mesh(`${blueprint.name}_Root`, this.scene);
        const parts: Mesh[] = [];

        // Create materials
        const materials = this.createDefaultMaterials();

        // Build receiver (main body)
        if (blueprint.components.receiver) {
            const receiver = this.buildComponent(
                'Receiver',
                'receiver',
                blueprint.components.receiver,
                materials.receiver
            );
            receiver.parent = root;
            parts.push(receiver);
        }

        // Build barrel
        if (blueprint.components.barrel && blueprint.mountPoints.barrelMount) {
            const barrel = this.buildComponent(
                'Barrel',
                'barrel',
                blueprint.components.barrel,
                materials.barrel
            );
            const mountPos = Vector3.FromArray(blueprint.mountPoints.barrelMount);
            this.attachPart(barrel, root, mountPos);
            parts.push(barrel);
        }

        // Build stock (if exists)
        if (blueprint.components.stock && blueprint.mountPoints.stockMount) {
            const stock = this.buildComponent(
                'Stock',
                'stock',
                blueprint.components.stock,
                materials.stock
            );
            const mountPos = Vector3.FromArray(blueprint.mountPoints.stockMount);
            this.attachPart(stock, root, mountPos);
            parts.push(stock);
        }

        // Build magazine
        if (blueprint.components.magazine && blueprint.mountPoints.magazineMount) {
            const magazine = this.buildComponent(
                'Magazine',
                'magazine',
                blueprint.components.magazine,
                materials.magazine
            );
            const mountPos = Vector3.FromArray(blueprint.mountPoints.magazineMount);

            // Apply curve if specified
            if (blueprint.components.magazine.curve) {
                const curvedPath = ProfileLib.getCurvedMagPath(
                    blueprint.components.magazine.length || 10,
                    blueprint.components.magazine.curve,
                    8
                );
                // Recreate magazine with curved path
                const magShape = ProfileLib.getRectangleProfile(
                    blueprint.components.magazine.width || 2,
                    blueprint.components.magazine.height || 4,
                    0.2
                );
                magazine.dispose();
                const curvedMag = this.factory.extrudePath('Magazine', magShape, curvedPath, materials.magazine);
                curvedMag.rotation.x = Math.PI;
                this.attachPart(curvedMag, root, mountPos);
                parts.push(curvedMag);
            } else {
                this.attachPart(magazine, root, mountPos);
                parts.push(magazine);
            }
        }

        // Build grip (if exists)
        if (blueprint.components.grip && blueprint.mountPoints.gripMount) {
            const grip = this.buildComponent(
                'Grip',
                'grip',
                blueprint.components.grip,
                materials.grip
            );
            const mountPos = Vector3.FromArray(blueprint.mountPoints.gripMount);
            // Rotate grip to face downward
            grip.rotation.y = Math.PI / 2;
            this.attachPart(grip, root, mountPos);
            parts.push(grip);
        }

        // Build suppressor (if exists)
        if (blueprint.components.suppressor && blueprint.mountPoints.suppressorMount) {
            const suppressor = this.buildComponent(
                'Suppressor',
                'suppressor',
                blueprint.components.suppressor,
                materials.barrel
            );
            const mountPos = Vector3.FromArray(blueprint.mountPoints.suppressorMount);
            this.attachPart(suppressor, root, mountPos);
            parts.push(suppressor);
        }

        // Apply global scale
        if (blueprint.scale) {
            root.scaling = new Vector3(blueprint.scale, blueprint.scale, blueprint.scale);
        }

        console.log(`[WeaponAssembler] Assembled ${parts.length} parts for ${blueprint.name}`);
        return root;
    }

    /**
     * Build a component from its specification
     */
    private buildComponent(
        name: string,
        type: string,
        spec: ComponentSpec,
        material: StandardMaterial
    ): Mesh {
        // MVP: Blocky Style for Barrel/Suppressor
        if (type === 'barrel' || type === 'suppressor') {
            const mesh = this.factory.createCylinder(name, {
                height: spec.length || 40,
                diameter: spec.diameter || 1.5
            }, material);
            // createCylinder already rotates it to Z axis
            return mesh;
        }

        // For grip components, keep using profile extrusion for ergonomics
        if (type === 'grip') {
            const profile = this.getGripProfile(spec);
            const mesh = this.factory.extrudePart(name, profile, spec.depth || 2.5, material);
            return mesh;
        }

        // MVP: Blocky Style for Receiver, Magazine, Stock
        // Use simple Box instead of profile extrusion
        const mesh = this.factory.createBox(name, {
            width: spec.width || 4,
            height: spec.height || 6,
            depth: spec.length || 10
        }, material);

        return mesh;
    }

    /**
     * Get barrel profile from spec
     */
    private getBarrelProfile(spec: ComponentSpec): Vector3[] {
        const diameter = spec.diameter || 1.5;
        const length = spec.length || 40;

        // Simple barrel profile
        return [
            new Vector3(0, 0, 0),
            new Vector3(diameter * 0.5, 0, 0),
            new Vector3(diameter * 0.5, length * 0.9, 0),
            new Vector3(diameter * 0.4, length * 0.95, 0),
            new Vector3(diameter * 0.4, length, 0),
            new Vector3(0, length, 0)
        ];
    }

    /**
     * Get grip profile from spec
     */
    private getGripProfile(spec: ComponentSpec): Vector3[] {
        // Use predefined profile or create default
        if (spec.profile === 'ak_grip') {
            return ProfileLib.getAKGripProfile();
        } else if (spec.profile === 'pistol_grip') {
            return ProfileLib.getPistolGripProfile();
        } else if (spec.profile === 'tactical_grip') {
            return ProfileLib.getTacticalGripProfile();
        }

        // Default grip profile
        return ProfileLib.getAKGripProfile();
    }

    /**
     * Create default materials for weapon parts
     */
    private createDefaultMaterials(): Record<string, StandardMaterial> {
        const matReceiver = new StandardMaterial('mat_receiver', this.scene);
        matReceiver.diffuseColor = new Color3(0.15, 0.15, 0.18);

        const matBarrel = new StandardMaterial('mat_barrel', this.scene);
        matBarrel.diffuseColor = new Color3(0.1, 0.1, 0.1);
        matBarrel.specularColor = new Color3(0.3, 0.3, 0.3);

        const matStock = new StandardMaterial('mat_stock', this.scene);
        matStock.diffuseColor = new Color3(0.18, 0.16, 0.14);

        const matMag = new StandardMaterial('mat_mag', this.scene);
        matMag.diffuseColor = new Color3(0.2, 0.2, 0.2);

        const matGrip = new StandardMaterial('mat_grip', this.scene);
        matGrip.diffuseColor = new Color3(0.1, 0.1, 0.1);

        return {
            receiver: matReceiver,
            barrel: matBarrel,
            stock: matStock,
            magazine: matMag,
            grip: matGrip
        };
    }

    /**
     * Attach a part to a parent at a specific mount point
     */
    private attachPart(part: Mesh, parent: Mesh, mountPoint: Vector3): void {
        part.parent = parent;
        part.position = mountPoint;
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

    /**
     * Merge all parts into a single optimized mesh (future optimization)
     */
    private mergeParts(parts: Mesh[]): Mesh {
        // TODO: Use Mesh.MergeMeshes for performance optimization
        // For now, keep parts separate for easier debugging
        console.log('[WeaponAssembler] Mesh merging not yet implemented');
        return parts[0]; // Return first part as placeholder
    }
}
