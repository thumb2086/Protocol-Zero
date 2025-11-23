import {
    Mesh,
    MeshBuilder,
    Vector3,
    Scene,
    StandardMaterial,
    Color3,
    Path3D,
    Curve3
} from "@babylonjs/core";
import { Profiles } from "./profiles";

export interface WeaponPartConfig {
    name: string;
    type: "extrusion" | "loft" | "custom"; // 'custom' for things like lofts or specific shapes
    profile?: string; // Key in Profiles
    profileParams?: any[]; // Arguments for the profile function
    profileB?: string; // For Loft: End profile
    profileBParams?: any[]; // For Loft: End profile params
    customProfile?: Vector3[]; // Direct point array
    customProfileB?: Vector3[]; // For Loft: End custom profile
    path?: Vector3[]; // For ExtrudeShape
    length?: number; // For simple ExtrudePolygon (depth)
    position?: { x: number, y: number, z: number };
    rotation?: { x: number, y: number, z: number };
    scaling?: { x: number, y: number, z: number };
    color?: string; // Hex color
    parent?: string; // Name of parent part
    bevel?: boolean; // For extrusion
}

export interface WeaponBlueprint {
    name: string;
    parts: WeaponPartConfig[];
}

export class WeaponArchitect {
    private scene: Scene;
    private materials: Map<string, StandardMaterial> = new Map();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public build(blueprint: WeaponBlueprint): Mesh {
        const root = new Mesh(blueprint.name, this.scene);
        const partsMap = new Map<string, Mesh>();

        blueprint.parts.forEach(partConfig => {
            let mesh: Mesh | null = null;

            if (partConfig.type === "extrusion") {
                mesh = this.buildExtrusion(partConfig);
            } else if (partConfig.type === "loft") {
                mesh = this.buildLoft(partConfig);
            }

            if (mesh) {
                mesh.name = partConfig.name;

                // Transform
                if (partConfig.position) {
                    mesh.position = new Vector3(partConfig.position.x, partConfig.position.y, partConfig.position.z);
                }
                if (partConfig.rotation) {
                    mesh.rotation = new Vector3(partConfig.rotation.x, partConfig.rotation.y, partConfig.rotation.z);
                }
                if (partConfig.scaling) {
                    mesh.scaling = new Vector3(partConfig.scaling.x, partConfig.scaling.y, partConfig.scaling.z);
                }

                // Material
                if (partConfig.color) {
                    mesh.material = this.getMaterial(partConfig.color);
                }

                // Hierarchy
                if (partConfig.parent && partsMap.has(partConfig.parent)) {
                    mesh.parent = partsMap.get(partConfig.parent)!;
                } else {
                    mesh.parent = root;
                }

                partsMap.set(partConfig.name, mesh);
            }
        });

        return root;
    }

    private buildExtrusion(config: WeaponPartConfig): Mesh {
        let shape: Vector3[] = [];

        // Get Profile
        if (config.profile && (Profiles as any)[config.profile]) {
            const params = config.profileParams || [];
            shape = (Profiles as any)[config.profile](...params);
        } else if (config.customProfile) {
            shape = config.customProfile.map(p => new Vector3(p.x, p.y, p.z));
        } else {
            // Default square
            shape = Profiles.Rectangle(1, 1);
        }

        // Extrude
        if (config.path && config.path.length > 1) {
            // Extrude along path
            const pathPoints = config.path.map(p => new Vector3(p.x, p.y, p.z));
            return MeshBuilder.ExtrudeShape(config.name, {
                shape: shape,
                path: pathPoints,
                cap: Mesh.CAP_ALL,
                adjustFrame: true
            }, this.scene);
        } else {
            // Simple linear extrusion (depth)
            // Note: ExtrudePolygon extrudes in Y by default, we usually want Z or X. 
            // Babylon's ExtrudePolygon builds a polygon on XZ plane and extrudes up Y.
            // Or we can use ExtrudeShape with a straight line.
            // Let's use ExtrudePolygon for sharp edges and bevel support.

            return MeshBuilder.ExtrudePolygon(config.name, {
                shape: shape,
                depth: config.length || 1,
                wrap: true,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene);

            // Note: ExtrudePolygon creates the shape on the XZ plane and extrudes along Y.
            // We might need to rotate it to align with the gun's forward direction (usually Z or X).
            // We'll handle this in the blueprint rotation.
        }
    }

    private getMaterial(colorHex: string): StandardMaterial {
        if (this.materials.has(colorHex)) {
            return this.materials.get(colorHex)!;
        }
        const mat = new StandardMaterial(colorHex, this.scene);
        mat.diffuseColor = Color3.FromHexString(colorHex);
        this.materials.set(colorHex, mat);
        return mat;
    }

    private buildLoft(config: WeaponPartConfig): Mesh {
        let shapeA: Vector3[] = [];
        let shapeB: Vector3[] = [];

        // Get Profile A
        if (config.profile && (Profiles as any)[config.profile]) {
            const params = config.profileParams || [];
            shapeA = (Profiles as any)[config.profile](...params);
        } else if (config.customProfile) {
            shapeA = config.customProfile.map(p => new Vector3(p.x, p.y, p.z));
        }

        // Get Profile B
        if (config.profileB && (Profiles as any)[config.profileB]) {
            const params = config.profileBParams || [];
            shapeB = (Profiles as any)[config.profileB](...params);
        } else if (config.customProfileB) {
            shapeB = config.customProfileB.map(p => new Vector3(p.x, p.y, p.z));
        } else {
            // Default to same as A if not specified (extrusion-like)
            shapeB = shapeA.map(p => p.clone());
        }

        // Position Shape B at length
        const length = config.length || 1;
        // We assume extrusion is along Y axis for the shape definition (Babylon convention for Ribbon paths usually)
        // But here we want to loft from Z=0 to Z=length.
        // Profiles are defined in XY plane usually.

        // Transform shapes to 3D paths
        const pathA = shapeA.map(p => new Vector3(p.x, p.y, 0));
        const pathB = shapeB.map(p => new Vector3(p.x, p.y, length));

        // Create Ribbon
        // Note: pathA and pathB must have same number of points for best results, or close.
        return MeshBuilder.CreateRibbon(config.name, {
            pathArray: [pathA, pathB],
            closePath: true,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);
    }
}
