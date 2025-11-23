import {
    Scene,
    Mesh,
    MeshBuilder,
    Vector3,
    StandardMaterial,
    Color3,
    ParticleSystem,
    Texture,
    Color4,
    Animation,
    PolyhedronBuilder
} from '@babylonjs/core'

/**
 * Protocol: Zero - Character Generator
 * Generates "Composite Constructs" style characters
 * 聚合構造體：破碎幾何 + 懸浮碎片 + 粒子系統
 */
export class CharacterGenerator {
    private scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
    }

    /**
     * Vector (決鬥者) - Duelist
     * 特徵：破碎幾何體、懸浮三角碎片、粒子拖尾
     */
    generateVector(position: Vector3): Mesh {
        console.log('[CharGen] Generating VECTOR (Duelist)...')

        // 核心 (Core) - 能量中心
        const core = MeshBuilder.CreateBox('vector_core', { size: 0.4 }, this.scene)
        core.position = position.clone()

        const coreMat = new StandardMaterial('vector_core_mat', this.scene)
        coreMat.diffuseColor = new Color3(0, 0.8, 1) // Cyan
        coreMat.emissiveColor = new Color3(0, 0.5, 0.8) // Glow
        coreMat.specularPower = 128
        core.material = coreMat

        // 生成 40 個懸浮三角碎片 (Floating Shards)
        const shardCount = 40
        const shards: Mesh[] = []

        for (let i = 0; i < shardCount; i++) {
            // 使用 Tetrahedron (四面體) 作為銳利碎片
            const shard = MeshBuilder.CreatePolyhedron(
                `vector_shard_${i}`,
                { type: 0, size: 0.08 + Math.random() * 0.05 },
                this.scene
            )

            // 在核心周圍隨機分布
            const angle = (i / shardCount) * Math.PI * 2
            const radius = 0.3 + Math.random() * 0.2
            const height = Math.random() * 1.5 - 0.3

            shard.position = new Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            )
            shard.parent = core

            // 隨機旋轉
            shard.rotation = new Vector3(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            )

            // 銳利碎片材質
            const shardMat = new StandardMaterial(`vector_shard_mat_${i}`, this.scene)
            shardMat.diffuseColor = new Color3(0.1, 0.6, 0.9)
            shardMat.emissiveColor = new Color3(0, 0.2, 0.4)
            shardMat.specularColor = new Color3(1, 1, 1)
            shardMat.specularPower = 64
            shard.material = shardMat

            shards.push(shard)
        }

        // 微幅浮動動畫 (Floating Animation)
        this.scene.registerBeforeRender(() => {
            const time = Date.now() * 0.001
            shards.forEach((shard, i) => {
                // 每個碎片有不同的浮動節奏
                const offset = i * 0.1
                shard.position.y += Math.sin(time + offset) * 0.0005
                shard.rotation.y += 0.002
            })
        })

        // 頭部：發光箭頭晶體 (Glowing Arrow Crystal)
        const head = MeshBuilder.CreateCylinder('vector_head', {
            diameterTop: 0,
            diameterBottom: 0.2,
            height: 0.3,
        }, this.scene)
        head.position.y = 1.2
        head.rotation.x = Math.PI // 指向上方
        head.parent = core

        const headMat = new StandardMaterial('vector_head_mat', this.scene)
        headMat.diffuseColor = new Color3(0, 1, 1)
        headMat.emissiveColor = new Color3(0, 0.8, 1) // 強烈發光
        headMat.alpha = 0.9
        head.material = headMat

        // 旋轉數據環 (Rotating Data Ring)
        const ring = MeshBuilder.CreateTorus('vector_ring', {
            diameter: 0.4,
            thickness: 0.02,
            tessellation: 32
        }, this.scene)
        ring.position.y = 1.3
        ring.parent = core

        const ringMat = new StandardMaterial('vector_ring_mat', this.scene)
        ringMat.emissiveColor = new Color3(0, 1, 1)
        ringMat.alpha = 0.7
        ring.material = ringMat

        // 環旋轉動畫
        this.scene.registerBeforeRender(() => {
            ring.rotation.y += 0.05
            ring.rotation.x = Math.sin(Date.now() * 0.001) * 0.3
        })

        // ✨ 粒子拖尾系統 (Trail Particle System)
        const particleSystem = new ParticleSystem('vector_trail', 200, this.scene)

        // 使用純色發光粒子（不需要貼圖）
        particleSystem.emitter = core
        particleSystem.minEmitBox = new Vector3(-0.2, 0, -0.2)
        particleSystem.maxEmitBox = new Vector3(0.2, 0, 0.2)

        // 粒子顏色 - 青色漸變
        particleSystem.color1 = new Color4(0, 1, 1, 1)
        particleSystem.color2 = new Color4(0, 0.5, 1, 0.5)
        particleSystem.colorDead = new Color4(0, 0.2, 0.5, 0)

        // 粒子大小
        particleSystem.minSize = 0.03
        particleSystem.maxSize = 0.08

        // 粒子壽命
        particleSystem.minLifeTime = 0.3
        particleSystem.maxLifeTime = 0.8

        // 發射速率
        particleSystem.emitRate = 50

        // 重力與速度
        particleSystem.gravity = new Vector3(0, -2, 0)
        particleSystem.direction1 = new Vector3(-0.5, -0.5, -0.5)
        particleSystem.direction2 = new Vector3(0.5, 0.5, 0.5)
        particleSystem.minEmitPower = 1
        particleSystem.maxEmitPower = 2

        particleSystem.start()
        console.log('✓ Vector generated with particle trail')

        return core
    }

    /**
     * Bastion (守衛) - Sentinel
     * 特徵：六邊形裝甲、發光縫隙、懸浮護盾
     */
    generateBastion(position: Vector3): Mesh {
        console.log('[CharGen] Generating BASTION (Sentinel)...')

        const root = new Mesh('bastion', this.scene)
        root.position = position.clone()

        // 主軀幹 - 堆疊的六邊形裝甲板
        const plates: Mesh[] = []
        const plateCount = 5

        for (let i = 0; i < plateCount; i++) {
            const plate = MeshBuilder.CreateCylinder(`bastion_plate_${i}`, {
                diameter: 0.5 - i * 0.05,
                height: 0.15,
                tessellation: 6 // 六邊形
            }, this.scene)

            plate.position.y = i * 0.2
            plate.parent = root

            // 裝甲板材質 - 深灰 + 黃色發光邊緣
            const plateMat = new StandardMaterial(`bastion_plate_mat_${i}`, this.scene)
            plateMat.diffuseColor = new Color3(0.2, 0.2, 0.25)
            plateMat.emissiveColor = new Color3(0.8, 0.6, 0) // 黃色光
            plateMat.specularPower = 32
            plate.material = plateMat

            plates.push(plate)
        }

        // 板塊之間的發光縫隙（使用薄圓盤模擬）
        for (let i = 0; i < plateCount - 1; i++) {
            const gap = MeshBuilder.CreateDisc(`bastion_gap_${i}`, {
                radius: 0.25,
                tessellation: 6
            }, this.scene)
            gap.position.y = i * 0.2 + 0.1
            gap.parent = root

            const gapMat = new StandardMaterial(`bastion_gap_mat_${i}`, this.scene)
            gapMat.emissiveColor = new Color3(1, 0.8, 0) // 強烈黃光
            gapMat.alpha = 0.7
            gap.material = gapMat
        }

        // 頭部 - 方正坦克結構
        const head = MeshBuilder.CreateBox('bastion_head', {
            width: 0.4,
            height: 0.25,
            depth: 0.3
        }, this.scene)
        head.position.y = 1.2
        head.parent = root

        const headMat = new StandardMaterial('bastion_head_mat', this.scene)
        headMat.diffuseColor = new Color3(0.3, 0.3, 0.35)
        headMat.emissiveColor = new Color3(0.5, 0.4, 0)
        head.material = headMat

        // 眼睛 - 橫向發光縫隙
        const eye = MeshBuilder.CreateBox('bastion_eye', {
            width: 0.35,
            height: 0.03,
            depth: 0.31
        }, this.scene)
        eye.position = new Vector3(0, 1.2, 0.15)
        eye.parent = root

        const eyeMat = new StandardMaterial('bastion_eye_mat', this.scene)
        eyeMat.emissiveColor = new Color3(1, 1, 0) // 黃色光
        eye.material = eyeMat

        // 肩膀懸浮護盾發生器 (Floating Shield Projectors)
        const leftShield = MeshBuilder.CreateSphere('bastion_left_shield', {
            diameter: 0.15,
            segments: 8
        }, this.scene)
        leftShield.position = new Vector3(-0.4, 0.8, 0)
        leftShield.parent = root

        const rightShield = leftShield.clone('bastion_right_shield')
        rightShield.position.x = 0.4
        rightShield.parent = root

        const shieldMat = new StandardMaterial('bastion_shield_mat', this.scene)
        shieldMat.diffuseColor = new Color3(0.5, 0.5, 0)
        shieldMat.emissiveColor = new Color3(0.8, 0.6, 0)
        shieldMat.alpha = 0.4
        leftShield.material = shieldMat
        rightShield.material = shieldMat

        // 護盾浮動動畫
        this.scene.registerBeforeRender(() => {
            const time = Date.now() * 0.002
            leftShield.position.y = 0.8 + Math.sin(time) * 0.05
            rightShield.position.y = 0.8 + Math.sin(time + Math.PI) * 0.05
        })

        console.log('✓ Bastion generated with hex armor')
        return root
    }

    /**
     * Nebula (控場者) - Controller
     * 特徵：體素煙霧、虛空輪廓、黑洞頭部
     */
    generateNebula(position: Vector3): Mesh {
        console.log('[CharGen] Generating NEBULA (Controller)...')

        const root = new Mesh('nebula', this.scene)
        root.position = position.clone()

        // 頭部 - 黑洞球體 + 吸積盤光環
        const head = MeshBuilder.CreateSphere('nebula_head', {
            diameter: 0.3,
            segments: 16
        }, this.scene)
        head.position.y = 1.5
        head.parent = root

        const headMat = new StandardMaterial('nebula_head_mat', this.scene)
        headMat.diffuseColor = new Color3(0.05, 0.05, 0.1) // 幾乎全黑
        headMat.emissiveColor = new Color3(0.1, 0, 0.2) // 微弱紫光
        head.material = headMat

        // 吸積盤光環 (Accretion Disk)
        const ring = MeshBuilder.CreateTorus('nebula_ring', {
            diameter: 0.5,
            thickness: 0.02,
            tessellation: 32
        }, this.scene)
        ring.position.y = 1.5
        ring.rotation.x = Math.PI / 2
        ring.parent = root

        const ringMat = new StandardMaterial('nebula_ring_mat', this.scene)
        ringMat.emissiveColor = new Color3(0.5, 0, 1) // 紫色
        ringMat.alpha = 0.7
        ring.material = ringMat

        // 環旋轉
        this.scene.registerBeforeRender(() => {
            ring.rotation.z += 0.03
        })

        // 體素煙霧身軀（使用多個半透明方塊模擬）
        const voxelCount = 80
        for (let i = 0; i < voxelCount; i++) {
            const voxel = MeshBuilder.CreateBox(`nebula_voxel_${i}`, {
                size: 0.05 + Math.random() * 0.03
            }, this.scene)

            // 在人形輪廓內隨機分布
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * 0.3
            const height = Math.random() * 1.2

            voxel.position = new Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            )
            voxel.parent = root

            // 半透明煙霧材質
            const voxelMat = new StandardMaterial(`nebula_voxel_mat_${i}`, this.scene)
            voxelMat.diffuseColor = new Color3(0.2, 0, 0.4)
            voxelMat.emissiveColor = new Color3(0.3, 0, 0.6)
            voxelMat.alpha = 0.3 + Math.random() * 0.3
            voxel.material = voxelMat

            // 粒子漂浮動畫
            const offset = i * 0.05
            this.scene.registerBeforeRender(() => {
                const time = Date.now() * 0.0008
                voxel.position.y += Math.sin(time + offset) * 0.0003
                voxel.rotation.y += 0.01
            })
        }

        console.log('✓ Nebula generated with voxel smoke')
        return root
    }

    /**
     * Pulse (先鋒) - Initiator
     * 特徵：雷達天線左臂、旋轉雷達盤頭部、脈衝光波
     */
    generatePulse(position: Vector3): Mesh {
        console.log('[CharGen] Generating PULSE (Initiator)...')

        const root = new Mesh('pulse', this.scene)
        root.position = position.clone()

        // 軀幹
        const body = MeshBuilder.CreateCylinder('pulse_body', {
            diameter: 0.4,
            height: 0.8
        }, this.scene)
        body.position.y = 0.6
        body.parent = root

        const bodyMat = new StandardMaterial('pulse_body_mat', this.scene)
        bodyMat.diffuseColor = new Color3(0.1, 0.2, 0.3)
        bodyMat.emissiveColor = new Color3(0, 0.3, 0.5)
        body.material = bodyMat

        // 右臂（正常機械臂）
        const rightArm = MeshBuilder.CreateCylinder('pulse_right_arm', {
            diameter: 0.1,
            height: 0.6
        }, this.scene)
        rightArm.position = new Vector3(0.3, 0.6, 0)
        rightArm.rotation.z = Math.PI / 6
        rightArm.parent = root

        rightArm.material = bodyMat

        // 左臂（巨大雷達天線）
        const leftArm = MeshBuilder.CreateCylinder('pulse_left_arm', {
            diameterTop: 0.5,
            diameterBottom: 0.1,
            height: 0.8
        }, this.scene)
        leftArm.position = new Vector3(-0.4, 0.7, 0)
        leftArm.rotation.z = -Math.PI / 4
        leftArm.parent = root

        const antennaMat = new StandardMaterial('pulse_antenna_mat', this.scene)
        antennaMat.diffuseColor = new Color3(0.3, 0.3, 0.4)
        antennaMat.emissiveColor = new Color3(0, 0.5, 1)
        antennaMat.wireframe = true // 網格狀天線
        leftArm.material = antennaMat

        // 頭部 - 旋轉雷達盤
        const head = MeshBuilder.CreateCylinder('pulse_head', {
            diameter: 0.4,
            height: 0.05
        }, this.scene)
        head.position.y = 1.3
        head.parent = root

        const headMat = new StandardMaterial('pulse_head_mat', this.scene)
        headMat.emissiveColor = new Color3(0, 0.8, 1)
        headMat.alpha = 0.8
        head.material = headMat

        // 雷達盤旋轉
        this.scene.registerBeforeRender(() => {
            head.rotation.y += 0.04
        })

        // 脈衝光波擴散效果
        const pulseRings: Mesh[] = []
        for (let i = 0; i < 3; i++) {
            const ring = MeshBuilder.CreateTorus(`pulse_ring_${i}`, {
                diameter: 0.5 + i * 0.2,
                thickness: 0.01,
                tessellation: 32
            }, this.scene)
            ring.position.y = 0.6
            ring.parent = root

            const ringMat = new StandardMaterial(`pulse_ring_mat_${i}`, this.scene)
            ringMat.emissiveColor = new Color3(0, 0.5, 1)
            ringMat.alpha = 0.5 - i * 0.15
            ring.material = ringMat

            pulseRings.push(ring)
        }

        // 脈衝擴散動畫
        this.scene.registerBeforeRender(() => {
            const time = Date.now() * 0.002
            pulseRings.forEach((ring, i) => {
                const scale = 1 + Math.sin(time - i * 0.5) * 0.3
                ring.scaling = new Vector3(scale, 1, scale)
                ring.material!.alpha = 0.5 - (scale - 1) * 0.5
            })
        })

        console.log('✓ Pulse generated with radar dish')
        return root
    }
}
