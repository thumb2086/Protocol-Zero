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
    type: "extrusion" | "loft" | "custom";
    profile?: string;
    profileParams?: any[];
    profileB?: string;
    profileBParams?: any[];
    customProfile?: Vector3[];
    customProfileB?: Vector3[];
    path?: Vector3[];
    length?: number;
    position?: { x: number, y: number, z: number };
    rotation?: { x: number, y: number, z: number };
    scaling?: { x: number, y: number, z: number };
    color?: string;
    parent?: string;
    bevel?: boolean;
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
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene);
        } else {
            // Simple linear extrusion along Z axis
            const depth = config.length || 1;
            const path = [
                new Vector3(0, 0, 0),
                new Vector3(0, 0, depth)
            ];

            return MeshBuilder.ExtrudeShape(config.name, {
                shape: shape,
                path: path,
                cap: Mesh.CAP_ALL,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene);
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

        // Transform shapes to 3D paths
        const pathA = shapeA.map(p => new Vector3(p.x, p.y, 0));
        const pathB = shapeB.map(p => new Vector3(p.x, p.y, length));

        // Create Ribbon
        return MeshBuilder.CreateRibbon(config.name, {
            pathArray: [pathA, pathB],
            closePath: true,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);
    }
}
