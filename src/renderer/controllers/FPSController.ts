import { Scene, UniversalCamera, Vector3, ActionManager, KeyboardEventTypes, Axis, Ray, Color3, MeshBuilder, StandardMaterial, Mesh, PhysicsImpostor, ExecuteCodeAction, ActionEvent, AbstractMesh } from '@babylonjs/core'
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
        // Use window event listeners - more reliable than scene observable
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase()
            this.inputMap[key] = true

            if (['w', 'a', 's', 'd'].includes(key)) {
                console.log(`[FPSController] Key DOWN: ${key.toUpperCase()}`)
            }

            if (key === 'r') {
                this.reload()
            }
        })

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase()
            this.inputMap[key] = false
        })

        console.log('[FPSController] Using window keyboard listeners')
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

        const origin = this.camera.position
        const direction = this.camera.getForwardRay().direction

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

        // Create Bullet
        const bullet = MeshBuilder.CreateSphere('bullet', { diameter: 0.05 }, this.scene)
        bullet.position = muzzleFlashPos

        // Material
        const mat = new StandardMaterial('bulletMat', this.scene)
        mat.emissiveColor = new Color3(1, 1, 0)
        mat.disableLighting = true
        bullet.material = mat

        // Physics
        bullet.physicsImpostor = new PhysicsImpostor(
            bullet,
            PhysicsImpostor.SphereImpostor,
            { mass: 0.1, restitution: 0 },
            this.scene
        )

        // Zero Gravity (Hitscan feel)
        // @ts-ignore
        bullet.physicsImpostor.physicsBody.setGravityFactor(0)

        // Velocity (5x speed)
        const speed = 200 // Increased from typical ~40-50
        bullet.physicsImpostor.applyImpulse(direction.scale(speed), bullet.getAbsolutePosition())

        // Visual Tracer (Short lifetime)
        const trail = MeshBuilder.CreateLines('trail', {
            points: [muzzleFlashPos, muzzleFlashPos.add(direction.scale(2))], // Short visual line
            updatable: true,
            instance: null
        }, this.scene)
        trail.color = new Color3(1, 0.9, 0.2)

        // Parent trail to bullet so it moves with it? 
        // Actually, for a tracer effect, we might just want a trail following the bullet.
        // But the user asked to "make it disappear faster OR make the visual mesh shorter".
        // Let's just make the bullet itself the visual and maybe add a small trail if needed.
        // For now, let's stick to the bullet being the projectile.

        // Cleanup bullet after 2 seconds
        setTimeout(() => {
            bullet.dispose()
            trail.dispose()
        }, 2000)

        // Collision Handling
        bullet.actionManager = new ActionManager(this.scene)
        bullet.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: { mesh: null } // Collide with anything
                },
                (evt: ActionEvent) => {
                    const hitMesh = evt.source as Mesh
                    if (hitMesh === bullet || hitMesh === this.currentWeapon || hitMesh.name === 'trail') return

                    // Create hit marker
                    const marker = MeshBuilder.CreateSphere('hit', { diameter: 0.1 }, this.scene)
                    marker.position = bullet.position.clone()
                    const markerMat = new StandardMaterial('hitMat', this.scene)
                    markerMat.emissiveColor = new Color3(1, 0, 0)
                    marker.material = markerMat

                    setTimeout(() => marker.dispose(), 200)

                    // Damage Logic
                    if (hitMesh.metadata) {
                        if (hitMesh.metadata.parentClass && 'takeDamage' in hitMesh.metadata.parentClass) {
                            const damageable = hitMesh.metadata.parentClass as IDamageable
                            const damage = 25
                            const isHeadshot = hitMesh.metadata.isHeadshot || false
                            const finalDamage = isHeadshot ? damage * 4 : damage
                            damageable.takeDamage(finalDamage)

                            if (damageable.isDead() && this.hudController) {
                                this.hudController.showKillFeed('Player', 'Enemy', 'Vandal', isHeadshot)
                            }
                        }

                        if (hitMesh.metadata.isTarget) {
                            if (this.hudController) {
                                this.hudController.showKillFeed('Player', 'Training_Bot', 'Vandal', false)
                            }
                            hitMesh.dispose()
                        }
                    }

                    // Dispose bullet on impact
                    bullet.dispose()
                    trail.dispose()
                }
            )
        )

        // Alternative: Use Physics Collision Event if ActionManager is not reliable with physics
        // But ActionManager OnIntersection might work if impostors intersect. 
        // Let's rely on physics impostor collision callback if possible, but Babylon's ActionManager is easier to set up quickly.
        // However, for high speed bullets, raycast is often better. But user specifically asked for physics body and gravity factor 0.

        // Let's add a simple onCollide to the physics impostor
        const impostors = this.scene.meshes
            .filter(m => m.physicsImpostor)
            .map(m => m.physicsImpostor!)

        bullet.physicsImpostor.registerOnPhysicsCollide(impostors, (main, collided) => {
            const collidedMesh = collided.object as AbstractMesh
            if (collidedMesh === this.currentWeapon || collidedMesh.name === 'trail' || collidedMesh.name === 'skybox') return

            // Handle collision logic here (similar to above)
            // ...
            // For now, let's stick to the ActionManager or just let it bounce if we don't want to overcomplicate in one go.
            // But we need to detect hits.

            // Actually, high speed bullets might tunnel through objects.
            // Raycast is safer for hit detection, but user wants physics.
            // I will stick to the user's request: "When creating the bullet physics, set physicsBody.setGravityFactor(0)..."
        })
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
