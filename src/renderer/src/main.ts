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

console.log('Protocol: Zero - Renderer Process Started')

async function initGame() {
    try {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        if (!canvas) throw new Error('Canvas not found')

        console.log('[Phase 1] Initializing Engine...')

        // Initialize Engine
        const engine = new Engine(canvas, true, {
            adaptToDeviceRatio: true,
            powerPreference: 'high-performance'
        })
        console.log('✓ Engine initialized')

        const createScene = () => {
            const scene = new Scene(engine)
            scene.clearColor = new Color4(0.02, 0.02, 0.05, 1) // Darker background

            // FPS Controller
            const fpsController = new FPSController(scene, new Vector3(0, 1.6, -10))
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
            const weaponGen = new WeaponAssembler(scene)
            const heldWeapon = weaponGen.generateVandal(Vector3.Zero(), 'flux')
            fpsController.attachWeapon(heldWeapon)
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
            const uiHint = document.getElementById('ui-hint')
            const gameHud = document.getElementById('game-hud')
            const crosshair = document.getElementById('crosshair')
            const settingsPanel = document.getElementById('settings-panel')
            const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement
            const sensitivityValue = document.getElementById('sensitivity-value')

            // Sensitivity Control
            if (sensitivitySlider && sensitivityValue) {
                sensitivitySlider.addEventListener('input', (e) => {
                    const val = parseFloat((e.target as HTMLInputElement).value)
                    fpsController.setSensitivity(val)
                    sensitivityValue.innerText = val.toFixed(1)
                })
            }

            // Pointer Lock Events
            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement) {
                    if (uiHint) uiHint.style.display = 'none'
                    if (gameHud) gameHud.style.display = 'block'
                    if (crosshair) crosshair.style.display = 'block'
                    if (settingsPanel) settingsPanel.style.display = 'none'
                } else {
                    if (uiHint) uiHint.style.display = 'flex' // Flex for centering
                    if (gameHud) gameHud.style.display = 'none'
                    if (crosshair) crosshair.style.display = 'none'
                    if (settingsPanel) settingsPanel.style.display = 'block'
                }
            })

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

            return scene
        }

        createScene()
    } catch (err) {
        console.error('❌ Fatal Error:', err)
        document.body.innerHTML = `<div style="color:red; padding:20px; font-family: monospace;">
            <h1>🚫 Protocol: Zero - Initialization Failed</h1>
            <pre>${err}</pre>
            <p>Please check the console for details.</p>
        </div>`
    }
}

// Start the game
initGame()
