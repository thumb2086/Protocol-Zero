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
        // Use the new modular assembly system
        const weapon = this.assembleWeapon('classic', {
            barrelLength: 0.4,
            skin: 'default'
        })
        weapon.position = position
        return weapon
    }

    public generateVandal(position: Vector3, skin: 'default' | 'gaia' | 'flux' | 'voxel' = 'default'): Mesh {
        // Use the new modular assembly system
        const weapon = this.assembleWeapon('vandal', {
            barrelLength: 1.0,
            skin: skin,
            scope: 'red_dot',
            grip: 'angled'
        })
        weapon.position = position
        return weapon
    }

    public generatePhantom(position: Vector3): Mesh {
        // Use the new modular assembly system
        const weapon = this.assembleWeapon('phantom', {
            barrelLength: 0.9,
            skin: 'default',
            scope: 'red_dot',
            grip: 'vertical'
        })
        weapon.position = position
        return weapon
    }

    /**
     * Assemble a weapon from parts
     */
    public assembleWeapon(type: 'vandal' | 'phantom' | 'classic', options: any = {}): Mesh {
        const root = new Mesh(`${type}_Root`, this.scene)

        // Store configuration in metadata for persistence
        root.metadata = {
            type: type,
            options: { ...options }
        }

        // 1. Create Receiver (The Core)
        const receiver = this.componentFactory.createReceiver('core', type)
        receiver.parent = root

        // ... (rest of assembly)

        // 2. Create & Attach Barrel
        const barrel = this.componentFactory.createBarrel('std', options.barrelLength || 1.0, type)
        this.attachPart(receiver, barrel, 'barrel_mount')

        // 3. Create & Attach Stock
        if (type !== 'classic') {
            const stock = this.componentFactory.createStock('std', type === 'phantom' ? 'phantom' : 'vandal')
            this.attachPart(receiver, stock, 'stock_mount')
        }

        // 4. Create & Attach Magazine
        const mag = this.componentFactory.createMagazine('std', type)
        this.attachPart(receiver, mag, 'mag_mount')

        // 5. Create & Attach Scope (Optional)
        if (options.scope) {
            const scope = this.componentFactory.createScope('std', options.scope)
            this.attachPart(receiver, scope, 'scope_mount')
        }

        // 6. Create & Attach Grip (Optional)
        if (options.grip) {
            const grip = this.componentFactory.createGrip('std', options.grip)
            this.attachPart(receiver, grip, 'grip_mount')
        }

        // Apply Skin
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
            // Keep default material if not special skin
            return
        }

        // Apply to all meshes in hierarchy
        root.getChildMeshes().forEach(m => {
            m.material = mat
        })
    }

    /**
     * Hot-swap a weapon component
     */
    public swapComponent(currentWeapon: Mesh, slot: string, partData: any): Mesh {
        console.log(`[WeaponAssembler] Swapping ${slot} with data:`, partData)

        // Store current weapon state
        const position = currentWeapon.position.clone()
        const rotation = currentWeapon.rotation.clone()
        const parent = currentWeapon.parent

        // Retrieve existing options from metadata if available
        let options: any = {}
        let weaponType: 'vandal' | 'phantom' | 'classic' = 'vandal'

        if (currentWeapon.metadata && currentWeapon.metadata.options) {
            options = { ...currentWeapon.metadata.options }
            weaponType = currentWeapon.metadata.type || 'vandal'
        } else {
            // Fallback if no metadata (shouldn't happen with new weapons)
            weaponType = currentWeapon.name.split('_')[0].toLowerCase() as any
            options = {
                skin: 'flux',
                scope: 'red_dot',
                grip: 'angled',
                barrelLength: 1.0
            }
        }

        // Dispose old weapon
        currentWeapon.dispose()

        // Apply the change
        if (slot === 'scope') options.scope = partData
        if (slot === 'grip') options.grip = partData
        if (slot === 'skin') options.skin = partData
        if (slot === 'barrel') {
            if (partData === 'long') options.barrelLength = 1.2
            else if (partData === 'short') options.barrelLength = 0.8
            else options.barrelLength = 1.0
        }

        // Re-assemble
        const newWeapon = this.assembleWeapon(weaponType, options)

        // Restore weapon state
        newWeapon.position = position
        newWeapon.rotation = rotation
        newWeapon.parent = parent

        console.log(`[WeaponAssembler] Successfully swapped ${slot}`)
        return newWeapon
    }
}
