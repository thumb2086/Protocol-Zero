import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    Color4
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

console.log('Protocol: Zero - Renderer Process Started')

// Global references
let engine: Engine
let scene: Scene
let fpsController: FPSController
let weaponGen: WeaponAssembler
let currentWeapon: any

async function initGame() {
    try {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        if (!canvas) throw new Error('Canvas not found')

        console.log('[Phase 1] Initializing UI System...')

        // Initialize UI Manager
        const uiManager = new UIManager()
        const foundryLoader = new FoundryLoader()
        const ipcBridge = IPCBridge.getInstance()

        // Load weapons for foundry
        const weapons = await foundryLoader.loadWeaponManifest()
        populateFoundryUI(weapons, ipcBridge)

        console.log('[Phase 2] Initializing Engine...')

        // Initialize Engine
        engine = new Engine(canvas, true, {
            adaptToDeviceRatio: true,
            powerPreference: 'high-performance'
        })
        console.log('✓ Engine initialized')

        // Wait for user to click "Start Game"
        uiManager.onStartGame(() => {
            console.log('[Phase 3] Starting Game...')
            createScene()
        })

        // Handle exit
        uiManager.onExitGame(() => {
            console.log('Exiting game...')
            window.close()
        })

        // Listen for weapon changes from IPC
        ipcBridge.onWeaponChanged((weaponId: string) => {
            console.log(`[IPC] Weapon changed to: ${weaponId}`)
            if (fpsController && weaponGen) {
                // TODO: Reload weapon based on weaponId
                console.log('Weapon reload not yet implemented')
            }
        })

        console.log('✓ UI System initialized - Waiting for user to start game')

    } catch (err) {
        console.error('❌ Fatal Error:', err)
        document.body.innerHTML = `<div style="color:red; padding:20px; font-family: monospace;">
            <h1>🚫 Protocol: Zero - Initialization Failed</h1>
            <pre>${err}</pre>
            <p>Please check the console for details.</p>
        </div>`
    }
}

function createScene() {
    scene = new Scene(engine)
    scene.clearColor = new Color4(0.02, 0.02, 0.05, 1) // Darker background

    // FPS Controller
    fpsController = new FPSController(scene, new Vector3(0, 1.6, -10))
    fpsController.setSensitivity(1.5)

    // Generate The Range Map
    const mapGen = new MapGenerator(scene)
    mapGen.generateTheRange()
    console.log('✓ Map loaded: The Range')

    // Lighting (Darker cyberpunk atmosphere)
    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
    light.intensity = 0.4 // Much darker ambient

    const light2 = new HemisphericLight('light2', new Vector3(1, 2, 1), scene)
    light2.intensity = 0.3 // Subtle fill light

    // Characters (Far away for showcase)
    console.log('Generating characters...')
    const charGen = new CharacterGenerator(scene)
    charGen.generateVector(new Vector3(10, 0, 35))
    charGen.generateBastion(new Vector3(14, 0, 35))
    charGen.generateNebula(new Vector3(18, 0, 35))
    charGen.generatePulse(new Vector3(22, 0, 35))
    console.log('✓ All 4 characters generated')

    // Held Weapon
    weaponGen = new WeaponAssembler(scene)
    currentWeapon = weaponGen.generateVandal(Vector3.Zero(), 'flux')
    fpsController.attachWeapon(currentWeapon)
    console.log('✓ Weapon attached')

    // Weapon Showcase
    const gaia = weaponGen.generateVandal(new Vector3(-5, 1.2, 25), 'gaia')
    gaia.rotation.y = Math.PI / 2

    // Community Weapon Showcase
    GitHubWeaponLoader.fetchManifest().then(async (manifest) => {
        if (manifest && manifest.weapons.length > 0) {
            console.log(`Found ${manifest.weapons.length} community weapons`)
            // Load the most recent one
            const weapon = manifest.weapons[manifest.weapons.length - 1]
            console.log(`Loading community weapon: ${weapon.name}`)

            const url = GitHubWeaponLoader.getModelUrl(weapon.model)
            const mesh = await weaponGen.loadCommunityWeapon(url, new Vector3(5, 1.2, 25))

            if (mesh) {
                mesh.rotation.y = -Math.PI / 2
                console.log('✓ Community weapon loaded')
            }
        } else {
            console.log('No community weapons found in repository')
        }
    })

    // UI Management
    const hud = new HUDController()
    fpsController.setHUD(hud) // Connect FPS Controller to HUD

    // Test HUD Update (Simulate some data)
    hud.updateHealth(100)
    hud.updateArmor(50)
    hud.updateAmmo(25, 75)
    hud.showKillFeed('Player', 'Bot_Vector', 'Vandal', true)

    // Render Loop
    engine.runRenderLoop(() => {
        fpsController.update()
        scene.render()
    })

    // Resize Handler
    window.addEventListener('resize', () => {
        engine.resize()
    })

    console.log('✓ Scene initialized')
    console.log('=================================')
    console.log('MAP:', '🗺️  The Range (Training)')
    console.log('VIEW:', '👁️  First-Person')
    console.log('WEAPON:', '🔫 Flux Vandal')
    console.log('=================================')
}

/**
 * Populate Foundry UI with weapons
 */
function populateFoundryUI(weapons: WeaponMetadata[], ipcBridge: IPCBridge): void {
    const weaponGrid = document.getElementById('weapon-grid')
    if (!weaponGrid) return

    weaponGrid.innerHTML = '' // Clear existing

    if (weapons.length === 0) {
        weaponGrid.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; grid-column: 1/-1;">No weapons available. Export weapons from protocol-foundry to see them here.</p>'
        return
    }

    weapons.forEach(weapon => {
        const card = document.createElement('div')
        card.className = 'weapon-card'
        card.innerHTML = `
            <h3>${weapon.name}</h3>
            <p>Type: ${weapon.type}</p>
            ${weapon.author ? `<p>Author: ${weapon.author}</p>` : ''}
            <div class="weapon-type">${weapon.type}</div>
        `

        card.addEventListener('click', () => {
            console.log(`[Foundry] Selected weapon: ${weapon.name}`)
            ipcBridge.requestWeaponChange(weapon.id)
        })

        weaponGrid.appendChild(card)
    })

    console.log(`✓ Foundry UI populated with ${weapons.length} weapons`)
}

// Start the game
initGame()
