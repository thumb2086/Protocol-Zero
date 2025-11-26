import { Mesh, MeshBuilder, Vector3, StandardMaterial, CSG, Scene, Color3 } from "@babylonjs/core";
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
    createBox(name: string, options: { width: number; height: number; depth: number }, material?: StandardMaterial): Mesh {
        const mesh = MeshBuilder.CreateBox(name, {
            width: options.width,
            height: options.height,
            depth: options.depth
        }, this.scene);

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new StandardMaterial(name + "_mat", this.scene);
            defaultMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * MVP: Simple Cylinder (Blocky Style)
     * Creates a simple cylinder for barrels, scopes, etc.
     */
    createCylinder(name: string, options: { height: number; diameter: number }, material?: StandardMaterial): Mesh {
        // Babylon's cylinder height is along Y axis, we usually want Z for guns
        const mesh = MeshBuilder.CreateCylinder(name, {
            height: options.height,
            diameter: options.diameter,
            tessellation: 16 // Low-poly look
        }, this.scene);

        // Rotate to align with Z axis by default
        mesh.rotation.x = Math.PI / 2;

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new StandardMaterial(name + "_mat", this.scene);
            defaultMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * Machine A: The Extruder (Linear Parts)
     * Extrudes a 2D profile into a 3D shape along the Z axis.
     */
    extrudePart(name: string, profile: Vector3[], depth: number, material?: StandardMaterial): Mesh {
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

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new StandardMaterial(name + "_mat", this.scene);
            defaultMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * Machine B: The Lathe (Round Parts)
     * Revolves a profile around an axis.
     */
    lathePart(name: string, profileShape: Vector3[], segments: number = 16, material?: StandardMaterial): Mesh {
        // CreateLathe revolves the shape around Y axis by default.
        const mesh = MeshBuilder.CreateLathe(name, {
            shape: profileShape,
            tessellation: segments,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);

        if (material) {
            mesh.material = material;
        } else {
            const defaultMat = new StandardMaterial(name + "_mat", this.scene);
            defaultMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
            mesh.material = defaultMat;
        }

        return mesh;
    }

    /**
     * Machine D: The Pipe Bender (Extrude Path)
     * Extrudes a shape along a path.
     */
    extrudePath(name: string, shape: Vector3[], path: Vector3[], material: StandardMaterial): Mesh {
        const mesh = MeshBuilder.ExtrudeShape(name, {
            shape: shape,
            path: path,
            sideOrientation: Mesh.DOUBLESIDE,
            cap: Mesh.CAP_ALL
        }, this.scene);
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
}
