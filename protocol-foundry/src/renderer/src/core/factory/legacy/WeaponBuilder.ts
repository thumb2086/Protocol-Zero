import { Mesh, MeshBuilder, Scene, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";

/**
 * WeaponBuilder - 簡化的武器建構系統
 * 使用基本幾何體（Box, Cylinder）來創建武器模型
 */
export class WeaponBuilder {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * 完全清理武器 mesh（包括所有子 mesh）
     */
    static disposeWeapon(mesh: Mesh | null) {
        if (!mesh) return;

        // 清理所有子 mesh
        const children = mesh.getChildMeshes();
        children.forEach(child => {
            if (child.material) child.material.dispose();
            child.dispose();
        });

        // 清理 root mesh
        if (mesh.material) mesh.material.dispose();
        mesh.dispose();
    }

    /**
     * 創建 Classic 手槍
     */
    createClassic(): Mesh {
        const root = new Mesh("Classic", this.scene);

        // 材質
        const matMetal = new StandardMaterial("mat_metal", this.scene);
        matMetal.diffuseColor = new Color3(0.15, 0.15, 0.17);
        matMetal.specularColor = new Color3(0.3, 0.3, 0.3);

        const matSlide = new StandardMaterial("mat_slide", this.scene);
        matSlide.diffuseColor = new Color3(0.1, 0.1, 0.12);
        matSlide.specularColor = new Color3(0.4, 0.4, 0.4);

        const matBlack = new StandardMaterial("mat_black", this.scene);
        matBlack.diffuseColor = new Color3(0.05, 0.05, 0.05);

        // 1. 握把 (Grip/Frame)
        const grip = MeshBuilder.CreateBox("Grip", {
            width: 0.35,
            height: 1.8,
            depth: 1
        }, this.scene);
        grip.position = new Vector3(0, -0.2, 0);
        grip.material = matMetal;
        grip.parent = root;

        // 2. 滑套 (Slide) - 上部
        const slide = MeshBuilder.CreateBox("Slide", {
            width: 0.38,
            height: 0.55,
            depth: 2.2
        }, this.scene);
        slide.position = new Vector3(0, 1.05, 0.3);
        slide.material = matSlide;
        slide.parent = root;

        // 2a. 滑套刻槽 (Slide Serrations)
        for (let i = 0; i < 8; i++) {
            const serration = MeshBuilder.CreateBox(`Serration${i}`, {
                width: 0.4,
                height: 0.08,
                depth: 0.08
            }, this.scene);
            serration.position = new Vector3(0, 1.3, -0.6 + i * 0.15);
            serration.material = matBlack;
            serration.parent = root;
        }

        // 3. 槍管 (Barrel)
        const barrel = MeshBuilder.CreateCylinder("Barrel", {
            diameter: 0.18,
            height: 1.8
        }, this.scene);
        barrel.rotation.x = Math.PI / 2;
        barrel.position = new Vector3(0, 1.05, 2.25);
        barrel.material = matBlack;
        barrel.parent = root;

        // 4. 扳機 (Trigger)
        const trigger = MeshBuilder.CreateBox("Trigger", {
            width: 0.08,
            height: 0.25,
            depth: 0.15
        }, this.scene);
        trigger.position = new Vector3(0, 0.2, 0.35);
        trigger.material = matBlack;
        trigger.parent = root;

        // 5. 護弓 (Trigger Guard)
        const guard1 = MeshBuilder.CreateBox("TriggerGuard1", {
            width: 0.4,
            height: 0.08,
            depth: 0.08
        }, this.scene);
        guard1.position = new Vector3(0, 0, 0.2);
        guard1.material = matMetal;
        guard1.parent = root;

        const guard2 = MeshBuilder.CreateBox("TriggerGuard2", {
            width: 0.4,
            height: 0.4,
            depth: 0.08
        }, this.scene);
        guard2.position = new Vector3(0, 0, 0.6);
        guard2.material = matMetal;
        guard2.parent = root;

        const guard3 = MeshBuilder.CreateBox("TriggerGuard3", {
            width: 0.4,
            height: 0.08,
            depth: 0.08
        }, this.scene);
        guard3.position = new Vector3(0, -0.35, 0.4);
        guard3.material = matMetal;
        guard3.parent = root;

        // 6. 準星 (Front Sight)
        const frontSight = MeshBuilder.CreateBox("FrontSight", {
            width: 0.15,
            height: 0.15,
            depth: 0.1
        }, this.scene);
        frontSight.position = new Vector3(0, 1.4, 1.3);
        frontSight.material = matBlack;
        frontSight.parent = root;

        // 7. 照門 (Rear Sight)
        const rearSight = MeshBuilder.CreateBox("RearSight", {
            width: 0.25,
            height: 0.12,
            depth: 0.12
        }, this.scene);
        rearSight.position = new Vector3(0, 1.4, -0.6);
        rearSight.material = matBlack;
        rearSight.parent = root;

        return root;
    }

    /**
     * 創建 Vandal 突擊步槍  
     */
    createVandal(): Mesh {
        const root = new Mesh("Vandal", this.scene);

        // 材質
        const matReceiver = new StandardMaterial("mat_receiver", this.scene);
        matReceiver.diffuseColor = new Color3(0.12, 0.12, 0.14);

        const matBarrel = new StandardMaterial("mat_barrel", this.scene);
        matBarrel.diffuseColor = new Color3(0.08, 0.08, 0.08);
        matBarrel.specularColor = new Color3(0.3, 0.3, 0.3);

        const matWood = new StandardMaterial("mat_wood", this.scene);
        matWood.diffuseColor = new Color3(0.25, 0.18, 0.12);

        const matMag = new StandardMaterial("mat_mag", this.scene);
        matMag.diffuseColor = new Color3(0.15, 0.12, 0.1);

        // 1. 機匣 (Receiver)
        const receiver = MeshBuilder.CreateBox("Receiver", {
            width: 0.5,
            height: 0.65,
            depth: 3.5
        }, this.scene);
        receiver.position = new Vector3(0, 0, 0);
        receiver.material = matReceiver;
        receiver.parent = root;

        // 2. 槍管 (Barrel)
        const barrel = MeshBuilder.CreateCylinder("Barrel", {
            diameter: 0.32,
            height: 3
        }, this.scene);
        barrel.rotation.x = Math.PI / 2;
        barrel.position = new Vector3(0, 0.25, 3.25);
        barrel.material = matBarrel;
        barrel.parent = root;

        // 2a. 槍口制退器 (Muzzle Brake)
        const muzzle = MeshBuilder.CreateCylinder("Muzzle", {
            diameter: 0.4,
            height: 0.5
        }, this.scene);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position = new Vector3(0, 0.25, 4.95);
        muzzle.material = matBarrel;
        muzzle.parent = root;

        // 3. 導氣管 (Gas Tube)
        const gasTube = MeshBuilder.CreateCylinder("GasTube", {
            diameter: 0.12,
            height: 2
        }, this.scene);
        gasTube.rotation.x = Math.PI / 2;
        gasTube.position = new Vector3(0, 0.6, 2.5);
        gasTube.material = matBarrel;
        gasTube.parent = root;

        // 4. 護木/前握把 (Handguard)
        const handguard = MeshBuilder.CreateBox("Handguard", {
            width: 0.55,
            height: 0.5,
            depth: 2.5
        }, this.scene);
        handguard.position = new Vector3(0, -0.5, 1.5);
        handguard.material = matWood;
        handguard.parent = root;

        // 5. 彈匣 (Magazine - Curved)
        const magazine = MeshBuilder.CreateBox("Magazine", {
            width: 0.4,
            height: 1.8,
            depth: 0.7
        }, this.scene);
        magazine.position = new Vector3(0, -1.3, 0.5);
        magazine.rotation.x = -0.15; // Slight curve
        magazine.material = matMag;
        magazine.parent = root;

        // 6. 槍托 (Stock)
        const stock = MeshBuilder.CreateBox("Stock", {
            width: 0.45,
            height: 0.6,
            depth: 2.2
        }, this.scene);
        stock.position = new Vector3(0, 0, -2.85);
        stock.material = matWood;
        stock.parent = root;

        // 7. 握把 (Pistol Grip)
        const grip = MeshBuilder.CreateBox("Grip", {
            width: 0.35,
            height: 1.2,
            depth: 0.65
        }, this.scene);
        grip.position = new Vector3(0, -0.95, -0.5);
        grip.rotation.x = 0.2;
        grip.material = matReceiver;
        grip.parent = root;

        // 8. 扳機 (Trigger)
        const trigger = MeshBuilder.CreateBox("Trigger", {
            width: 0.1,
            height: 0.3,
            depth: 0.15
        }, this.scene);
        trigger.position = new Vector3(0, -0.25, -0.1);
        trigger.material = matBarrel;
        trigger.parent = root;

        // 9. 拉機柄 (Charging Handle)
        const chargingHandle = MeshBuilder.CreateBox("ChargingHandle", {
            width: 0.15,
            height: 0.15,
            depth: 0.4
        }, this.scene);
        chargingHandle.position = new Vector3(0.3, 0.45, -0.8);
        chargingHandle.material = matBarrel;
        chargingHandle.parent = root;

        return root;
    }

    /**
     * 創建 Phantom 消音步槍
     */
    createPhantom(): Mesh {
        const root = new Mesh("Phantom", this.scene);

        // 材質
        const matReceiver = new StandardMaterial("mat_receiver", this.scene);
        matReceiver.diffuseColor = new Color3(0.1, 0.1, 0.12);

        const matSilencer = new StandardMaterial("mat_silencer", this.scene);
        matSilencer.diffuseColor = new Color3(0.08, 0.08, 0.08);
        matSilencer.specularColor = new Color3(0.5, 0.5, 0.5);

        const matMag = new StandardMaterial("mat_mag", this.scene);
        matMag.diffuseColor = new Color3(0.12, 0.12, 0.12);

        // 1. 機匣 (Receiver)
        const receiver = MeshBuilder.CreateBox("Receiver", {
            width: 0.52,
            height: 0.65,
            depth: 3
        }, this.scene);
        receiver.position = new Vector3(0, 0, 0);
        receiver.material = matReceiver;
        receiver.parent = root;

        // 2. 消音器 (Silencer)
        const silencer = MeshBuilder.CreateCylinder("Silencer", {
            diameter: 0.45,
            height: 2.5
        }, this.scene);
        silencer.rotation.x = Math.PI / 2;
        silencer.position = new Vector3(0, 0.25, 2.95);
        silencer.material = matSilencer;
        silencer.parent = root;

        // 2a. 消音器散熱槽
        for (let i = 0; i < 8; i++) {
            const vent = MeshBuilder.CreateBox(`SilencerVent${i}`, {
                width: 0.48,
                height: 0.06,
                depth: 0.08
            }, this.scene);
            vent.position = new Vector3(0, 0.25, 1.9 + i * 0.25);
            vent.material = matSilencer;
            vent.parent = root;
        }

        // 3. 瞄準鏡導軌 (Scope Rail)
        const scopeRail = MeshBuilder.CreateBox("ScopeRail", {
            width: 0.25,
            height: 0.12,
            depth: 2.5
        }, this.scene);
        scopeRail.position = new Vector3(0, 0.7, 0);
        scopeRail.material = matReceiver;
        scopeRail.parent = root;

        // 4. 護木 (Handguard)
        const handguard = MeshBuilder.CreateBox("Handguard", {
            width: 0.55,
            height: 0.4,
            depth: 1.8
        }, this.scene);
        handguard.position = new Vector3(0, -0.52, 0.6);
        handguard.material = matReceiver;
        handguard.parent = root;

        // 5. 彈匣 (Magazine)
        const magazine = MeshBuilder.CreateBox("Magazine", {
            width: 0.38,
            height: 1.3,
            depth: 0.65
        }, this.scene);
        magazine.position = new Vector3(0, -1.1, 0.2);
        magazine.material = matMag;
        magazine.parent = root;

        // 6. 伸縮槍托 (Folding Stock)
        const stock1 = MeshBuilder.CreateBox("Stock1", {
            width: 0.15,
            height: 0.15,
            depth: 1.8
        }, this.scene);
        stock1.position = new Vector3(0, 0.2, -2.4);
        stock1.material = matReceiver;
        stock1.parent = root;

        const stock2 = MeshBuilder.CreateBox("Stock2", {
            width: 0.45,
            height: 0.6,
            depth: 0.3
        }, this.scene);
        stock2.position = new Vector3(0, 0.1, -3.45);
        stock2.material = matReceiver;
        stock2.parent = root;

        // 7. 握把 (Pistol Grip)
        const grip = MeshBuilder.CreateBox("Grip", {
            width: 0.35,
            height: 1.1,
            depth: 0.6
        }, this.scene);
        grip.position = new Vector3(0, -0.9, -0.6);
        grip.rotation.x = 0.15;
        grip.material = matReceiver;
        grip.parent = root;

        // 8. 扳機 (Trigger)
        const trigger = MeshBuilder.CreateBox("Trigger", {
            width: 0.1,
            height: 0.28,
            depth: 0.12
        }, this.scene);
        trigger.position = new Vector3(0, -0.25, -0.15);
        trigger.material = matSilencer;
        trigger.parent = root;

        // 9. 護弓 (Trigger Guard)
        const guard = MeshBuilder.CreateBox("TriggerGuard", {
            width: 0.4,
            height: 0.08,
            depth: 0.6
        }, this.scene);
        guard.position = new Vector3(0, -0.4, -0.1);
        guard.material = matReceiver;
        guard.parent = root;

        return root;
    }
}
