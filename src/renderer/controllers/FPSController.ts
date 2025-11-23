import { Scene, UniversalCamera, Vector3, ActionManager, KeyboardEventTypes, Axis, Ray, Color3, MeshBuilder, StandardMaterial, Mesh } from '@babylonjs/core'

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
    }

    private moveVelocity: Vector3 = Vector3.Zero()
    private acceleration: number = 0.15 // Fast acceleration (Snappy)
    private friction: number = 0.75     // Fast deceleration (Stops quickly)
    private maxSpeed: number = 0.2

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

        // Raycast from center of screen
        const origin = this.camera.position
        const direction = this.camera.getForwardRay().direction

        const ray = new Ray(origin, direction, 100)
        const hit = this.scene.pickWithRay(ray)

        // Visual: Bullet Trail
        const right = this.camera.getDirection(Axis.X).scale(0.2)
        const down = this.camera.getDirection(Axis.Y).scale(-0.2)
        const forward = this.camera.getDirection(Axis.Z).scale(0.5)
        const gunMuzzlePos = origin.add(right).add(down).add(forward)

        const endPoint = hit?.pickedPoint || origin.add(direction.scale(100))

        const trail = MeshBuilder.CreateLines('trail', {
            points: [gunMuzzlePos, endPoint],
            updatable: false
        }, this.scene)
        trail.color = new Color3(1, 1, 0) // Yellow trail

        // Fade out trail
        setTimeout(() => {
            trail.dispose()
        }, 50)

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

            // Target Destruction Logic
            if (hit.pickedMesh.metadata && hit.pickedMesh.metadata.isTarget) {
                console.log('Target Hit!', hit.pickedMesh.name)

                // Show kill feed
                if (this.hudController) {
                    this.hudController.showKillFeed('Player', 'Training_Bot', 'Vandal', hit.pickedMesh.metadata.isHeadshot)
                }

                // Destroy target
                hit.pickedMesh.dispose()

                // If it has a parent (like the target center), dispose that too or handle it
                // In MapGenerator, center is separate mesh but logically part of target. 
                // Actually MapGenerator creates outer and center separately. 
                // Ideally we should group them, but for now let's just dispose what we hit.
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

    public getCamera(): UniversalCamera {
        return this.camera
    }
}
