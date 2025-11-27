import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh, PointLight, GlowLayer, DynamicTexture, PhysicsImpostor } from '@babylonjs/core'

/**
 * Protocol: Zero - Map Generator
 * Generates "The Range" training map with neon grid aesthetic
 */
export class MapGenerator {
    private scene: Scene
    // private glowLayer: GlowLayer
    public staticMeshes: Mesh[] = []

    constructor(scene: Scene) {
        this.scene = scene

        // Enable glow layer for neon aesthetics
        // this.glowLayer = new GlowLayer('glow', scene)
        // this.glowLayer.intensity = 0.8
    }

    /**
     * Generate "The Range" - Training Ground
     */
    generateTheRange(): void {
        console.log('[MapGen] Generating The Range...')

        // 1. Main Floor with Procedural Grid Texture
        this.createGridFloor(new Vector3(0, 0, 0), 100, 100)

        // 2. Walls (Arena Boundaries)
        this.createNeonWall(new Vector3(0, 2, 50), 100, 4, 0.5)   // Back wall
        this.createNeonWall(new Vector3(0, 2, -50), 100, 4, 0.5)  // Front wall
        this.createNeonWall(new Vector3(-50, 2, 0), 0.5, 4, 100)  // Left wall
        this.createNeonWall(new Vector3(50, 2, 0), 0.5, 4, 100)   // Right wall

        // 3. Random Height Cover Boxes (Obstacles)
        this.createRandomCoverBoxes(15)

        // 4. Tall Pillars (For cover)
        this.createPillar(new Vector3(15, 0, 15), 3)
        this.createPillar(new Vector3(-15, 0, 15), 3)
        this.createPillar(new Vector3(15, 0, 30), 4)
        this.createPillar(new Vector3(-15, 0, 30), 4)

        // 5. Wall-Mounted Targets with Concentric Circles
        this.createTargetPlane(new Vector3(0, 2, 49.5), 0)
        this.createTargetPlane(new Vector3(-10, 2, 49.5), 0)
        this.createTargetPlane(new Vector3(10, 2, 49.5), 0)
        this.createTargetPlane(new Vector3(-20, 3, 49.5), 0)
        this.createTargetPlane(new Vector3(20, 3, 49.5), 0)

        // 6. Platform (Elevated position)
        this.createPlatform(new Vector3(20, 0, 35), 5, 3)

        // 7. Invisible Physics Boundaries
        this.createInvisibleBoundaries(100, 100)

        // 8. Additional Point Lights (Illuminate the scene)
        this.createPointLight(new Vector3(0, 5, 20), new Color3(0, 1, 1), 30)
        this.createPointLight(new Vector3(20, 5, 30), new Color3(1, 0.5, 0), 25)
        this.createPointLight(new Vector3(-20, 5, 30), new Color3(0.5, 0, 1), 25)

        console.log('✓ The Range generated with procedural textures')
    }

    /**
     * Create floor with procedural grid texture
     */
    private createGridFloor(position: Vector3, width: number, depth: number): Mesh {
        const floor = MeshBuilder.CreateGround('floor', {
            width: width,
            height: depth,
            subdivisions: 30
        }, this.scene)
        floor.position = position

        // Create procedural grid texture
        const gridTexture = new DynamicTexture('gridTexture', 512, this.scene, false)
        const ctx = gridTexture.getContext()

        // Dark background
        ctx.fillStyle = '#0a0a0f'
        ctx.fillRect(0, 0, 512, 512)

        // Draw grid lines
        ctx.strokeStyle = '#00e5ff'
        ctx.lineWidth = 2
        const gridSize = 64

        for (let i = 0; i <= 512; i += gridSize) {
            // Vertical lines
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 512)
            ctx.stroke()

            // Horizontal lines
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(512, i)
            ctx.stroke()
        }

        gridTexture.update()

        const mat = new StandardMaterial('floorMat', this.scene)
        mat.diffuseTexture = gridTexture
        mat.emissiveColor = new Color3(0, 0, 0) // No glow
        mat.specularColor = new Color3(0.2, 0.2, 0.2)
        mat.specularPower = 128
        floor.material = mat

        this.staticMeshes.push(floor)
        return floor
    }

    /**
     * Create random height cover boxes
     */
    private createRandomCoverBoxes(count: number): void {
        for (let i = 0; i < count; i++) {
            // Random position (avoid center spawn area)
            const x = (Math.random() - 0.5) * 80
            const z = Math.random() * 40 + 10 // Between 10 and 50

            // Random height between 0.5m and 2.5m
            const height = 0.5 + Math.random() * 2.0

            const box = MeshBuilder.CreateBox(`coverBox_${i}`, {
                width: 1.5,
                height: height,
                depth: 1.5
            }, this.scene)
            box.position = new Vector3(x, height / 2, z)

            const mat = new StandardMaterial(`boxMat_${i}`, this.scene)
            mat.diffuseColor = new Color3(0.2, 0.2, 0.25)
            mat.emissiveColor = new Color3(0, 0, 0) // No glow
            mat.specularPower = 32
            box.material = mat

            // Add physics for collision
            box.physicsImpostor = new PhysicsImpostor(
                box,
                PhysicsImpostor.BoxImpostor,
                { mass: 0, restitution: 0.1 },
                this.scene
            )
        }
        console.log(`✓ Generated ${count} random cover boxes`)
    }

    /**
     * Create wall-mounted target with concentric circles
     */
    private createTargetPlane(position: Vector3, rotationY: number): Mesh {
        const target = MeshBuilder.CreatePlane('target', {
            size: 2
        }, this.scene)
        target.position = position
        target.rotation.y = rotationY

        // Create concentric circle texture
        const texture = new DynamicTexture('targetTexture', 512, this.scene, false)
        const ctx = texture.getContext()

        // Background
        ctx.fillStyle = '#1a1a1f'
        ctx.fillRect(0, 0, 512, 512)

        const centerX = 256
        const centerY = 256

        // Draw concentric circles
        const circles = [
            { radius: 200, color: '#ff4655', width: 3 },
            { radius: 150, color: '#ff6b77', width: 3 },
            { radius: 100, color: '#ff8899', width: 3 },
            { radius: 50, color: '#ffaaaa', width: 3 },
            { radius: 20, color: '#ffff00', width: 4 } // Yellow bullseye
        ]

        circles.forEach(circle => {
            ctx.beginPath()
            ctx.arc(centerX, centerY, circle.radius, 0, 2 * Math.PI)
            ctx.strokeStyle = circle.color
            ctx.lineWidth = circle.width
            ctx.stroke()
        })

        // Fill bullseye
        ctx.beginPath()
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffff00'
        ctx.fill()

        texture.update()

        const mat = new StandardMaterial('targetMat', this.scene)
        mat.diffuseTexture = texture
        mat.emissiveColor = new Color3(0, 0, 0) // No glow
        mat.backFaceCulling = false
        target.material = mat

        target.metadata = { isTarget: true }

        return target
    }

    /**
     * Create invisible physics boundaries
     */
    private createInvisibleBoundaries(width: number, depth: number): void {
        const boundaryHeight = 10
        const thickness = 1

        const boundaries = [
            { pos: new Vector3(0, boundaryHeight / 2, depth / 2 + thickness), size: { w: width, h: boundaryHeight, d: thickness } }, // Back
            { pos: new Vector3(0, boundaryHeight / 2, -depth / 2 - thickness), size: { w: width, h: boundaryHeight, d: thickness } }, // Front
            { pos: new Vector3(-width / 2 - thickness, boundaryHeight / 2, 0), size: { w: thickness, h: boundaryHeight, d: depth } }, // Left
            { pos: new Vector3(width / 2 + thickness, boundaryHeight / 2, 0), size: { w: thickness, h: boundaryHeight, d: depth } }  // Right
        ]

        boundaries.forEach((boundary, index) => {
            const wall = MeshBuilder.CreateBox(`boundary_${index}`, {
                width: boundary.size.w,
                height: boundary.size.h,
                depth: boundary.size.d
            }, this.scene)
            wall.position = boundary.pos
            wall.isVisible = false // Invisible

            // Add physics impostor
            wall.physicsImpostor = new PhysicsImpostor(
                wall,
                PhysicsImpostor.BoxImpostor,
                { mass: 0, restitution: 0 },
                this.scene
            )
        })

        console.log('✓ Invisible boundaries created')
    }

    /**
     * Create neon wall
     */
    private createNeonWall(position: Vector3, width: number, height: number, depth: number): Mesh {
        const wall = MeshBuilder.CreateBox('wall', {
            width: width,
            height: height,
            depth: depth
        }, this.scene)
        wall.position = position

        const mat = new StandardMaterial('wallMat', this.scene)
        mat.diffuseColor = new Color3(0.1, 0.1, 0.15)
        mat.emissiveColor = new Color3(0, 0, 0) // No glow
        mat.specularPower = 64
        wall.material = mat

        // Add physics
        wall.physicsImpostor = new PhysicsImpostor(
            wall,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.1 },
            this.scene
        )

        wall.material = mat

        this.staticMeshes.push(wall)
        return wall
    }

    /**
     * Create tall pillar
     */
    private createPillar(position: Vector3, height: number): Mesh {
        const pillar = MeshBuilder.CreateCylinder('pillar', {
            diameter: 0.8,
            height: height,
            tessellation: 8
        }, this.scene)
        pillar.position = new Vector3(position.x, height / 2, position.z)

        const mat = new StandardMaterial('pillarMat', this.scene)
        mat.diffuseColor = new Color3(0.15, 0.15, 0.2)
        mat.emissiveColor = new Color3(0, 0, 0) // No glow
        mat.specularPower = 64
        pillar.material = mat

        // Add physics
        pillar.physicsImpostor = new PhysicsImpostor(
            pillar,
            PhysicsImpostor.CylinderImpostor,
            { mass: 0, restitution: 0.1 },
            this.scene
        )

        pillar.material = mat

        this.staticMeshes.push(pillar)
        return pillar
    }

    /**
     * Create elevated platform
     */
    private createPlatform(position: Vector3, width: number, depth: number): Mesh {
        const platform = MeshBuilder.CreateBox('platform', {
            width: width,
            height: 0.3,
            depth: depth
        }, this.scene)
        platform.position = new Vector3(position.x, 2, position.z)

        const mat = new StandardMaterial('platformMat', this.scene)
        mat.diffuseColor = new Color3(0.15, 0.15, 0.2)
        mat.emissiveColor = new Color3(0, 0, 0) // No glow
        mat.specularPower = 64
        platform.material = mat

        // Add physics
        platform.physicsImpostor = new PhysicsImpostor(
            platform,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.1 },
            this.scene
        )

        // Add ramp
        const ramp = MeshBuilder.CreateBox('ramp', {
            width: width,
            height: 0.1,
            depth: 3
        }, this.scene)
        ramp.position = new Vector3(position.x, 1, position.z - depth / 2 - 1.5)
        ramp.rotation.x = Math.PI / 6
        ramp.material = mat

        ramp.physicsImpostor = new PhysicsImpostor(
            ramp,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.1 },
            this.scene
        )

        this.staticMeshes.push(platform)
        this.staticMeshes.push(ramp)
        return platform
    }

    /**
     * Create point light
     */
    private createPointLight(position: Vector3, color: Color3, intensity: number): void {
        const light = new PointLight('pointLight', position, this.scene)
        light.diffuse = color
        light.specular = color
        light.intensity = intensity
        light.range = 50
    }
}
