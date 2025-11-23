import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, CSG, TransformNode } from '@babylonjs/core'

export class WeaponAssembler {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    public generateClassic(position: Vector3): Mesh {
        const root = new Mesh('Classic_Root', this.scene)
        root.position = position

        // 1. Body (Box)
        const body = MeshBuilder.CreateBox('body', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        body.position.z = 0.2

        // 2. Grip (Angled Box)
        const grip = MeshBuilder.CreateBox('grip', { width: 0.18, height: 0.4, depth: 0.25 }, this.scene)
        grip.rotation.x = Math.PI / 8
        grip.position.y = -0.3
        grip.position.z = -0.1

        // 3. Barrel (Cylinder)
        const barrel = MeshBuilder.CreateCylinder('barrel', { diameter: 0.1, height: 0.4 }, this.scene)
        barrel.rotation.x = Math.PI / 2
        barrel.position.z = 0.6
        barrel.position.y = 0.1

        // Merge meshes
        const bodyCSG = CSG.FromMesh(body)
        const gripCSG = CSG.FromMesh(grip)
        const barrelCSG = CSG.FromMesh(barrel)

        const combo = bodyCSG.union(gripCSG).union(barrelCSG)
        const mesh = combo.toMesh('Classic_Mesh', null, this.scene)

        // Cleanup primitives
        body.dispose()
        grip.dispose()
        barrel.dispose()

        mesh.parent = root

        // Material
        const mat = new StandardMaterial('classicMat', this.scene)
        mat.diffuseColor = new Color3(0.3, 0.3, 0.35) // Dark Grey
        mat.specularColor = new Color3(0.1, 0.1, 0.1)
        mesh.material = mat

        return root
    }

    public generateVandal(position: Vector3, skin: 'default' | 'gaia' | 'flux' | 'voxel' = 'default'): Mesh {
        const root = new Mesh('Vandal_Root', this.scene)
        root.position = position

        if (skin === 'voxel') {
            // Voxel Skin: Construct from cubes
            const voxelSize = 0.05
            const voxels: Vector3[] = []

            // Define voxel shape (simplified Vandal)
            // Receiver
            for (let x = 0; x < 5; x++) for (let y = 0; y < 8; y++) for (let z = 0; z < 24; z++) {
                if (Math.random() > 0.1) voxels.push(new Vector3(x, y, z))
            }
            // Barrel
            for (let x = 1; x < 4; x++) for (let y = 3; y < 6; y++) for (let z = 24; z < 40; z++) {
                voxels.push(new Vector3(x, y, z))
            }
            // Mag
            for (let x = 1; x < 4; x++) for (let y = -8; y < 0; y++) for (let z = 4; z < 10; z++) {
                voxels.push(new Vector3(x, y, z)) // Straight mag for voxel
            }

            const voxelMesh = MeshBuilder.CreateBox('voxel', { size: voxelSize }, this.scene)
            voxelMesh.isVisible = false

            voxels.forEach((v, i) => {
                const inst = voxelMesh.createInstance(`v_${i}`)
                inst.parent = root
                inst.position = v.scale(voxelSize).subtract(new Vector3(0.125, 0.2, 0.6)) // Center it

                // Random color variation
                const mat = new StandardMaterial(`vmat_${i}`, this.scene)
                mat.diffuseColor = new Color3(0.2 + Math.random() * 0.1, 0.2 + Math.random() * 0.1, 0.8 + Math.random() * 0.2)
                inst.material = mat
            })

            return root
        }

        // Standard CSG Construction for Default, Gaia, Flux

        // Main Receiver
        const receiver = MeshBuilder.CreateBox('receiver', { width: 0.25, height: 0.4, depth: 1.2 }, this.scene)

        // Stock
        const stock = MeshBuilder.CreateBox('stock', { width: 0.2, height: 0.3, depth: 0.8 }, this.scene)
        stock.position.z = -1.0
        stock.position.y = -0.1

        // Barrel
        const barrel = MeshBuilder.CreateCylinder('barrel', { diameter: 0.12, height: 1.0 }, this.scene)
        barrel.rotation.x = Math.PI / 2
        barrel.position.z = 1.0
        barrel.position.y = 0.1

        // Magazine
        const mag = MeshBuilder.CreateBox('mag', { width: 0.15, height: 0.6, depth: 0.3 }, this.scene)
        mag.rotation.x = Math.PI / 6
        mag.position.y = -0.5
        mag.position.z = 0.2

        // CSG Union
        let gunCSG = CSG.FromMesh(receiver)
        gunCSG = gunCSG.union(CSG.FromMesh(stock))
        gunCSG = gunCSG.union(CSG.FromMesh(barrel))
        gunCSG = gunCSG.union(CSG.FromMesh(mag))

        const mesh = gunCSG.toMesh('Vandal_Mesh', null, this.scene)

        receiver.dispose()
        stock.dispose()
        barrel.dispose()
        mag.dispose()

        mesh.parent = root

        // Skin Specific Details
        const mat = new StandardMaterial('vandalMat', this.scene)

        if (skin === 'gaia') {
            // Gaia: Wood & Crystal
            mat.diffuseColor = new Color3(0.4, 0.2, 0.1) // Wood
            mat.specularColor = new Color3(0.1, 0.1, 0.1)

            // Add "Roots" (Torus Knots)
            const roots = MeshBuilder.CreateTorusKnot('roots', { radius: 0.15, tube: 0.02, radialSegments: 64, p: 2, q: 3 }, this.scene)
            roots.parent = root
            roots.position.z = 0.2
            roots.scaling = new Vector3(1, 1, 2)
            const rootMat = new StandardMaterial('rootMat', this.scene)
            rootMat.diffuseColor = new Color3(0.5, 0.3, 0.2)
            roots.material = rootMat

            // Crystal Mag
            const crystal = MeshBuilder.CreatePolyhedron('crystal', { type: 2, size: 0.15 }, this.scene)
            crystal.parent = root
            crystal.position = new Vector3(0, -0.4, 0.2)
            const crystalMat = new StandardMaterial('crystalMat', this.scene)
            crystalMat.emissiveColor = new Color3(1, 0, 0) // Red Crystal
            crystalMat.alpha = 0.8
            crystal.material = crystalMat

        } else if (skin === 'flux') {
            // Flux: Sci-Fi White & Blue
            mat.diffuseColor = new Color3(0.9, 0.9, 0.95) // White Plastic
            mat.specularColor = new Color3(1, 1, 1)

            // Floating Core
            const core = MeshBuilder.CreateSphere('fluxCore', { diameter: 0.15 }, this.scene)
            core.parent = root
            core.position.z = 0
            const coreMat = new StandardMaterial('fluxCoreMat', this.scene)
            coreMat.emissiveColor = new Color3(0, 0.5, 1) // Blue Glow
            core.material = coreMat

            // Animation for Core
            this.scene.onBeforeRenderObservable.add(() => {
                core.scaling.x = 1 + Math.sin(performance.now() * 0.005) * 0.1
                core.scaling.y = 1 + Math.sin(performance.now() * 0.005) * 0.1
                core.scaling.z = 1 + Math.sin(performance.now() * 0.005) * 0.1
            })

        } else {
            // Default
            mat.diffuseColor = new Color3(0.1, 0.1, 0.15) // Black Metal
            mat.emissiveColor = new Color3(0.1, 0.05, 0)
        }

        mesh.material = mat

        return root
    }

    public generatePhantom(position: Vector3): Mesh {
        const root = new Mesh('Phantom_Root', this.scene)
        root.position = position

        // Smooth / Silenced Style

        // Body (Capsule-like or rounded box)
        const body = MeshBuilder.CreateCylinder('body', { diameter: 0.4, height: 1.5, tessellation: 16 }, this.scene)
        body.rotation.x = Math.PI / 2

        // Silencer (Thicker cylinder at front)
        const silencer = MeshBuilder.CreateCylinder('silencer', { diameter: 0.35, height: 0.8 }, this.scene)
        silencer.rotation.x = Math.PI / 2
        silencer.position.z = 1.0

        // Grip & Mag (Integrated smooth shape)
        const grip = MeshBuilder.CreateBox('grip', { width: 0.2, height: 0.6, depth: 0.4 }, this.scene)
        grip.position.y = -0.4
        grip.position.z = -0.2
        grip.rotation.x = Math.PI / 12

        let gunCSG = CSG.FromMesh(body)
        gunCSG = gunCSG.union(CSG.FromMesh(silencer))
        gunCSG = gunCSG.union(CSG.FromMesh(grip))

        const mesh = gunCSG.toMesh('Phantom_Mesh', null, this.scene)

        body.dispose()
        silencer.dispose()
        grip.dispose()

        mesh.parent = root

        // Material: Matte Camo/Plastic
        const mat = new StandardMaterial('phantomMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.25, 0.2) // Dark Green/Grey
        mesh.material = mat

        return root
    }
}
