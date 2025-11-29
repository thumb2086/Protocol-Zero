import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, TransformNode, CSG } from '@babylonjs/core'
import { PartType } from '../interfaces/IWeaponPart'

export class ComponentFactory {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    /**
     * Create a Receiver (The core of the gun)
     * Has mount points for: Barrel, Stock, Magazine, Scope, Grip
     */
    public createReceiver(id: string, style: 'vandal' | 'phantom' | 'classic'): Mesh {
        const mesh = new Mesh(`receiver_${id}`, this.scene)

        // Visual Mesh
        let visual: Mesh
        if (style === 'vandal') {
            visual = MeshBuilder.CreateBox('visual', { width: 0.25, height: 0.4, depth: 1.2 }, this.scene)
        } else if (style === 'phantom') {
            visual = MeshBuilder.CreateCylinder('visual', { diameter: 0.4, height: 1.2, tessellation: 16 }, this.scene)
            visual.rotation.x = Math.PI / 2
        } else {
            visual = MeshBuilder.CreateBox('visual', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        }
        visual.parent = mesh

        // Mount Points (TransformNodes)
        this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.1, 0.6))
        this.createMountPoint(mesh, 'stock_mount', new Vector3(0, -0.1, -0.6))
        this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.2, 0.2))
        this.createMountPoint(mesh, 'scope_mount', new Vector3(0, 0.25, 0))
        this.createMountPoint(mesh, 'grip_mount', new Vector3(0, -0.25, 0.4))

        return mesh
    }

    /**
     * Create a Barrel
     * Has mount point for: Muzzle
     */
    public createBarrel(id: string, length: number = 1.0): Mesh {
        const mesh = new Mesh(`barrel_${id}`, this.scene)

        const visual = MeshBuilder.CreateCylinder('visual', { diameter: 0.12, height: length }, this.scene)
        visual.rotation.x = Math.PI / 2
        visual.position.z = length / 2 // Offset so origin is at the breech
        visual.parent = mesh

        // Muzzle Mount Point (for VFX)
        this.createMountPoint(mesh, 'muzzle_mount', new Vector3(0, 0, length))

        return mesh
    }

    /**
     * Create a Stock
     */
    public createStock(id: string): Mesh {
        const mesh = new Mesh(`stock_${id}`, this.scene)

        const visual = MeshBuilder.CreateBox('visual', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        visual.position.z = -0.4 // Offset so origin is at connection point
        visual.parent = mesh

        return mesh
    }

    /**
     * Create a Magazine
     */
    public createMagazine(id: string): Mesh {
        const mesh = new Mesh(`mag_${id}`, this.scene)

        const visual = MeshBuilder.CreateBox('visual', { width: 0.15, height: 0.6, depth: 0.3 }, this.scene)
        visual.rotation.x = Math.PI / 6
        visual.position.y = -0.3
        visual.parent = mesh

        return mesh
    }

    /**
     * Helper to create a named mount point
     */
    private createMountPoint(parent: Mesh, name: string, position: Vector3): TransformNode {
        const mount = new TransformNode(name, this.scene)
        mount.parent = parent
        mount.position = position
        return mount
    }
}
