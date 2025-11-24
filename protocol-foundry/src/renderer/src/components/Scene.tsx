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
// Import Blueprints
import { classicBlueprint } from '../weapons/classic'
import { vandalBlueprint } from '../weapons/vandal'
import { phantomBlueprint } from '../weapons/phantom'

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

    // Rebuild Weapon when type changes
    useEffect(() => {
        if (!sceneRef.current) return

        // Import WeaponBuilder
        import('../core/WeaponBuilder').then(({ WeaponBuilder }) => {
            // Dispose old weapon completely
            WeaponBuilder.disposeWeapon(currentWeaponRef.current);
            currentWeaponRef.current = null;

            // Create new weapon
            const builder = new WeaponBuilder(sceneRef.current!);
            let weapon: Mesh | null = null;

            if (weaponType === 'classic') {
                weapon = builder.createClassic();
            } else if (weaponType === 'vandal') {
                weapon = builder.createVandal();
            } else if (weaponType === 'phantom') {
                weapon = builder.createPhantom();
            }

            currentWeaponRef.current = weapon;
        });

        // Cleanup on unmount
        return () => {
            import('../core/WeaponBuilder').then(({ WeaponBuilder }) => {
                WeaponBuilder.disposeWeapon(currentWeaponRef.current);
                currentWeaponRef.current = null;
            });
        };

    }, [weaponType])

    return (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    )
}

export default Scene
