import { Vector3 } from "@babylonjs/core";

export class ProfileLib {
    /**
     * Returns a rectangle profile on the X-Y plane with optional chamfered corners.
     * @param w Width (X axis)
     * @param h Height (Y axis)
     * @param chamfer Chamfer radius
     */
    static getRectangleProfile(w: number, h: number, chamfer: number = 0): Vector3[] {
        const halfW = w / 2;
        const halfH = h / 2;

        if (chamfer <= 0) {
            return [
                new Vector3(-halfW, -halfH, 0),
                new Vector3(halfW, -halfH, 0),
                new Vector3(halfW, halfH, 0),
                new Vector3(-halfW, halfH, 0)
            ];
        }

        // Simple chamfer implementation
        const c = Math.min(chamfer, Math.min(w, h) / 2);
        return [
            new Vector3(-halfW + c, -halfH, 0),
            new Vector3(halfW - c, -halfH, 0),
            new Vector3(halfW, -halfH + c, 0),
            new Vector3(halfW, halfH - c, 0),
            new Vector3(halfW - c, halfH, 0),
            new Vector3(-halfW + c, halfH, 0),
            new Vector3(-halfW, halfH - c, 0),
            new Vector3(-halfW, -halfH + c, 0)
        ];
    }

    /**
     * Returns the specific "T" shape of a Picatinny rail.
     * Simplified profile for demonstration.
     */
    static getRailProfile(): Vector3[] {
        // Picatinny rail dimensions are roughly 21.2mm wide.
        // Scale: 1 unit = 1 cm? Let's assume 1 unit = 1 cm for now based on user prompts.
        // 21.2mm = 2.12cm.
        const w = 2.12;
        const halfW = w / 2;
        const h = 1.0; // Arbitrary height

        return [
            new Vector3(-halfW, 0, 0),
            new Vector3(halfW, 0, 0),
            new Vector3(halfW, h * 0.3, 0), // Base
            new Vector3(halfW * 0.8, h * 0.4, 0), // Indent
            new Vector3(halfW, h * 0.6, 0), // Top flare
            new Vector3(halfW, h, 0),
            new Vector3(-halfW, h, 0),
            new Vector3(-halfW, h * 0.6, 0),
            new Vector3(-halfW * 0.8, h * 0.4, 0),
            new Vector3(-halfW, h * 0.3, 0)
        ];
    }

    /**
     * Returns an ergonomic curve for a pistol grip.
     */
    static getGripProfile(): Vector3[] {
        // A simple ergonomic shape
        return [
            new Vector3(0, 0, 0),
            new Vector3(3, 0, 0),
            new Vector3(3.5, 2, 0),
            new Vector3(3.2, 5, 0),
            new Vector3(4, 8, 0), // Top back
            new Vector3(0, 8, 0)  // Top front
        ];
    }

    /**
     * Returns a trapezoid profile.
     * @param w Bottom width
     * @param topW Top width
     * @param h Height
     */
    static getTrapezoidProfile(w: number, topW: number, h: number): Vector3[] {
        const halfW = w / 2;
        const halfTopW = topW / 2;
        return [
            new Vector3(-halfW, 0, 0),
            new Vector3(halfW, 0, 0),
            new Vector3(halfTopW, h, 0),
            new Vector3(-halfTopW, h, 0)
        ];
    }

    /**
     * Returns a skeletonized triangle profile for a stock.
     */
    static getSkeletonTriangleProfile(width: number, height: number, thickness: number): Vector3[] {
        return [
            new Vector3(0, 0, 0),
            new Vector3(width, height / 2, 0),
            new Vector3(width, -height / 2, 0)
        ];
    }

    /**
     * Returns a profile for the barrel lathe operation.
     */
    static getBarrelProfile(): Vector3[] {
        return [
            new Vector3(0, 0, 0),    // Center
            new Vector3(1.2, 0, 0),  // Root radius
            new Vector3(1.0, 25, 0), // Taper slightly
            new Vector3(0.8, 35, 0), // Muzzle start
            new Vector3(1.5, 35, 0), // Brake flare
            new Vector3(1.5, 40, 0), // Brake end
            new Vector3(0.8, 40, 0), // Inner bore
            new Vector3(0, 40, 0)    // Close
        ];
    }

    /**
     * Returns a path for a curved "Banana" magazine.
     */
    static getCurvedMagPath(radius: number, angle: number, segments: number): Vector3[] {
        const path: Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * angle;
            // Curve downwards and forwards
            const y = -Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            path.push(new Vector3(0, y + radius, z)); // Offset to start at 0,0,0
        }
        return path;
    }

    /**
     * Returns an AK-style pistol grip profile.
     */
    static getAKGripProfile(): Vector3[] {
        return [
            new Vector3(0, 0, 0),
            new Vector3(3, 0, 0),     // Top width
            new Vector3(3.5, -2, 0),  // Back hump
            new Vector3(3.0, -8, 0),  // Bottom back
            new Vector3(0.5, -8, 0),  // Bottom front
            new Vector3(0.8, -2, 0),  // Front finger groove area
            new Vector3(0, 0, 0)      // Close
        ];
    }

    /**
     * Returns a pistol grip profile (compact).
     */
    static getPistolGripProfile(): Vector3[] {
        return [
            new Vector3(0, 0, 0),
            new Vector3(2.5, 0, 0),   // Top width
            new Vector3(2.8, -1.5, 0), // Back curve
            new Vector3(2.5, -6, 0),  // Bottom back
            new Vector3(0.5, -6, 0),  // Bottom front
            new Vector3(0.5, -1, 0),  // Front
            new Vector3(0, 0, 0)      // Close
        ];
    }

    /**
     * Returns a tactical grip profile (modern, vertical).
     */
    static getTacticalGripProfile(): Vector3[] {
        return [
            new Vector3(0, 0, 0),
            new Vector3(2.2, 0, 0),   // Top width
            new Vector3(2.2, -1, 0),  // Straight sides
            new Vector3(2.5, -2, 0),  // Palm swell
            new Vector3(2.2, -5, 0),  // Bottom swell
            new Vector3(1.5, -6.5, 0), // Bottom taper
            new Vector3(0.8, -6.5, 0), // Bottom front
            new Vector3(0.5, -5, 0),  // Front taper
            new Vector3(0.5, -1, 0),  // Front straight
            new Vector3(0, 0, 0)      // Close
        ];
    }
}

