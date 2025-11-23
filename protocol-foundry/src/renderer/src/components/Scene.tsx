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
import { WeaponArchitect, WeaponBlueprint } from '../core/WeaponArchitect'
import { useWeaponStore } from '../store'

// Import Blueprints
import classicBlueprint from '../weapons/classic.json'
import vandalBlueprint from '../weapons/vandal.json'
import phantomBlueprint from '../weapons/phantom.json'

const Scene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<Engine | null>(null)
    const sceneRef = useRef<BabylonScene | null>(null)
    const currentWeaponRef = useRef<Mesh | null>(null)

    const { weaponType } = useWeaponStore()

    // Initialize Engine and Scene
    useEffect(() => {
        if (!canvasRef.current) return

        const engine = new Engine(canvasRef.current, true)
        const scene = new BabylonScene(engine)

        engineRef.current = engine
        sceneRef.current = scene

        // Lighter background for better contrast
        scene.clearColor = new Color4(0.12, 0.12, 0.15, 1)

        const camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene)
        camera.attachControl(canvasRef.current, true)
        camera.wheelPrecision = 50
        camera.minZ = 0.1

        // Main ambient light
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)
        light.intensity = 0.8
        light.groundColor = new Color3(0.2, 0.2, 0.2)

        // Directional light
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

    // Rebuild Weapon when type changes or blueprints update (HMR)
    useEffect(() => {
        if (!sceneRef.current) return

        // Dispose old weapon
        if (currentWeaponRef.current) {
            currentWeaponRef.current.dispose()
            currentWeaponRef.current = null
        }

        const architect = new WeaponArchitect(sceneRef.current)
        let blueprint: any = vandalBlueprint

        if (weaponType === 'classic') blueprint = classicBlueprint
        if (weaponType === 'phantom') blueprint = phantomBlueprint
        if (weaponType === 'vandal') blueprint = vandalBlueprint

        try {
            const mesh = architect.build(blueprint as WeaponBlueprint)
            currentWeaponRef.current = mesh

            // Center camera on new mesh?
            // For now, just let it be at 0,0,0
        } catch (e) {
            console.error("Failed to build weapon:", e)
        }

    }, [weaponType, classicBlueprint, vandalBlueprint, phantomBlueprint]) // Dependencies for HMR

    return (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    )
}

export default Scene
