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
            // High-Fidelity Vandal Receiver using ExtrudePolygon
            // Profile defined in XZ plane (top-down), then rotated to be side view
            const shape = [
                new Vector3(0, 0, 0),       // Bottom Rear
                new Vector3(0, 0, 0.25),    // Top Rear
                new Vector3(0.6, 0, 0.25),  // Top Front (Receiver end)
                new Vector3(0.6, 0, 0.15),  // Front Step down
                new Vector3(1.0, 0, 0.15),  // Handguard Top
                new Vector3(1.0, 0, -0.05), // Handguard Bottom
                new Vector3(0.4, 0, -0.05), // Mag Well Front
                new Vector3(0.4, 0, 0),     // Mag Well Top
                new Vector3(0.2, 0, 0)      // Trigger Guard Front
            ]

            // Extrude "width" of the gun
            const body = MeshBuilder.ExtrudePolygon('vandal_body', {
                shape: shape,
                depth: 0.15,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene)

            // Rotate to correct orientation
            body.rotation.z = Math.PI / 2 // Stand up
            body.rotation.y = Math.PI / 2 // Face forward

            // Center it
            body.position.x = -0.075 // Half of depth (0.15)
            body.position.y = 0      // Adjust vertical alignment
            body.position.z = -0.2   // Adjust forward/back alignment

            visual = body

            // Mount Points
            this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.1, 0.8))
            this.createMountPoint(mesh, 'stock_mount', new Vector3(0, 0.1, -0.2))
            this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.1, 0.3))
            this.createMountPoint(mesh, 'scope_mount', new Vector3(0, 0.26, 0.1))
            this.createMountPoint(mesh, 'grip_mount', new Vector3(0, -0.05, 0.7))

        } else if (style === 'phantom') {
            // High-Fidelity Phantom Receiver (Sleek, Modern)
            const shape = [
                new Vector3(0, 0, 0),
                new Vector3(0, 0, 0.22),
                new Vector3(0.5, 0, 0.22),
                new Vector3(0.8, 0, 0.18), // Sloped front
                new Vector3(0.8, 0, -0.05),
                new Vector3(0.3, 0, -0.05), // Mag well area
                new Vector3(0.15, 0, 0)
            ]

            const body = MeshBuilder.ExtrudePolygon('phantom_body', {
                shape: shape,
                depth: 0.14,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene)

            body.rotation.z = Math.PI / 2
            body.rotation.y = Math.PI / 2
            body.position.x = -0.07
            body.position.z = -0.1

            visual = body

            // Mount Points
            this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.1, 0.7))
            this.createMountPoint(mesh, 'stock_mount', new Vector3(0, 0.1, -0.1))
            this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.15, 0.2))
            this.createMountPoint(mesh, 'scope_mount', new Vector3(0, 0.23, 0.1))
            this.createMountPoint(mesh, 'grip_mount', new Vector3(0, -0.05, 0.5))

        } else {
            // Classic Pistol Frame
            // ... (Classic logic remains)
            const frame = MeshBuilder.CreateBox('frame', { width: 0.18, height: 0.2, depth: 0.6 }, this.scene)
            // ...
            const grip = MeshBuilder.CreateBox('grip', { width: 0.16, height: 0.4, depth: 0.25 }, this.scene)
            grip.rotation.x = Math.PI / 8
            grip.position.y = -0.25
            grip.position.z = -0.2

            const guard = MeshBuilder.CreateTorus('guard', { diameter: 0.15, thickness: 0.03 }, this.scene)
            guard.rotation.y = Math.PI / 2
            guard.position.y = -0.15
            guard.position.z = 0.05

            const fCSG = CSG.FromMesh(frame)
            const gCSG = CSG.FromMesh(grip)

            const combo = fCSG.union(gCSG)
            visual = combo.toMesh('classic_frame', null, this.scene)
            guard.parent = visual

            frame.dispose(); grip.dispose()

            // Mount Points
            this.createMountPoint(mesh, 'barrel_mount', new Vector3(0, 0.1, 0.3))
            this.createMountPoint(mesh, 'mag_mount', new Vector3(0, -0.5, -0.25))

            mat.diffuseColor = new Color3(0.1, 0.1, 0.1)
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
            const barrel = MeshBuilder.CreateCylinder('barrel', { diameter: 0.06, height: length }, this.scene)
            barrel.rotation.x = Math.PI / 2
            barrel.position.z = length / 2

            const gasTube = MeshBuilder.CreateCylinder('gasTube', { diameter: 0.08, height: length * 0.6 }, this.scene)
            gasTube.rotation.x = Math.PI / 2
            gasTube.position.y = 0.08
            gasTube.position.z = length * 0.3

            // Front Sight Block
            const frontSight = MeshBuilder.CreateBox('frontSight', { width: 0.05, height: 0.15, depth: 0.1 }, this.scene)
            frontSight.position.z = length * 0.9
            frontSight.position.y = 0.1

            const bCSG = CSG.FromMesh(barrel)
            const gCSG = CSG.FromMesh(gasTube)
            const fCSG = CSG.FromMesh(frontSight)

            const combo = bCSG.union(gCSG).union(fCSG)
            visual = combo.toMesh('vandal_barrel', null, this.scene)

            barrel.dispose(); gasTube.dispose(); frontSight.dispose()

            // Muzzle Brake
            const brake = MeshBuilder.CreateCylinder('brake', { diameter: 0.08, height: 0.1 }, this.scene)
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
            // Classic Slide
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
            // Detailed Stock Profile
            const shape = [
                new Vector3(0, 0, 0),
                new Vector3(0, 0, 0.3),
                new Vector3(-0.4, 0, 0.3),
                new Vector3(-0.4, 0, -0.1),
                new Vector3(-0.1, 0, 0)
            ]

            const stock = MeshBuilder.ExtrudePolygon('vandal_stock', {
                shape: shape,
                depth: 0.12,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene)

            stock.rotation.z = Math.PI / 2
            stock.rotation.y = Math.PI / 2
            stock.position.x = -0.06

            visual = stock

        } else {
            // Modern Adjustable Stock
            const tube = MeshBuilder.CreateCylinder('tube', { diameter: 0.1, height: 0.6 }, this.scene)
            tube.rotation.x = Math.PI / 2
            tube.position.z = -0.3

            const stockBody = MeshBuilder.CreateBox('body', { width: 0.15, height: 0.3, depth: 0.4 }, this.scene)
            stockBody.position.z = -0.6
            stockBody.position.y = -0.05

            visual = Mesh.MergeMeshes([tube, stockBody], true, true, undefined, false, true) as Mesh
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
            // Curved Mag Profile
            const shape = [
                new Vector3(0, 0, 0),
                new Vector3(0.2, 0, 0),
                new Vector3(0.15, 0, -0.4),
                new Vector3(-0.05, 0, -0.4)
            ]

            const mag = MeshBuilder.ExtrudePolygon('vandal_mag', {
                shape: shape,
                depth: 0.1,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene)

            mag.rotation.z = Math.PI / 2
            mag.rotation.y = Math.PI / 2
            mag.position.x = -0.05

            visual = mag

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
     * Create a Scope
     */
    public createScope(id: string, style: 'red_dot' | 'holo' | 'sniper' = 'red_dot'): Mesh {
        const mesh = new Mesh(`scope_${id}`, this.scene)
        let visual: Mesh
        const mat = new StandardMaterial('scopeMat', this.scene)
        mat.diffuseColor = new Color3(0.1, 0.1, 0.1)

        if (style === 'sniper') {
            // Long Range Scope
            const tube = MeshBuilder.CreateCylinder('tube', { diameter: 0.1, height: 0.8 }, this.scene)
            tube.rotation.x = Math.PI / 2

            const frontBell = MeshBuilder.CreateCylinder('front', { diameter: 0.15, height: 0.2 }, this.scene)
            frontBell.rotation.x = Math.PI / 2
            frontBell.position.z = 0.4

            const rearBell = MeshBuilder.CreateCylinder('rear', { diameter: 0.12, height: 0.15 }, this.scene)
            rearBell.rotation.x = Math.PI / 2
            rearBell.position.z = -0.35

            const tCSG = CSG.FromMesh(tube)
            const fCSG = CSG.FromMesh(frontBell)
            const rCSG = CSG.FromMesh(rearBell)

            const combo = tCSG.union(fCSG).union(rCSG)
            visual = combo.toMesh('sniper_scope', null, this.scene)

            tube.dispose(); frontBell.dispose(); rearBell.dispose()

            // Lens
            const lens = MeshBuilder.CreateCylinder('lens', { diameter: 0.13, height: 0.01 }, this.scene)
            lens.rotation.x = Math.PI / 2
            lens.position.z = 0.49
            lens.parent = visual
            const lensMat = new StandardMaterial('lensMat', this.scene)
            lensMat.diffuseColor = new Color3(0, 0, 0.2)
            lensMat.specularColor = new Color3(1, 1, 1)
            lensMat.alpha = 0.8
            lens.material = lensMat

        } else {
            // Red Dot / Holo
            const base = MeshBuilder.CreateBox('base', { width: 0.12, height: 0.05, depth: 0.2 }, this.scene)

            const frame = MeshBuilder.CreateBox('frame', { width: 0.14, height: 0.15, depth: 0.05 }, this.scene)
            frame.position.y = 0.1
            frame.position.z = 0.05

            const glass = MeshBuilder.CreatePlane('glass', { size: 0.12 }, this.scene)
            glass.position.y = 0.1
            glass.position.z = 0.05
            glass.parent = base

            const bCSG = CSG.FromMesh(base)
            const fCSG = CSG.FromMesh(frame)

            const combo = bCSG.union(fCSG)
            visual = combo.toMesh('red_dot', null, this.scene)

            base.dispose(); frame.dispose()

            const glassMat = new StandardMaterial('glassMat', this.scene)
            glassMat.diffuseColor = new Color3(0, 0.8, 0)
            glassMat.emissiveColor = new Color3(0, 1, 0)
            glassMat.alpha = 0.3
            glass.material = glassMat
        }

        visual.material = mat
        visual.parent = mesh
        return mesh
    }

    /**
     * Create a Grip
     */
    public createGrip(id: string, style: 'vertical' | 'angled' = 'vertical'): Mesh {
        const mesh = new Mesh(`grip_${id}`, this.scene)
        let visual: Mesh
        const mat = new StandardMaterial('gripMat', this.scene)
        mat.diffuseColor = new Color3(0.12, 0.12, 0.12)

        if (style === 'angled') {
            // Angled Foregrip
            visual = MeshBuilder.CreateBox('angled', { width: 0.1, height: 0.25, depth: 0.15 }, this.scene)
            visual.rotation.x = Math.PI / 4
            visual.position.y = -0.15
        } else {
            // Vertical Grip
            visual = MeshBuilder.CreateCylinder('vertical', { diameter: 0.1, height: 0.35 }, this.scene)
            visual.position.y = -0.2
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
