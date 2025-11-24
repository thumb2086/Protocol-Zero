import { Mesh, Scene, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import { ComponentFactory } from "./ComponentFactory";
import { ProfileLib } from "./ProfileLib";

export class VandalFactory {

    static create(scene: Scene): Mesh {
        const factory = new ComponentFactory(scene);
        const root = new Mesh("Vandal_Root", scene);

        // Materials
        const matReceiver = new StandardMaterial("mat_receiver", scene);
        matReceiver.diffuseColor = new Color3(0.15, 0.15, 0.18);

        const matBarrel = new StandardMaterial("mat_barrel", scene);
        matBarrel.diffuseColor = new Color3(0.1, 0.1, 0.1);
        matBarrel.specularColor = new Color3(0.3, 0.3, 0.3);

        const matStock = new StandardMaterial("mat_stock", scene);
        matStock.diffuseColor = new Color3(0.18, 0.16, 0.14);

        const matMag = new StandardMaterial("mat_mag", scene);
        matMag.diffuseColor = new Color3(0.2, 0.2, 0.2);

        const matGrip = new StandardMaterial("mat_grip", scene);
        matGrip.diffuseColor = new Color3(0.1, 0.1, 0.1);

        // 1. Receiver: Main body
        const receiverProfile = ProfileLib.getRectangleProfile(4, 6, 0.3);
        const receiver = factory.extrudePart("Receiver", receiverProfile, 30, matReceiver);
        receiver.parent = root;

        // 2. Barrel: Cylindrical
        const barrelProfile = ProfileLib.getBarrelProfile();
        const barrel = factory.lathePart("Barrel", barrelProfile, 32, matBarrel);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = 30;
        barrel.position.y = 2;
        barrel.parent = root;

        // 3. Stock: Simple rectangular stock
        const stockProfile = ProfileLib.getRectangleProfile(3, 5, 0);
        const stock = factory.extrudePart("Stock", stockProfile, 15, matStock);
        stock.position.z = -15;
        stock.position.y = 0;
        stock.parent = root;

        // 4. Magazine: Curved banana mag
        const magShape = ProfileLib.getRectangleProfile(2, 4, 0.2);
        const magPath = ProfileLib.getCurvedMagPath(12, Math.PI / 5, 8);
        const magazine = factory.extrudePath("Magazine", magShape, magPath, matMag);
        magazine.rotation.x = Math.PI;
        magazine.position.z = 10;
        magazine.position.y = -3;
        magazine.parent = root;

        // 5. Grip: AK-style grip
        const gripProfile = ProfileLib.getAKGripProfile();
        const grip = factory.extrudePart("Grip", gripProfile, 2.5, matGrip);
        grip.rotation.y = Math.PI / 2;
        grip.position.z = 0;
        grip.position.y = -3;
        grip.parent = root;

        // Scale to appropriate size
        root.scaling = new Vector3(0.02, 0.02, 0.02);

        return root;
    }
}
