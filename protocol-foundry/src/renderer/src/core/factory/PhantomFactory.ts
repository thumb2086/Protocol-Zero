import { Mesh, Scene, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import { ComponentFactory } from "./ComponentFactory";
import { ProfileLib } from "./ProfileLib";

export class PhantomFactory {

    static create(scene: Scene): Mesh {
        const factory = new ComponentFactory(scene);
        const root = new Mesh("Phantom_Root", scene);

        // Materials
        const matReceiver = new StandardMaterial("mat_receiver", scene);
        matReceiver.diffuseColor = new Color3(0.12, 0.12, 0.14);

        const matSilencer = new StandardMaterial("mat_silencer", scene);
        matSilencer.diffuseColor = new Color3(0.08, 0.08, 0.08);
        matSilencer.specularColor = new Color3(0.4, 0.4, 0.4);

        const matHandguard = new StandardMaterial("mat_handguard", scene);
        matHandguard.diffuseColor = new Color3(0.15, 0.15, 0.16);

        const matMag = new StandardMaterial("mat_mag", scene);
        matMag.diffuseColor = new Color3(0.18, 0.18, 0.18);

        const matStock = new StandardMaterial("mat_stock", scene);
        matStock.diffuseColor = new Color3(0.1, 0.1, 0.1);

        // 1. Receiver - Main body
        const receiverProfile = ProfileLib.getRectangleProfile(4.5, 5, 0.4);
        const receiver = factory.extrudePart("Receiver", receiverProfile, 25, matReceiver);
        receiver.parent = root;

        // 2. Silencer - Front attachment
        const silencerProfile = ProfileLib.getBarrelProfile();
        const silencer = factory.lathePart("Silencer", silencerProfile, 32, matSilencer);
        silencer.rotation.x = Math.PI / 2;
        silencer.scaling = new Vector3(0.6, 0.6, 1.2);
        silencer.position.z = 25;
        silencer.position.y = 2;
        silencer.parent = root;

        // 3. Handguard - Rail system under barrel
        const handguardProfile = ProfileLib.getRailProfile();
        const handguard = factory.extrudePart("Handguard", handguardProfile, 18, matHandguard);
        handguard.position.z = 5;
        handguard.position.y = -1;
        handguard.parent = root;

        // 4. Magazine - Straight mag
        const magProfile = ProfileLib.getRectangleProfile(2.5, 6, 0.3);
        const magazine = factory.extrudePart("Magazine", magProfile, 12, matMag);
        magazine.position.z = 8;
        magazine.position.y = -5;
        magazine.parent = root;

        // 5. Stock - Fixed skeleton stock
        const stockProfile = ProfileLib.getSkeletonTriangleProfile(4, 10, 3);
        const stock = factory.extrudePart("Stock", stockProfile, 3, matStock);
        stock.rotation.y = Math.PI;
        stock.position.z = -5;
        stock.position.y = 1;
        stock.parent = root;

        // Scale to appropriate size
        root.scaling = new Vector3(0.02, 0.02, 0.02);

        return root;
    }
}
