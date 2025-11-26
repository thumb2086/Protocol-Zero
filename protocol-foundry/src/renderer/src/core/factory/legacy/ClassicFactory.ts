import { Mesh, Scene, Vector3, StandardMaterial, Color3 } from "@babylonjs/core";
import { ComponentFactory } from "./ComponentFactory";
import { ProfileLib } from "./ProfileLib";

export class ClassicFactory {

    static create(scene: Scene): Mesh {
        const factory = new ComponentFactory(scene);
        const root = new Mesh("Classic_Root", scene);

        // Materials
        const matSlide = new StandardMaterial("mat_slide", scene);
        matSlide.diffuseColor = new Color3(0.15, 0.15, 0.18);
        matSlide.specularColor = new Color3(0.4, 0.4, 0.4);

        const matBarrel = new StandardMaterial("mat_barrel", scene);
        matBarrel.diffuseColor = new Color3(0.05, 0.05, 0.05);
        matBarrel.specularColor = new Color3(0.3, 0.3, 0.3);

        const matFrame = new StandardMaterial("mat_frame", scene);
        matFrame.diffuseColor = new Color3(0.2, 0.2, 0.22);

        const matGrip = new StandardMaterial("mat_grip", scene);
        matGrip.diffuseColor = new Color3(0.1, 0.1, 0.1);

        // 1. Frame (Grip) - Main body
        const frameProfile = ProfileLib.getGripProfile();
        const frame = factory.extrudePart("Frame", frameProfile, 2.5, matFrame);
        frame.rotation.y = Math.PI / 2; // Orient grip properly
        frame.position.x = -1.25; // Center the grip thickness
        frame.parent = root;

        // 2. Slide - Top sliding part
        const slideProfile = ProfileLib.getRectangleProfile(2.5, 1.8, 0.3);
        const slide = factory.extrudePart("Slide", slideProfile, 9, matSlide);
        slide.position.y = 3; // Above grip
        slide.position.z = 0; // Start from grip position
        slide.parent = root;

        // 3. Barrel - Cylindrical barrel
        const barrelProfile = ProfileLib.getBarrelProfile();
        const barrel = factory.lathePart("Barrel", barrelProfile, 24, matBarrel);
        barrel.rotation.x = Math.PI / 2;
        barrel.scaling = new Vector3(0.3, 0.3, 0.5); // Smaller barrel for pistol
        barrel.position.y = 3; // Same height as slide
        barrel.position.z = 9; // Protruding from slide
        barrel.parent = root;

        // 4. Trigger Guard
        const guardProfile = ProfileLib.getRectangleProfile(0.3, 1, 0);
        const path = [
            new Vector3(0, 0.5, 1),
            new Vector3(0, -0.2, 1),
            new Vector3(0, -0.5, 1),
            new Vector3(0, -0.5, 3),
            new Vector3(0, 0, 3),
            new Vector3(0, 0.5, 3)
        ];
        const guard = factory.extrudePath("TriggerGuard", guardProfile, path, matFrame);
        guard.position.y = 0.5;
        guard.position.z = 1;
        guard.parent = root;

        // Scale to appropriate size
        root.scaling = new Vector3(0.05, 0.05, 0.05);

        return root;
    }
}
