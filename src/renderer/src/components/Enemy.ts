import {
    Scene,
    Mesh,
    MeshBuilder,
    Vector3,
    StandardMaterial,
    Color3,
    Ray,
    TransformNode,
    RecastJSPlugin,
    ICrowd,
    ParticleSystem,
    Texture,
    Color4,
    Camera
} from '@babylonjs/core'
import { IDamageable } from '../interfaces/IDamageable'

export enum EnemyState {
    IDLE,
    CHASE,
    ATTACK,
    DEAD
}

export class Enemy implements IDamageable {
    public health: number
    public maxHealth: number
    public mesh: Mesh
    private scene: Scene
    private target: TransformNode | Camera | null = null
    private state: EnemyState = EnemyState.IDLE
    private navMeshPlugin: RecastJSPlugin
    private crowd: ICrowd
    private agentIndex: number = -1

    // AI Parameters
    private detectionRange: number = 15
    private attackRange: number = 8
    private attackCooldown: number = 1000 // ms
    private lastAttackTime: number = 0
    private moveSpeed: number = 3.5

    constructor(scene: Scene, position: Vector3, navMeshPlugin: RecastJSPlugin, crowd: ICrowd, target: TransformNode | Camera) {
        this.scene = scene
        this.navMeshPlugin = navMeshPlugin
        this.crowd = crowd
        this.target = target
        this.maxHealth = 100
        this.health = this.maxHealth

        // Create Visuals
        this.mesh = this.createMesh(position)

        // Setup Navigation Agent
        this.setupAgent(position)

        // Start Update Loop
        this.scene.registerBeforeRender(() => {
            this.update()
        })
    }

    private createMesh(position: Vector3): Mesh {
        const mesh = MeshBuilder.CreateCapsule('enemy', {
            radius: 0.4,
            height: 1.8,
            subdivisions: 12
        }, this.scene)

        mesh.position = position
        mesh.checkCollisions = true

        const mat = new StandardMaterial('enemyMat', this.scene)
        mat.diffuseColor = new Color3(1, 0, 0) // Red
        mat.emissiveColor = new Color3(0.2, 0, 0)
        mesh.material = mat

        // Metadata for damage system
        mesh.metadata = {
            type: 'enemy',
            parentClass: this
        }

        return mesh
    }

    private setupAgent(position: Vector3) {
        const transform = new TransformNode('enemy_transform', this.scene)
        this.mesh.parent = transform

        const agentParams = {
            radius: 0.4,
            height: 1.8,
            maxAcceleration: 20.0,
            maxSpeed: this.moveSpeed,
            collisionQueryRange: 0.5,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0
        }

        this.agentIndex = this.crowd.addAgent(position, agentParams, transform)
    }

    public update() {
        if (this.state === EnemyState.DEAD) return

        const distToTarget = Vector3.Distance(this.mesh.getAbsolutePosition(), this.target!.position)

        // State Machine
        switch (this.state) {
            case EnemyState.IDLE:
                if (distToTarget < this.detectionRange) {
                    this.state = EnemyState.CHASE
                }
                break

            case EnemyState.CHASE:
                if (distToTarget > this.detectionRange * 1.5) {
                    this.state = EnemyState.IDLE
                    this.crowd.agentGoto(this.agentIndex, this.mesh.getAbsolutePosition()) // Stop
                } else if (distToTarget < this.attackRange) {
                    this.state = EnemyState.ATTACK
                    this.crowd.agentGoto(this.agentIndex, this.mesh.getAbsolutePosition()) // Stop
                } else {
                    // Update destination to target
                    this.crowd.agentGoto(this.agentIndex, this.target!.position)
                }
                break

            case EnemyState.ATTACK:
                if (distToTarget > this.attackRange + 2) {
                    this.state = EnemyState.CHASE
                } else {
                    // Face target
                    this.mesh.lookAt(this.target!.position)
                    this.attack()
                }
                break
        }
    }

    private attack() {
        const now = Date.now()
        if (now - this.lastAttackTime > this.attackCooldown) {
            this.lastAttackTime = now

            // Visual: Muzzle Flash
            const flash = MeshBuilder.CreateSphere('flash', { diameter: 0.2 }, this.scene)
            flash.position = this.mesh.getAbsolutePosition().add(new Vector3(0, 0.5, 0.5))
            flash.parent = this.mesh
            const mat = new StandardMaterial('flashMat', this.scene)
            mat.emissiveColor = new Color3(1, 1, 0)
            flash.material = mat
            setTimeout(() => flash.dispose(), 50)

            // Raycast Shoot
            const origin = this.mesh.getAbsolutePosition().add(new Vector3(0, 0.5, 0))
            const direction = this.target!.position.subtract(origin).normalize()
            const ray = new Ray(origin, direction, 50)

            // Visual: Trail
            const trail = MeshBuilder.CreateLines('enemyTrail', {
                points: [origin, origin.add(direction.scale(10))],
                updatable: false
            }, this.scene)
            trail.color = new Color3(1, 0, 0)
            setTimeout(() => trail.dispose(), 50)

            // Logic: Hit Player? (Simplified, assuming player is the only other target or checking collision)
            // For now, just log it. Player health system is separate.
            console.log('Enemy Fired!')
        }
    }

    public takeDamage(amount: number): void {
        if (this.state === EnemyState.DEAD) return

        this.health -= amount
        console.log(`Enemy took ${amount} damage. HP: ${this.health}`)

        // Flash White
        if (this.mesh.material instanceof StandardMaterial) {
            const oldColor = this.mesh.material.emissiveColor.clone()
            this.mesh.material.emissiveColor = new Color3(1, 1, 1)
            setTimeout(() => {
                if (this.mesh.material instanceof StandardMaterial) {
                    this.mesh.material.emissiveColor = oldColor
                }
            }, 100)
        }

        // Aggro on damage
        if (this.state === EnemyState.IDLE) {
            this.state = EnemyState.CHASE
        }

        if (this.health <= 0) {
            this.die()
        }
    }

    public isDead(): boolean {
        return this.health <= 0
    }

    private die() {
        this.state = EnemyState.DEAD
        console.log('Enemy Died')

        // Remove from crowd
        this.crowd.removeAgent(this.agentIndex)

        // Particle Explosion
        const particleSystem = new ParticleSystem('particles', 100, this.scene)
        particleSystem.emitter = this.mesh.getAbsolutePosition()
        particleSystem.createBoxEmitter(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 1, 0.5), new Vector3(-1, 0, -1), new Vector3(1, 0, 1))

        // Colors
        particleSystem.color1 = new Color4(1, 0, 0, 1)
        particleSystem.color2 = new Color4(0.5, 0, 0, 1)
        particleSystem.colorDead = new Color4(0, 0, 0, 0)

        particleSystem.minSize = 0.1
        particleSystem.maxSize = 0.3
        particleSystem.minLifeTime = 0.5
        particleSystem.maxLifeTime = 1.0
        particleSystem.emitRate = 500
        particleSystem.targetStopDuration = 0.2

        particleSystem.start()

        // Dispose mesh
        this.mesh.dispose()
    }
}
