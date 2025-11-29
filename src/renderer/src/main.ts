import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    Color4,
    Color3,
    DirectionalLight,
    ShadowGenerator,
    AmmoJSPlugin,
    PhysicsImpostor
} from '@babylonjs/core'
import { CharacterGenerator } from '../generators/CharacterGenerator'
import { WeaponAssembler } from '../generators/WeaponAssembler'
import { FPSController } from '../controllers/FPSController'
import { MapGenerator } from '../generators/MapGenerator'
import { HUDController } from '../controllers/HUDController'
import { GitHubWeaponLoader } from '../utils/GitHubWeaponLoader'
import { UIManager } from '../controllers/UIManager'
import { FoundryLoader, WeaponMetadata } from '../utils/FoundryLoader'
import { IPCBridge } from '../utils/IPCBridge'
import Ammo from 'ammo.js'
import { FoundryController } from '../controllers/FoundryController'

console.log('Protocol: Zero - Renderer Process Started')
let engine: Engine
let scene: Scene
let fpsController: FPSController
let weaponGen: WeaponAssembler
let currentWeapon: any
let foundryController: FoundryController

async function initGame() {
    try {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        if (!canvas) throw new Error('Canvas not found')

        console.log('[Phase 1] Initializing UI System...')

        // Initialize UI Manager
        const uiManager = new UIManager()
        const foundryLoader = new FoundryLoader()
        const ipcBridge = IPCBridge.getInstance()

        // Initialize Foundry Controller
        foundryController = new FoundryController(ipcBridge)

        // Load weapons for foundry
        const weapons = await foundryLoader.loadWeaponManifest()
        foundryController.populateWeapons(weapons)

        console.log('[Phase 2] Initializing Engine...')

        // Create Engine
        engine = new Engine(canvas, true)
        scene = new Scene(engine)
        scene.clearColor = new Color4(0.05, 0.05, 0.1, 1)

        // Initialize Physics
        const ammo = await Ammo()
        scene.enablePhysics(new Vector3(0, -9.81, 0), new AmmoJSPlugin(true, ammo))

        console.log('[Phase 3] Setting up Lighting...')

        // Hemispheric Light (Ambient)
        const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
        hemi.intensity = 0.6
        hemi.diffuse = new Color3(0.1, 0.1, 0.2)
        hemi.groundColor = new Color3(0, 0, 0)
        hemi.specular = new Color3(0, 0, 0)

        // Directional Light (Sun)
        const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.5), scene)
        sun.position = new Vector3(0, 50, 0)
        sun.intensity = 0.8

        // Shadows
        const shadowGen = new ShadowGenerator(2048, sun)
        shadowGen.useBlurExponentialShadowMap = true

        console.log('[Phase 4] Generating Map...')

        // Generate Map
        const mapGen = new MapGenerator(scene)
        mapGen.generateTheRange()

        console.log('[Phase 5] Spawning Player...')

        // Create Character (Vector - Duelist)
        const charGen = new CharacterGenerator(scene)
        const player = charGen.generateVector(new Vector3(0, 2, 0))

        console.log('[Phase 6] Creating Weapon...')

        // Create Weapon
        weaponGen = new WeaponAssembler(scene)
        currentWeapon = weaponGen.generateVandal(new Vector3(0, 0, 0), 'flux')

        console.log('[Phase 7] Initializing FPS Controller...')

        // Create FPS Controller
        fpsController = new FPSController(scene, new Vector3(0, 2, 0))
        fpsController.attachWeapon(currentWeapon)

        console.log('[Phase 8] Starting Render Loop...')

        // Render Loop
        engine.runRenderLoop(() => {
            scene.render()
        })

        window.addEventListener('resize', () => {
            engine.resize()
        })

        console.log('✓ Game Initialized Successfully')

        // Listen for part equipping from Foundry Controller (Custom Event)
        // MOVED HERE: After fpsController and weaponGen are initialized
        window.addEventListener('foundry-equip-part', (e: any) => {
            const { slot, partData } = e.detail
            console.log(`[Main] Equipping ${slot} with ${partData}`)

            if (fpsController && weaponGen && currentWeapon) {
                try {
                    const newWeapon = weaponGen.swapComponent(currentWeapon, slot, partData)
                    currentWeapon = newWeapon
                    fpsController.attachWeapon(newWeapon)
                    console.log(`[Main] ✓ Successfully equipped ${slot}`)
                } catch (error) {
                    console.error('[Main] Error during hot-swap:', error)
                }
            }
        })

    } catch (err) {
        console.error('Failed to initialize game:', err)
    }
}

// Start the game
initGame()
