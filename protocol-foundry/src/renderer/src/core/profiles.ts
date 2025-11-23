import { Vector3 } from "@babylonjs/core";

export const Profiles = {
    // Basic Rectangle
    Rectangle: (width: number, height: number) => [
        new Vector3(-width / 2, -height / 2, 0),
        new Vector3(width / 2, -height / 2, 0),
        new Vector3(width / 2, height / 2, 0),
        new Vector3(-width / 2, height / 2, 0)
    ],

    // Trapezoid (for Vandal Receiver)
    // topWidth: width of the top edge
    // bottomWidth: width of the bottom edge
    // height: total height
    Trapezoid: (topWidth: number, bottomWidth: number, height: number) => [
        new Vector3(-bottomWidth / 2, -height / 2, 0),
        new Vector3(bottomWidth / 2, -height / 2, 0),
        new Vector3(topWidth / 2, height / 2, 0),
        new Vector3(-topWidth / 2, height / 2, 0)
    ],

    // Chamfered Rectangle (for Classic Slide)
    // chamferSize: size of the cut at the top corners
    ChamferedRectangle: (width: number, height: number, chamferSize: number) => [
        new Vector3(-width / 2, -height / 2, 0),
        new Vector3(width / 2, -height / 2, 0),
        new Vector3(width / 2, height / 2 - chamferSize, 0),
        new Vector3(width / 2 - chamferSize, height / 2, 0),
        new Vector3(-width / 2 + chamferSize, height / 2, 0),
        new Vector3(-width / 2, height / 2 - chamferSize, 0)
    ],

    // Classic Grip Profile (Side view)
    // Simplified ergonomic curve
    ClassicGrip: () => [
        new Vector3(0, 0, 0),           // Top front
        new Vector3(0.5, -0.2, 0),      // Trigger guard start
        new Vector3(1.2, -0.2, 0),      // Trigger guard bottom front
        new Vector3(1.2, -0.8, 0),      // Trigger guard bottom rear
        new Vector3(0.5, -0.8, 0),      // Trigger guard end / Grip front top
        new Vector3(0.4, -2.0, 0),      // Grip front bottom
        new Vector3(-0.8, -2.0, 0),     // Grip rear bottom
        new Vector3(-0.6, -0.5, 0),     // Grip rear hump (palm swell)
        new Vector3(-0.8, 0, 0)         // Top rear (Beavertail)
    ],

    // Rail Profile (Cross-section of a Picatinny rail)
    // Simplified T-shape
    Rail: (width: number, height: number) => [
        new Vector3(-width / 2, -height / 2, 0), // Bottom left
        new Vector3(width / 2, -height / 2, 0),  // Bottom right
        new Vector3(width / 2, 0, 0),            // Middle right
        new Vector3(width / 1.5, 0, 0),          // Top overhang right
        new Vector3(width / 1.5, height / 2, 0), // Top right
        new Vector3(-width / 1.5, height / 2, 0),// Top left
        new Vector3(-width / 1.5, 0, 0),         // Top overhang left
        new Vector3(-width / 2, 0, 0)            // Middle left
    ],

    // Skeleton Stock Triangle (for Vandal)
    SkeletonTriangle: (width: number, height: number, thickness: number) => [
        new Vector3(0, 0, 0),
        new Vector3(width, height / 2, 0),
        new Vector3(width, -height / 2, 0)
    ]
};
