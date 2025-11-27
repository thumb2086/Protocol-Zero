import { Scene, UniversalCamera, Vector3, ActionManager, KeyboardEventTypes, Axis, Ray, Color3, MeshBuilder, StandardMaterial, Mesh } from '@babylonjs/core'
import { IDamageable } from '../src/interfaces/IDamageable'

export class FPSController {
    private scene: Scene
    private camera: UniversalCamera
    private inputMap: { [key: string]: boolean } = {}
    private moveSpeed: number = 0.2
    private jumpPower: number = 0.3
    private velocity: Vector3 = Vector3.Zero()
    private grounded: boolean = true
    private canvas: HTMLCanvasElement
    private isLocked: boolean = false

    // Weapon attachment
    public weaponAttachPoint: Mesh | null = null
    private currentWeapon: Mesh | null = null

    constructor(scene: Scene, startPosition: Vector3) {
        this.scene = scene
        this.canvas = scene.getEngine().getRenderingCanvas() as HTMLCanvasElement

        // Create first-person camera
        this.camera = new UniversalCamera('fpsCamera', startPosition, scene)
        this.camera.setTarget(new Vector3(0, 1.6, 0)) // Eye-level height
        this.camera.attachControl(this.canvas, true)

        // Mouse sensitivity & FPS settings
        this.camera.angularSensibility = 1000
        this.camera.speed = 0
        this.camera.fov = 1.2 // Wide FOV like Valorant
        this.camera.minZ = 0.01 // Very close near plane for weapon
        this.camera.inertia = 0 // No mouse smoothing/acceleration

        // Collision & Gravity
        this.camera.checkCollisions = true
        this.camera.applyGravity = true
        this.camera.ellipsoid = new Vector3(0.5, 0.9, 0.5) // Player capsule

        this.setupKeyboardInput()
        this.setupPointerLock()
    }

    private setupPointerLock() {
        // Click to lock pointer
        this.canvas.addEventListener('click', () => {
            if (!this.isLocked) {
                this.canvas.requestPointerLock()
            }
        })

        // Listen for pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.canvas
            console.log('Pointer lock:', this.isLocked ? 'LOCKED' : 'UNLOCKED')
        })

        // ESC to unlock
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isLocked) {
                document.exitPointerLock()
            }
        })

        // Mouse click for shooting
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.isLocked) { // Left click
                this.shoot()
            }
        })
    }

    private setupKeyboardInput() {
        this.scene.actionManager = new ActionManager(this.scene)

        // Key Down/Up
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                const key = kbInfo.event.key.toLowerCase()
                this.inputMap[key] = true

                if (key === 'r') {
                    this.reload()
                }
            }
            if (kbInfo.type === KeyboardEventTypes.KEYUP) {
                this.inputMap[kbInfo.event.key.toLowerCase()] = false
            }
        })
    }

    /**
     * Attach weapon to camera for first-person view
     */
    public attachWeapon(weaponMesh: Mesh): void {
        // Create weapon attach point if not exists
        if (!this.weaponAttachPoint) {
            this.weaponAttachPoint = new Mesh('weaponAttachPoint', this.scene)
            this.weaponAttachPoint.parent = this.camera

            // Position in front of camera (right hand position)
            this.weaponAttachPoint.position = new Vector3(0.3, -0.25, 0.6)
            this.weaponAttachPoint.rotation = new Vector3(0, Math.PI, 0)
        }

        // Attach weapon
        weaponMesh.parent = this.weaponAttachPoint
        weaponMesh.position = Vector3.Zero()
        weaponMesh.rotation = Vector3.Zero()
        weaponMesh.scaling = new Vector3(0.2, 0.2, 0.2) // Scale down for FP view

        // Store weapon reference
        this.currentWeapon = weaponMesh
    }

    /**
     * Set current weapon reference (for modular weapons)
     */
    public setWeapon(weaponMesh: Mesh): void {
        this.currentWeapon = weaponMesh
    }

    private moveVelocity: Vector3 = Vector3.Zero()
    private acceleration: number = 0.02 // Slower acceleration for weight
    private friction: number = 0.8      // Quicker stop
    private maxSpeed: number = 0.08     // ~4.8 m/s at 60fps (Sprint speed)

    public update() {
        // Only process movement if pointer is locked
        if (!this.isLocked) return

        // Movement direction (Projected on XZ plane)
        const forward = this.camera.getDirection(Axis.Z)
        forward.y = 0
        forward.normalize()

        const right = this.camera.getDirection(Axis.X)
        right.y = 0
        right.normalize()

        let inputDir = Vector3.Zero()

        if (this.inputMap['w']) inputDir.addInPlace(forward)
        if (this.inputMap['s']) inputDir.addInPlace(forward.scale(-1))
        if (this.inputMap['a']) inputDir.addInPlace(right.scale(-1))
        if (this.inputMap['d']) inputDir.addInPlace(right)

        // Normalize input to ensure consistent speed in all directions
        if (inputDir.length() > 0) {
            inputDir.normalize()

            // Apply acceleration
            this.moveVelocity.addInPlace(inputDir.scale(this.acceleration))

            // Cap speed
            if (this.moveVelocity.length() > this.maxSpeed) {
                this.moveVelocity.normalize().scaleInPlace(this.maxSpeed)
            }
        } else {
            // Apply friction (Decelerate)
            this.moveVelocity.scaleInPlace(this.friction)

            // Stop completely if very slow
            if (this.moveVelocity.length() < 0.001) {
                this.moveVelocity = Vector3.Zero()
            }
        }

        // Apply movement
        this.camera.position.addInPlace(this.moveVelocity)

        // Gravity
        if (!this.grounded) {
            this.velocity.y -= 0.015
        }

        // Jump
        if (this.inputMap[' '] && this.grounded) {
            this.velocity.y = this.jumpPower
            this.grounded = false
        }

        // Apply vertical velocity
        this.camera.position.y += this.velocity.y

        // Ground check (Simple floor at y=1.6)
        if (this.camera.position.y <= 1.6) {
            this.camera.position.y = 1.6
            this.velocity.y = 0
            this.grounded = true
        } else {
            this.grounded = false
        }
    }

    // Ammo System
    private currentAmmo: number = 25
    private reserveAmmo: number = 75
    private maxAmmo: number = 25
    private isReloading: boolean = false
    private hudController: any = null // Type 'any' to avoid circular dependency for now, or import interface

    public setHUD(hud: any) {
        this.hudController = hud
        this.updateHUD()
    }

    private updateHUD() {
        if (this.hudController) {
            this.hudController.updateAmmo(this.currentAmmo, this.reserveAmmo)
        }
    }

    public setSensitivity(sensitivity: number) {
        this.camera.angularSensibility = 2000 / sensitivity
    }

    private shoot() {
        if (!this.isLocked || this.isReloading) return

        if (this.currentAmmo <= 0) {
            this.reload()
            return
        }

        // Decrement Ammo
        this.currentAmmo--
        this.updateHUD()

        // Hitscan: Raycast from camera (FPS standard for accuracy)
        const origin = this.camera.position
        const direction = this.camera.getForwardRay().direction

        const ray = new Ray(origin, direction, 100)
        const hit = this.scene.pickWithRay(ray)

        // Get muzzle flash point from weapon (if available)
        let muzzleFlashPos: Vector3
        if (this.currentWeapon) {
            // Try to find muzzle_flash_point in weapon hierarchy
            const muzzlePoint = this.findMuzzleFlashPoint(this.currentWeapon)
            if (muzzlePoint) {
                muzzleFlashPos = muzzlePoint.getAbsolutePosition()
            } else {
                // Fallback: estimate from weapon position
                const right = this.camera.getDirection(Axis.X).scale(0.2)
                const down = this.camera.getDirection(Axis.Y).scale(-0.2)
                const forward = this.camera.getDirection(Axis.Z).scale(0.5)
                muzzleFlashPos = origin.add(right).add(down).add(forward)
            }
        } else {
            // Fallback: estimate from camera
            const right = this.camera.getDirection(Axis.X).scale(0.2)
            const down = this.camera.getDirection(Axis.Y).scale(-0.2)
            const forward = this.camera.getDirection(Axis.Z).scale(0.5)
            muzzleFlashPos = origin.add(right).add(down).add(forward)
        }

        const endPoint = hit?.pickedPoint || origin.add(direction.scale(100))

        // Visual Tracer: From muzzle to hit point (Enhanced visibility)
        const trail = MeshBuilder.CreateLines('trail', {
            points: [muzzleFlashPos, endPoint],
            updatable: false
        }, this.scene)
        trail.color = new Color3(1, 0.9, 0.2) // Bright yellow
        trail.alpha = 1.0

        // Add thicker tube for better visibility
        const trailTube = MeshBuilder.CreateTube('trailTube', {
            path: [muzzleFlashPos, endPoint],
            radius: 0.015,
            tessellation: 8,
            updatable: false
        }, this.scene)

        const trailMat = new StandardMaterial('trailMat', this.scene)
        trailMat.emissiveColor = new Color3(1, 0.9, 0.2)
        trailMat.disableLighting = true
        trailTube.material = trailMat

        // Fade out trail
        setTimeout(() => {
            trail.dispose()
            trailTube.dispose()
        }, 100) // Increased visibility duration

        if (hit?.pickedMesh) {
            // Visual: Hit Marker
            const marker = MeshBuilder.CreateSphere('hit', { diameter: 0.1 }, this.scene)
            marker.position = hit.pickedPoint!
            const mat = new StandardMaterial('hitMat', this.scene)
            mat.emissiveColor = new Color3(1, 0, 0)
            marker.material = mat

            setTimeout(() => {
                marker.dispose()
            }, 200)

            // Damage System Logic
            if (hit.pickedMesh.metadata) {
                // Check if it's an enemy or damageable object
                if (hit.pickedMesh.metadata.parentClass && 'takeDamage' in hit.pickedMesh.metadata.parentClass) {
                    const damageable = hit.pickedMesh.metadata.parentClass as IDamageable
                    const damage = 25 // Base damage for Vandal
                    const isHeadshot = hit.pickedMesh.metadata.isHeadshot || false

                    const finalDamage = isHeadshot ? damage * 4 : damage
                    damageable.takeDamage(finalDamage)

                    // Show kill feed if dead
                    if (damageable.isDead() && this.hudController) {
                        this.hudController.showKillFeed('Player', 'Enemy', 'Vandal', isHeadshot)
                    }
                }

                // Target Destruction Logic (Legacy Target)
                if (hit.pickedMesh.metadata.isTarget) {
                    console.log('Target Hit!', hit.pickedMesh.name)

                    // Show kill feed
                    if (this.hudController) {
                        this.hudController.showKillFeed('Player', 'Training_Bot', 'Vandal', hit.pickedMesh.metadata.isHeadshot)
                    }

                    // Destroy target
                    hit.pickedMesh.dispose()
                }
            }
        }
    }

    private reload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo || this.reserveAmmo <= 0) return

        console.log('Reloading...')
        this.isReloading = true

        // Simulate reload time
        setTimeout(() => {
            const needed = this.maxAmmo - this.currentAmmo
            const toAdd = Math.min(needed, this.reserveAmmo)

            this.currentAmmo += toAdd
            this.reserveAmmo -= toAdd
            this.isReloading = false
            this.updateHUD()
            console.log('Reload Complete')
        }, 2000) // 2 seconds reload
    }

    /**
     * Find muzzle flash point in weapon hierarchy
     */
    private findMuzzleFlashPoint(weaponMesh: Mesh): Mesh | null {
        // Search for a mesh named 'muzzle' or 'muzzle_flash_point'
        const children = weaponMesh.getChildMeshes()

        for (const child of children) {
            const name = child.name.toLowerCase()
            if (name.includes('muzzle') || name.includes('barrel_end')) {
                return child as Mesh
            }
        }

        return null
    }

    public getCamera(): UniversalCamera {
        return this.camera
    }
}
