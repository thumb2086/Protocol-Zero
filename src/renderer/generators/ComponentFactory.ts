import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, TransformNode, CSG } from '@babylonjs/core'

export class ComponentFactory {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    /**
     * Create a Receiver (The core of the gun)
     */
    public createReceiver(id: string, style: 'vandal' | 'phantom' | 'classic'): Mesh {
        const mesh = new Mesh(`receiver_${id}`, this.scene)
        let visual: Mesh
        const mat = new StandardMaterial('receiverMat', this.scene)
        mat.diffuseColor = new Color3(0.15, 0.15, 0.18) // Dark Gunmetal
        mat.specularColor = new Color3(0.2, 0.2, 0.2)

        if (style === 'vandal') {
            // AK-Style Receiver
            const body = MeshBuilder.CreateBox('body', { width: 0.2, height: 0.3, depth: 1.0 }, this.scene)

            // Dust Cover (Rounded top)
            const cover = MeshBuilder.CreateCylinder('cover', { diameter: 0.2, height: 1.0, tessellation: 16 }, this.scene)
            cover.rotation.x = Math.PI / 2
            cover.position.y = 0.15
            cover.scaling.x = 1.1 // Slightly wider

            // Rear Sight Block
            const sightBlock = MeshBuilder.CreateBox('sight', { width: 0.22, height: 0.2, depth: 0.3 }, this.scene)
            sightBlock.position.y = 0.2
            sightBlock.position.z = 0.35

            const bodyCSG = CSG.FromMesh(body)
            const coverCSG = CSG.FromMesh(cover)
            const sightCSG = CSG.FromMesh(sightBlock)

            const combo = bodyCSG.union(coverCSG).union(sightCSG)
            visual = combo.toMesh('vandal_receiver', null, this.scene)

            body.dispose(); cover.dispose(); sightBlock.dispose()

            // Mount Points
            this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.1, 0.5))
            this.createMountPoint(mesh, 'stock_mount', new Vector3(0, 0, -0.5))
            this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.15, 0.2))
            this.createMountPoint(mesh, 'scope_mount', new Vector3(0, 0.3, -0.1))
            this.createMountPoint(mesh, 'grip_mount', new Vector3(0, -0.15, 0.4))

        } else if (style === 'phantom') {
            // Modern Carbine Receiver (M4-ish but sleek)
            const upper = MeshBuilder.CreateBox('upper', { width: 0.2, height: 0.25, depth: 0.8 }, this.scene)
            upper.position.y = 0.15

            const lower = MeshBuilder.CreateBox('lower', { width: 0.18, height: 0.2, depth: 0.8 }, this.scene)
            lower.position.y = -0.05

            // Mag Well (Flared)
            const magWell = MeshBuilder.CreateBox('magWell', { width: 0.22, height: 0.25, depth: 0.25 }, this.scene)
            magWell.position.y = -0.15
            magWell.position.z = 0.2

            const uCSG = CSG.FromMesh(upper)
            const lCSG = CSG.FromMesh(lower)
            const mCSG = CSG.FromMesh(magWell)

            const combo = uCSG.union(lCSG).union(mCSG)
            visual = combo.toMesh('phantom_receiver', null, this.scene)

            upper.dispose(); lower.dispose(); magWell.dispose()

            // Mount Points
            this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.15, 0.4))
            this.createMountPoint(mesh, 'stock_mount', new Vector3(0, 0.05, -0.4))
            this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.25, 0.2))
            this.createMountPoint(mesh, 'scope_mount', new Vector3(0, 0.28, 0))
            this.createMountPoint(mesh, 'grip_mount', new Vector3(0, -0.15, 0.3)) // Integrated grip usually, but keeping modular

        } else {
            // Classic Pistol Frame
            const frame = MeshBuilder.CreateBox('frame', { width: 0.18, height: 0.2, depth: 0.6 }, this.scene)

            // Grip (Angled)
            const grip = MeshBuilder.CreateBox('grip', { width: 0.16, height: 0.4, depth: 0.25 }, this.scene)
            grip.rotation.x = Math.PI / 8
            grip.position.y = -0.25
            grip.position.z = -0.2

            // Trigger Guard
            const guard = MeshBuilder.CreateTorus('guard', { diameter: 0.15, thickness: 0.03 }, this.scene)
            guard.rotation.y = Math.PI / 2
            guard.position.y = -0.15
            guard.position.z = 0.05

            const fCSG = CSG.FromMesh(frame)
            const gCSG = CSG.FromMesh(grip)

            const combo = fCSG.union(gCSG)
            visual = combo.toMesh('classic_frame', null, this.scene)
            guard.parent = visual // Keep guard separate for simplicity or merge if needed

            frame.dispose(); grip.dispose()

            // Mount Points
            this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.1, 0.3)) // Slide attaches here
            this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.5, -0.25)) // Bottom of grip

            mat.diffuseColor = new Color3(0.1, 0.1, 0.1) // Polymer Black
        }

        visual.material = mat
        visual.parent = mesh
        return mesh
    }

    /**
     * Create a Barrel
     */
    public createBarrel(id: string, length: number = 1.0, style: 'vandal' | 'phantom' | 'classic' = 'vandal'): Mesh {
        const mesh = new Mesh(`barrel_${id}`, this.scene)
        let visual: Mesh
        const mat = new StandardMaterial('barrelMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.2, 0.2)

        if (style === 'vandal') {
            // AK Barrel + Gas Tube
            const barrel = MeshBuilder.CreateCylinder('barrel', { diameter: 0.08, height: length }, this.scene)
            barrel.rotation.x = Math.PI / 2
            barrel.position.z = length / 2

            const gasTube = MeshBuilder.CreateCylinder('gasTube', { diameter: 0.1, height: length * 0.6 }, this.scene)
            gasTube.rotation.x = Math.PI / 2
            gasTube.position.y = 0.12
            gasTube.position.z = length * 0.3

            const handguard = MeshBuilder.CreateBox('handguard', { width: 0.18, height: 0.25, depth: length * 0.5 }, this.scene)
            handguard.position.z = length * 0.25
            handguard.position.y = 0.05

            const bCSG = CSG.FromMesh(barrel)
            const gCSG = CSG.FromMesh(gasTube)
            const hCSG = CSG.FromMesh(handguard)

            const combo = bCSG.union(gCSG).union(hCSG)
            visual = combo.toMesh('vandal_barrel', null, this.scene)

            barrel.dispose(); gasTube.dispose(); handguard.dispose()

            // Muzzle Brake
            const brake = MeshBuilder.CreateCylinder('brake', { diameter: 0.12, height: 0.15 }, this.scene)
            brake.rotation.x = Math.PI / 2
            brake.position.z = length
            brake.parent = visual

        } else if (style === 'phantom') {
            // Integrated Silencer / Handguard
            const handguard = MeshBuilder.CreateBox('handguard', { width: 0.2, height: 0.25, depth: length * 0.6 }, this.scene)
            handguard.position.z = length * 0.3

            const silencer = MeshBuilder.CreateCylinder('silencer', { diameter: 0.15, height: length * 0.5 }, this.scene)
            silencer.rotation.x = Math.PI / 2
            silencer.position.z = length * 0.75

            const hCSG = CSG.FromMesh(handguard)
            const sCSG = CSG.FromMesh(silencer)

            const combo = hCSG.union(sCSG)
            visual = combo.toMesh('phantom_barrel', null, this.scene)

            handguard.dispose(); silencer.dispose()

        } else {
            // Classic Slide (Technically part of upper, but treating as barrel assembly for modularity)
            const slide = MeshBuilder.CreateBox('slide', { width: 0.2, height: 0.15, depth: length }, this.scene)
            slide.position.z = length / 2 - 0.1

            visual = slide
            mat.diffuseColor = new Color3(0.6, 0.6, 0.65) // Silver/Steel
            mat.specularColor = new Color3(0.8, 0.8, 0.8)
        }

        visual.material = mat
        visual.parent = mesh
        this.createMountPoint(mesh, 'muzzle_mount', new Vector3(0, 0, length))

        return mesh
    }

    /**
     * Create a Stock
     */
    public createStock(id: string, style: 'vandal' | 'phantom' = 'vandal'): Mesh {
        const mesh = new Mesh(`stock_${id}`, this.scene)
        let visual: Mesh
        const mat = new StandardMaterial('stockMat', this.scene)
        mat.diffuseColor = new Color3(0.15, 0.15, 0.15)

        if (style === 'vandal') {
            // Skeleton Stock
            const topStrut = MeshBuilder.CreateBox('top', { width: 0.1, height: 0.05, depth: 0.8 }, this.scene)
            topStrut.position.z = -0.4
            topStrut.position.y = 0.1

            const botStrut = MeshBuilder.CreateBox('bot', { width: 0.1, height: 0.05, depth: 0.7 }, this.scene)
            botStrut.position.z = -0.35
            botStrut.position.y = -0.1
            botStrut.rotation.x = -Math.PI / 12

            const buttPlate = MeshBuilder.CreateBox('butt', { width: 0.12, height: 0.4, depth: 0.1 }, this.scene)
            buttPlate.position.z = -0.8

            const tCSG = CSG.FromMesh(topStrut)
            const bCSG = CSG.FromMesh(botStrut)
            const pCSG = CSG.FromMesh(buttPlate)

            const combo = tCSG.union(bCSG).union(pCSG)
            visual = combo.toMesh('vandal_stock', null, this.scene)

            topStrut.dispose(); botStrut.dispose(); buttPlate.dispose()

        } else {
            // Modern Adjustable Stock
            const tube = MeshBuilder.CreateCylinder('tube', { diameter: 0.1, height: 0.6 }, this.scene)
            tube.rotation.x = Math.PI / 2
            tube.position.z = -0.3

            const stockBody = MeshBuilder.CreateBox('body', { width: 0.15, height: 0.3, depth: 0.4 }, this.scene)
            stockBody.position.z = -0.6
            stockBody.position.y = -0.05

            const cheekRest = MeshBuilder.CreateCylinder('cheek', { diameter: 0.16, height: 0.4 }, this.scene)
            cheekRest.rotation.x = Math.PI / 2
            cheekRest.position.z = -0.6
            cheekRest.position.y = 0.1

            const tCSG = CSG.FromMesh(tube)
            const bCSG = CSG.FromMesh(stockBody)
            const cCSG = CSG.FromMesh(cheekRest)

            const combo = tCSG.union(bCSG).union(cCSG)
            visual = combo.toMesh('phantom_stock', null, this.scene)

            tube.dispose(); stockBody.dispose(); cheekRest.dispose()
        }

        visual.material = mat
        visual.parent = mesh
        return mesh
    }

    /**
     * Create a Magazine
     */
    public createMagazine(id: string, style: 'vandal' | 'phantom' | 'classic' = 'vandal'): Mesh {
        const mesh = new Mesh(`mag_${id}`, this.scene)
        let visual: Mesh
        const mat = new StandardMaterial('magMat', this.scene)
        mat.diffuseColor = new Color3(0.1, 0.1, 0.1)

        if (style === 'vandal') {
            // Curved Banana Mag
            const seg1 = MeshBuilder.CreateBox('seg1', { width: 0.12, height: 0.4, depth: 0.25 }, this.scene)
            seg1.position.y = -0.2

            const seg2 = MeshBuilder.CreateBox('seg2', { width: 0.12, height: 0.4, depth: 0.25 }, this.scene)
            seg2.rotation.x = Math.PI / 6
            seg2.position.y = -0.5
            seg2.position.z = 0.1

            const s1CSG = CSG.FromMesh(seg1)
            const s2CSG = CSG.FromMesh(seg2)

            const combo = s1CSG.union(s2CSG)
            visual = combo.toMesh('vandal_mag', null, this.scene)

            seg1.dispose(); seg2.dispose()

        } else if (style === 'phantom') {
            // Straight Mag
            visual = MeshBuilder.CreateBox('mag', { width: 0.12, height: 0.5, depth: 0.2 }, this.scene)
            visual.position.y = -0.25
            visual.rotation.x = Math.PI / 12
        } else {
            // Pistol Baseplate
            visual = MeshBuilder.CreateBox('baseplate', { width: 0.16, height: 0.05, depth: 0.25 }, this.scene)
            visual.position.y = 0
        }

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
