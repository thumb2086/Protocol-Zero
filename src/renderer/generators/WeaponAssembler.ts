import { Scene, MeshBuilder, Vector3, StandardMaterial, Color3, Mesh, CSG, TransformNode, SceneLoader, AbstractMesh } from '@babylonjs/core'
import { ComponentFactory } from './ComponentFactory'

export class WeaponAssembler {
    private scene: Scene
    private componentFactory: ComponentFactory

    constructor(scene: Scene) {
        this.scene = scene
        this.componentFactory = new ComponentFactory(scene)
    }

    public generateClassic(position: Vector3): Mesh {
        // Legacy generation for Classic (can be refactored later)
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
        // Use the new modular assembly system
        const weapon = this.assembleWeapon('vandal', {
            barrelLength: 1.0,
            skin: skin
        })
        weapon.position = position
        return weapon
    }

    public generatePhantom(position: Vector3): Mesh {
        // Legacy generation for Phantom (can be refactored later)
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

    /**
     * Assemble a weapon from parts
     */
    public assembleWeapon(type: 'vandal' | 'phantom' | 'classic', options: any = {}): Mesh {
        const root = new Mesh(`${type}_Root`, this.scene)

        // 1. Create Receiver (The Core)
        const receiver = this.componentFactory.createReceiver('core', type)
        receiver.parent = root

        // 2. Create & Attach Barrel
        const barrel = this.componentFactory.createBarrel('std', options.barrelLength || 1.0)
        this.attachPart(receiver, barrel, 'barrel_mount')

        // 3. Create & Attach Stock
        const stock = this.componentFactory.createStock('std')
        this.attachPart(receiver, stock, 'stock_mount')

        // 4. Create & Attach Magazine
        const mag = this.componentFactory.createMagazine('std')
        this.attachPart(receiver, mag, 'mag_mount')

        // Apply Skin (Simple material application for now)
        this.applySkin(root, options.skin || 'default')

        return root
    }

    private attachPart(parentPart: Mesh, childPart: Mesh, mountName: string) {
        // Find mount point
        const mountPoint = parentPart.getChildren((node) => node.name === mountName)[0] as TransformNode

        if (mountPoint) {
            childPart.parent = mountPoint
            childPart.position = Vector3.Zero()
            childPart.rotation = Vector3.Zero()
        } else {
            console.warn(`Mount point ${mountName} not found on ${parentPart.name}`)
            childPart.parent = parentPart // Fallback
        }
    }

    private applySkin(root: Mesh, skin: string) {
        const mat = new StandardMaterial(`${skin}Mat`, this.scene)

        if (skin === 'flux') {
            mat.diffuseColor = new Color3(0.9, 0.9, 0.95)
            mat.emissiveColor = new Color3(0, 0.2, 0.5)
        } else if (skin === 'gaia') {
            mat.diffuseColor = new Color3(0.4, 0.2, 0.1)
        } else {
            mat.diffuseColor = new Color3(0.2, 0.2, 0.2)
        }

        // Apply to all meshes in hierarchy
        root.getChildMeshes().forEach(m => {
            m.material = mat
        })
    }

    public async loadCommunityWeapon(url: string, position: Vector3): Promise<AbstractMesh | null> {
        try {
            const result = await SceneLoader.ImportMeshAsync('', url, '', this.scene)
            const root = result.meshes[0]

            // Normalize scale/rotation if needed (GLB usually exports with Z-forward, but Babylon might need adjustment)
            root.position = position

            // Ensure it has a name for easy identification
            root.name = 'Community_Weapon_Root'

            return root
        } catch (error) {
            console.error('Failed to load community weapon:', error)
            return null
        }
    }

    /**
     * Hot-swap a weapon component
     * Rebuilds the weapon with new part parameters while maintaining position/parent
     */
    public swapComponent(currentWeapon: Mesh, slot: string, partData: any): Mesh {
        console.log(`[WeaponAssembler] Swapping ${slot} with data:`, partData)

        // Store current weapon state
        const position = currentWeapon.position.clone()
        const rotation = currentWeapon.rotation.clone()
        const parent = currentWeapon.parent
        const weaponType = currentWeapon.name.split('_')[0].toLowerCase() as 'vandal' | 'phantom' | 'classic'

        // Dispose old weapon
        currentWeapon.dispose()

        // Generate new weapon based on type
        // In a real scenario, we would update the blueprint and re-assemble
        // For now, we just re-assemble with default options + the change

        const options: any = { skin: 'flux' } // Default skin
        if (slot === 'barrel') {
            options.barrelLength = partData.length || 1.2 // Example change
        }

        let newWeapon: Mesh
        if (['vandal', 'phantom', 'classic'].includes(weaponType)) {
            newWeapon = this.assembleWeapon(weaponType, options)
        } else {
            newWeapon = this.assembleWeapon('vandal', options)
        }

        // Restore weapon state
        newWeapon.position = position
        newWeapon.rotation = rotation
        newWeapon.parent = parent

        console.log(`[WeaponAssembler] Successfully swapped ${slot}`)
        return newWeapon
    }
}
