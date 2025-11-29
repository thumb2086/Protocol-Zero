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
        const mat = new StandardMaterial('receiverMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.2, 0.25)
        mat.specularColor = new Color3(0.3, 0.3, 0.3)

        if (style === 'vandal') {
            // Main Body
            const body = MeshBuilder.CreateBox('body', { width: 0.25, height: 0.4, depth: 1.2 }, this.scene)

            // Top Rail (Picatinny style)
            const rail = MeshBuilder.CreateBox('rail', { width: 0.15, height: 0.05, depth: 1.2 }, this.scene)
            rail.position.y = 0.225

            // Side Panels
            const side1 = MeshBuilder.CreateBox('side1', { width: 0.28, height: 0.1, depth: 0.8 }, this.scene)
            side1.position.y = 0.05

            // Merge
            const bodyCSG = CSG.FromMesh(body)
            const railCSG = CSG.FromMesh(rail)
            const sideCSG = CSG.FromMesh(side1)

            const combo = bodyCSG.union(railCSG).union(sideCSG)
            visual = combo.toMesh('vandal_receiver_visual', null, this.scene)

            body.dispose()
            rail.dispose()
            side1.dispose()

        } else if (style === 'phantom') {
            visual = MeshBuilder.CreateCylinder('visual', { diameter: 0.4, height: 1.2, tessellation: 16 }, this.scene)
            visual.rotation.x = Math.PI / 2
            mat.diffuseColor = new Color3(0.15, 0.18, 0.15) // Darker, smoother
        } else {
            visual = MeshBuilder.CreateBox('visual', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        }

        visual.material = mat
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

        // Main Barrel
        const barrel = MeshBuilder.CreateCylinder('barrel_main', { diameter: 0.12, height: length }, this.scene)
        barrel.rotation.x = Math.PI / 2
        barrel.position.z = length / 2

        // Muzzle Brake
        const brake = MeshBuilder.CreateCylinder('brake', { diameter: 0.15, height: 0.15 }, this.scene)
        brake.rotation.x = Math.PI / 2
        brake.position.z = length

        // Cooling Vents (Visual only, simple rings)
        const vent1 = MeshBuilder.CreateTorus('vent1', { diameter: 0.13, thickness: 0.02 }, this.scene)
        vent1.rotation.x = Math.PI / 2
        vent1.position.z = length * 0.3

        const vent2 = vent1.clone('vent2')
        vent2.position.z = length * 0.6

        // Merge
        const bCSG = CSG.FromMesh(barrel)
        const brakeCSG = CSG.FromMesh(brake)
        const combo = bCSG.union(brakeCSG)
        const visual = combo.toMesh('barrel_visual', null, this.scene)

        barrel.dispose()
        brake.dispose()
        vent1.parent = visual
        vent2.parent = visual

        const mat = new StandardMaterial('barrelMat', this.scene)
        mat.diffuseColor = new Color3(0.1, 0.1, 0.1)
        mat.specularColor = new Color3(0.5, 0.5, 0.5) // Shiny metal
        visual.material = mat

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

        // L-Shape Stock
        const main = MeshBuilder.CreateBox('main', { width: 0.15, height: 0.25, depth: 0.8 }, this.scene)
        main.position.z = -0.4

        const butt = MeshBuilder.CreateBox('butt', { width: 0.16, height: 0.5, depth: 0.1 }, this.scene)
        butt.position.z = -0.8
        butt.position.y = -0.1

        const cheek = MeshBuilder.CreateCylinder('cheek', { diameter: 0.15, height: 0.6 }, this.scene)
        cheek.rotation.x = Math.PI / 2
        cheek.position.z = -0.4
        cheek.position.y = 0.13

        const mCSG = CSG.FromMesh(main)
        const bCSG = CSG.FromMesh(butt)
        const cCSG = CSG.FromMesh(cheek)

        const combo = mCSG.union(bCSG).union(cCSG)
        const visual = combo.toMesh('stock_visual', null, this.scene)

        main.dispose()
        butt.dispose()
        cheek.dispose()

        const mat = new StandardMaterial('stockMat', this.scene)
        mat.diffuseColor = new Color3(0.15, 0.15, 0.15)
        visual.material = mat

        visual.parent = mesh

        return mesh
    }

    /**
     * Create a Magazine
     */
    public createMagazine(id: string): Mesh {
        const mesh = new Mesh(`mag_${id}`, this.scene)

        // Curved Mag (Approximated with angled boxes)
        const top = MeshBuilder.CreateBox('top', { width: 0.14, height: 0.3, depth: 0.28 }, this.scene)
        top.position.y = -0.15

        const bottom = MeshBuilder.CreateBox('bottom', { width: 0.14, height: 0.3, depth: 0.28 }, this.scene)
        bottom.rotation.x = Math.PI / 8
        bottom.position.y = -0.4
        bottom.position.z = 0.05

        const tCSG = CSG.FromMesh(top)
        const bCSG = CSG.FromMesh(bottom)

        const combo = tCSG.union(bCSG)
        const visual = combo.toMesh('mag_visual', null, this.scene)

        top.dispose()
        bottom.dispose()

        const mat = new StandardMaterial('magMat', this.scene)
        mat.diffuseColor = new Color3(0.1, 0.1, 0.1)
        mat.emissiveColor = new Color3(0.1, 0.05, 0) // Slight glow
        visual.material = mat

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
