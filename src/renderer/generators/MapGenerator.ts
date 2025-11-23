import { Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh, PointLight, GlowLayer } from '@babylonjs/core'

/**
 * Protocol: Zero - Map Generator
 * Generates "The Range" training map with neon grid aesthetic
 */
export class MapGenerator {
    private scene: Scene
    private glowLayer: GlowLayer

    constructor(scene: Scene) {
        this.scene = scene

        // Enable glow layer for neon aesthetics
        this.glowLayer = new GlowLayer('glow', scene)
        this.glowLayer.intensity = 0.8
    }

    /**
     * Generate "The Range" - Training Ground
     */
    generateTheRange(): void {
        console.log('[MapGen] Generating The Range...')

        // 1. Main Floor (Large)
        this.createNeonFloor(new Vector3(0, 0, 0), 100, 100)

        // 2. Walls (Arena Boundaries)
        this.createNeonWall(new Vector3(0, 2, 50), 100, 4, 0.5)   // Back wall
        this.createNeonWall(new Vector3(0, 2, -50), 100, 4, 0.5)  // Front wall
        this.createNeonWall(new Vector3(-50, 2, 0), 0.5, 4, 100)  // Left wall
        this.createNeonWall(new Vector3(50, 2, 0), 0.5, 4, 100)   // Right wall

        // 3. Cover Boxes (Scattered around)
        this.createCoverBox(new Vector3(5, 0.5, 10))
        this.createCoverBox(new Vector3(-5, 0.5, 10))
        this.createCoverBox(new Vector3(10, 0.5, 20))
        this.createCoverBox(new Vector3(-10, 0.5, 20))
        this.createCoverBox(new Vector3(0, 0.5, 25))

        // 4. Tall Pillars (For cover)
        this.createPillar(new Vector3(15, 0, 15), 3)
        this.createPillar(new Vector3(-15, 0, 15), 3)
        this.createPillar(new Vector3(15, 0, 30), 4)
        this.createPillar(new Vector3(-15, 0, 30), 4)

        // 5. Shooting Range Targets
        this.createTarget(new Vector3(0, 1.5, 40))
        this.createTarget(new Vector3(-5, 1.5, 40))
        this.createTarget(new Vector3(5, 1.5, 40))

        // 6. Platform (Elevated position)
        this.createPlatform(new Vector3(20, 0, 35), 5, 3)

        // 7. Additional Point Lights (Illuminate the scene)
        this.createPointLight(new Vector3(0, 5, 20), new Color3(0, 1, 1), 30)
        this.createPointLight(new Vector3(20, 5, 30), new Color3(1, 0.5, 0), 25)
        this.createPointLight(new Vector3(-20, 5, 30), new Color3(0.5, 0, 1), 25)

        console.log('✓ The Range generated')
    }

    /**
     * Create neon grid floor
     */
    private createNeonFloor(position: Vector3, width: number, depth: number): Mesh {
        const floor = MeshBuilder.CreateGround('floor', {
            width: width,
            height: depth,
            subdivisions: 30
        }, this.scene)
        floor.position = position

        const mat = new StandardMaterial('floorMat', this.scene)
        mat.diffuseColor = new Color3(0.02, 0.02, 0.02) // Very dark base
        mat.emissiveColor = new Color3(0, 0.05, 0.1) // Subtle cyan glow (reduced)
        mat.specularColor = new Color3(0.3, 0.3, 0.3) // Lower reflectivity
        mat.specularPower = 128
        floor.material = mat

        return floor
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
        mat.emissiveColor = new Color3(0, 0.4, 0.6) // Bright cyan edges
        mat.specularPower = 64
        wall.material = mat

        return wall
    }

    /**
     * Create cover box (like Valorant boxes)
     */
    private createCoverBox(position: Vector3): Mesh {
        const box = MeshBuilder.CreateBox('coverBox', {
            width: 1.5,
            height: 1,
            depth: 1.5
        }, this.scene)
        box.position = position

        const mat = new StandardMaterial('boxMat', this.scene)
        mat.diffuseColor = new Color3(0.2, 0.2, 0.25)
        mat.emissiveColor = new Color3(0.8, 0.5, 0) // Orange glow
        mat.specularPower = 32
        box.material = mat

        return box
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
        mat.emissiveColor = new Color3(0, 0.5, 0.8) // Cyan
        mat.specularPower = 64
        pillar.material = mat

        return pillar
    }

    /**
     * Create shooting target
     */
    private createTarget(position: Vector3): Mesh {
        // Outer ring
        const outer = MeshBuilder.CreateSphere('targetOuter', {
            diameter: 1,
            segments: 16
        }, this.scene)
        outer.position = position

        const outerMat = new StandardMaterial('targetOuterMat', this.scene)
        outerMat.diffuseColor = new Color3(0.8, 0, 0)
        outerMat.emissiveColor = new Color3(1, 0, 0) // Red glow
        outer.material = outerMat

        // Center bullseye
        const center = MeshBuilder.CreateSphere('targetCenter', {
            diameter: 0.3,
            segments: 16
        }, this.scene)
        center.position = position.add(new Vector3(0, 0, -0.1))

        const centerMat = new StandardMaterial('targetCenterMat', this.scene)
        centerMat.diffuseColor = new Color3(1, 1, 1)
        centerMat.emissiveColor = new Color3(1, 1, 0) // Yellow glow
        center.material = centerMat

        outer.metadata = { isTarget: true }
        center.metadata = { isTarget: true, isHeadshot: true }

        return outer
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
        mat.emissiveColor = new Color3(0.5, 0, 1) // Purple glow
        mat.specularPower = 64
        platform.material = mat

        // Add ramp
        const ramp = MeshBuilder.CreateBox('ramp', {
            width: width,
            height: 0.1,
            depth: 3
        }, this.scene)
        ramp.position = new Vector3(position.x, 1, position.z - depth / 2 - 1.5)
        ramp.rotation.x = Math.PI / 6
        ramp.material = mat

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
