import { Mesh, MeshBuilder, Vector3, StandardMaterial, PBRMaterial, CSG, Scene, Color3, TransformNode } from "@babylonjs/core";
import earcut from "earcut";

// Inject earcut for Babylon.js ExtrudePolygon
if (typeof window !== "undefined" && !(window as any).earcut) {
    (window as any).earcut = earcut;
}

export class ComponentFactory {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * MVP: Simple Box (Blocky Style)
     * Creates a simple box mesh for receivers, magazines, etc.
     */
    createBox(name: string, options: { width: number; height: number; depth: number }, material?: PBRMaterial): Mesh {
        const mesh = MeshBuilder.CreateBox(name, {
            width: options.width,
            height: options.height,
            depth: options.depth
        }, this.scene);

        mesh.createNormals(true);

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new PBRMaterial(name + "_mat", this.scene);
            defaultMat.albedoColor = new Color3(0.5, 0.5, 0.5);
            defaultMat.roughness = 0.7;
            defaultMat.metallic = 0.2;
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * MVP: Simple Cylinder (Blocky Style)
     * Creates a simple cylinder for barrels, scopes, etc.
     */
    createCylinder(name: string, options: { height: number; diameter: number }, material?: PBRMaterial): Mesh {
        // Babylon's cylinder height is along Y axis, we usually want Z for guns
        const mesh = MeshBuilder.CreateCylinder(name, {
            height: options.height,
            diameter: options.diameter,
            tessellation: 16 // Low-poly look
        }, this.scene);

        mesh.createNormals(true);

        // Rotate to align with Z axis by default
        mesh.rotation.x = Math.PI / 2;

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new PBRMaterial(name + "_mat", this.scene);
            defaultMat.albedoColor = new Color3(0.2, 0.2, 0.2);
            defaultMat.roughness = 0.6;
            defaultMat.metallic = 0.8;
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * Machine A: The Extruder (Linear Parts)
     * Extrudes a 2D profile into a 3D shape along the Z axis.
     */
    extrudePart(name: string, profile: Vector3[], depth: number, material?: PBRMaterial): Mesh {
        // Use ExtrudeShape with a straight path along Z axis.
        // This ensures the profile (XY) is extruded into depth (Z).
        const path = [
            new Vector3(0, 0, 0),
            new Vector3(0, 0, depth)
        ];

        const mesh = MeshBuilder.ExtrudeShape(name, {
            shape: profile,
            path: path,
            sideOrientation: Mesh.DOUBLESIDE,
            cap: Mesh.CAP_ALL
        }, this.scene);

        mesh.createNormals(true);

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new PBRMaterial(name + "_mat", this.scene);
            defaultMat.albedoColor = new Color3(0.5, 0.5, 0.5);
            defaultMat.roughness = 0.7;
            defaultMat.metallic = 0.2;
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * Machine B: The Lathe (Round Parts)
     * Revolves a profile around an axis.
     */
    lathePart(name: string, profileShape: Vector3[], segments: number = 16, material?: PBRMaterial): Mesh {
        // CreateLathe revolves the shape around Y axis by default.
        const mesh = MeshBuilder.CreateLathe(name, {
            shape: profileShape,
            tessellation: segments,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);

        mesh.createNormals(true);

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new PBRMaterial(name + "_mat", this.scene);
            defaultMat.albedoColor = new Color3(0.2, 0.2, 0.2);
            defaultMat.roughness = 0.6;
            defaultMat.metallic = 0.8;
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * Machine D: The Pipe Bender (Extrude Path)
     * Extrudes a shape along a path.
     */
    extrudePath(name: string, shape: Vector3[], path: Vector3[], material: PBRMaterial): Mesh {
        const mesh = MeshBuilder.ExtrudeShape(name, {
            shape: shape,
            path: path,
            sideOrientation: Mesh.DOUBLESIDE,
            cap: Mesh.CAP_ALL
        }, this.scene);
        mesh.createNormals(true);
        mesh.material = material;
        return mesh;
    }

    /**
     * Machine C: The Miller (CSG/Details)
     * Subtracts the cuttingToolMesh from the baseMesh.
     */
    carveDetail(baseMesh: Mesh, cuttingToolMesh: Mesh, disposeTool: boolean = true): Mesh {
        const baseCSG = CSG.FromMesh(baseMesh);
        const toolCSG = CSG.FromMesh(cuttingToolMesh);

        const resultCSG = baseCSG.subtract(toolCSG);

        // Reconstruct the mesh
        const resultMesh = resultCSG.toMesh(baseMesh.name + "_carved", baseMesh.material, this.scene);

        // Copy transform
        resultMesh.position = baseMesh.position.clone();
        resultMesh.rotation = baseMesh.rotation.clone();
        resultMesh.scaling = baseMesh.scaling.clone();

        // Dispose originals if needed
        baseMesh.dispose();
        if (disposeTool) {
            cuttingToolMesh.dispose();
        }


        return resultMesh;
    }

    // ============================================================
    // COMPONENT-SPECIFIC CREATION METHODS (Mount Point System)
    // ============================================================

    /**
     * Create Receiver with Mount Points
     * The receiver is the main body and contains TransformNode mount points for other components
     */
    createReceiver(id: string, spec: any, material: PBRMaterial): Mesh {
        const width = spec.width || 4;
        const height = spec.height || 6;
        const length = spec.length || 35;

        console.log(`[ComponentFactory] Creating receiver: ${id} (${width}x${height}x${length})`);

        // Create receiver mesh
        const receiverMesh = this.createBox(`${id}_receiver`, { width, height, depth: length }, material);

        // Create mount points as TransformNodes
        const barrelMount = new TransformNode(`${id}_mount_barrel`, this.scene);
        barrelMount.parent = receiverMesh;
        barrelMount.position = new Vector3(0, 0, length / 2); // Front of receiver

        const scopeMount = new TransformNode(`${id}_mount_scope`, this.scene);
        scopeMount.parent = receiverMesh;
        scopeMount.position = new Vector3(0, height / 2, 0); // Top of receiver

        const stockMount = new TransformNode(`${id}_mount_stock`, this.scene);
        stockMount.parent = receiverMesh;
        stockMount.position = new Vector3(0, 0, -length / 2); // Rear of receiver

        const magazineMount = new TransformNode(`${id}_mount_magazine`, this.scene);
        magazineMount.parent = receiverMesh;
        magazineMount.position = new Vector3(0, -height / 2, length * 0.3); // Bottom-center

        const gripMount = new TransformNode(`${id}_mount_grip`, this.scene);
        gripMount.parent = receiverMesh;
        gripMount.position = new Vector3(0, -height / 2, 0); // Bottom-front

        console.log(`[ComponentFactory] Created mount points: mount_barrel, mount_scope, mount_stock, mount_magazine, mount_grip`);

        return receiverMesh;
    }

    /**
     * Create Barrel component
     */
    createBarrel(id: string, spec: any, material: PBRMaterial): Mesh {
        const diameter = spec.diameter || 1.5;
        const length = spec.length || 40;

        console.log(`[ComponentFactory] Creating barrel: ${id} (diameter: ${diameter}, length: ${length})`);

        const barrelMesh = this.createCylinder(`${id}_barrel`, { height: length, diameter }, material);

        // Position barrel so its base is at origin (for proper mount point attachment)
        barrelMesh.position.z = length / 2;

        // Create muzzle flash point at barrel tip
        const muzzleFlashPoint = new TransformNode(`${id}_muzzle_flash_point`, this.scene);
        muzzleFlashPoint.parent = barrelMesh;
        muzzleFlashPoint.position = new Vector3(0, 0, length / 2); // At the tip of the barrel

        console.log(`[ComponentFactory] Created muzzle_flash_point at barrel tip (z: ${length})`);

        return barrelMesh;
    }

    /**
     * Create Scope component
     */
    createScope(id: string, spec: any, material: PBRMaterial): Mesh {
        const diameter = spec.diameter || 2;
        const length = spec.length || 8;

        console.log(`[ComponentFactory] Creating scope: ${id} (diameter: ${diameter}, length: ${length})`);

        const scopeMesh = this.createCylinder(`${id}_scope`, { height: length, diameter }, material);

        // Rotate scope to align horizontally along Z axis
        scopeMesh.rotation.x = Math.PI / 2;
        scopeMesh.position.z = length / 2;

        return scopeMesh;
    }

    /**
     * Create Stock component
     */
    createStock(id: string, spec: any, material: PBRMaterial): Mesh {
        const width = spec.width || 3.5;
        const height = spec.height || 5.5;
        const length = spec.length || 18;

        console.log(`[ComponentFactory] Creating stock: ${id} (${width}x${height}x${length})`);

        const stockMesh = this.createBox(`${id}_stock`, { width, height, depth: length }, material);

        // Position stock so its front is at origin
        stockMesh.position.z = -length / 2;

        return stockMesh;
    }

    /**
     * Create Magazine component
     */
    createMagazine(id: string, spec: any, material: PBRMaterial): Mesh {
        const width = spec.width || 2.5;
        const height = spec.height || 5;
        const length = spec.length || 16;

        console.log(`[ComponentFactory] Creating magazine: ${id} (${width}x${height}x${length})`);

        const magazineMesh = this.createBox(`${id}_magazine`, { width, height, depth: length }, material);

        // Position magazine so its top is at origin
        magazineMesh.position.y = -height / 2;

        return magazineMesh;
    }

    /**
     * Create Grip component
     */
    createGrip(id: string, spec: any, material: PBRMaterial): Mesh {
        const width = spec.width || 2;
        const height = spec.height || 4;
        const depth = spec.depth || 2.5;

        console.log(`[ComponentFactory] Creating grip: ${id} (${width}x${height}x${depth})`);

        const gripMesh = this.createBox(`${id}_grip`, { width, height, depth }, material);

        // Position grip so its top is at origin
        gripMesh.position.y = -height / 2;

        return gripMesh;
    }

    /**
     * Get mount point from receiver by name
     * @param receiverMesh The receiver mesh containing mount points
     * @param mountName Name of the mount point (e.g., "mount_barrel")
     * @returns TransformNode or null if not found
     */
    getMountPoint(receiverMesh: Mesh, mountName: string): TransformNode | null {
        const children = receiverMesh.getChildren();
        for (const child of children) {
            if (child instanceof TransformNode && child.name.endsWith(mountName)) {
                return child;
            }
        }
        console.warn(`[ComponentFactory] Mount point not found: ${mountName}`);
        return null;
    }
}

