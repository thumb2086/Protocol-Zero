import React, { useEffect, useRef } from 'react'
import {
    Engine,
    Scene as BabylonScene,
    Vector3,
    HemisphericLight,
    ArcRotateCamera,
    Color4,
    Color3,
    Mesh
} from '@babylonjs/core'
import { useWeaponStore } from '../store'

const Scene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<Engine | null>(null)
    const sceneRef = useRef<BabylonScene | null>(null)
    const currentWeaponRef = useRef<Mesh | null>(null)

    const { weaponType, setCurrentWeapon } = useWeaponStore()

    // Initialize Engine and Scene ONCE
    useEffect(() => {
        if (!canvasRef.current) return

        const engine = new Engine(canvasRef.current, true)
        const scene = new BabylonScene(engine)

        engineRef.current = engine
        sceneRef.current = scene

        scene.clearColor = new Color4(0.12, 0.12, 0.15, 1)

        const camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene)
        camera.attachControl(canvasRef.current, true)
        camera.wheelPrecision = 50
        camera.minZ = 0.1

        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
        light.intensity = 0.8
        light.groundColor = new Color3(0.2, 0.2, 0.2)

        const dirLight = new HemisphericLight('light2', new Vector3(1, 0.5, -1), scene)
        dirLight.intensity = 0.5
        dirLight.specular = new Color3(1, 1, 1)

        engine.runRenderLoop(() => {
            scene.render()
        })

        const handleResize = () => {
            engine.resize()
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            engine.dispose()
        }
    }, [])

    // Load weapon when type changes - BLUEPRINT SYSTEM ONLY
    useEffect(() => {
        if (!sceneRef.current) return

        let isCancelled = false
        console.log(`\n===== WEAPON CHANGE: ${weaponType} =====`)

        // Dynamic import blueprint system ONLY
        Promise.all([
            import('../core/WeaponAssembler'),
            import('../core/PartManager')
        ]).then(([{ WeaponAssembler }, { partManager }]) => {
            if (isCancelled) return

            // === STEP 1: COMPLETE CLEANUP ===
            if (currentWeaponRef.current) {
                console.log('[Scene] 🗑️ Disposing old weapon...')
                const meshCountBefore = sceneRef.current!.meshes.length

                // Recursive disposal function
                const dispose = (node: any) => {
                    if (node.getChildren) {
                        node.getChildren().forEach((child: any) => dispose(child))
                    }
                    if (node.dispose && node !== sceneRef.current) {
                        node.dispose(false, true) // dispose geometry + materials
                    }
                }

                dispose(currentWeaponRef.current)
                currentWeaponRef.current = null
                setCurrentWeapon(null) // Sync with store

                const meshCountAfter = sceneRef.current!.meshes.length
                console.log(`[Scene] ✓ Removed ${meshCountBefore - meshCountAfter} meshes`)
            }

            // === STEP 2: LOAD BLUEPRINT AND ASSEMBLE ===
            const loadWeapon = async () => {
                try {
                    console.log(`[Scene] 📘 Loading ${weaponType} blueprint...`)
                    const blueprint = await partManager.loadBlueprint(weaponType)

                    if (!blueprint) {
                        console.error(`[Scene] ❌ Blueprint not found: ${weaponType}`)
                        return null
                    }

                    console.log(`[Scene] ✓ Blueprint: ${blueprint.name}`)
                    const assembler = new WeaponAssembler(sceneRef.current!)
                    const weapon = assembler.assembleFromBlueprint(blueprint)

                    console.log(`[Scene] ✓ Assembled with ${sceneRef.current!.meshes.length - 2} weapon meshes`)
                    return weapon

                } catch (error) {
                    console.error('[Scene] ❌ Error:', error)
                    return null
                }
            }

            loadWeapon().then((weapon) => {
                if (isCancelled) {
                    console.log('[Scene] 🛑 Cancelled - disposing loaded weapon')
                    weapon?.dispose()
                    return
                }

                if (weapon) {
                    currentWeaponRef.current = weapon
                    setCurrentWeapon(weapon) // Sync with store
                    console.log('[Scene] ✅ Weapon ready!')
                } else {
                    console.error('[Scene] ❌ Failed to create weapon')
                }
                console.log('===== WEAPON CHANGE COMPLETE =====\n')
            })
        })

        // Cleanup on unmount
        return () => {
            isCancelled = true
            if (currentWeaponRef.current) {
                console.log('[Scene] Unmounting - cleaning up')
                const dispose = (node: any) => {
                    if (node.getChildren) {
                        node.getChildren().forEach((child: any) => dispose(child))
                    }
                    if (node.dispose && node !== sceneRef.current) {
                        node.dispose(false, true)
                    }
                }
                dispose(currentWeaponRef.current)
                currentWeaponRef.current = null
            }
        }

    }, [weaponType])

    return (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    )
}

export default Scene
