import { Scene, DynamicTexture, StandardMaterial, PBRMaterial, Texture } from '@babylonjs/core';

export class SkinSystem {
    /**
     * Generate a skin texture based on the type
     */
    static generateSkin(type: string, scene: Scene): DynamicTexture | null {
        if (!type) return null;

        const width = 512;
        const height = 512;
        const texture = new DynamicTexture(`skin_${type}`, { width, height }, scene, false);
        const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;

        // Background
        ctx.fillStyle = '#2A2A2A';
        ctx.fillRect(0, 0, width, height);

        switch (type.toLowerCase()) {
            case 'slash':
                this.drawSlash(ctx, width, height);
                break;
            case 'zebra':
                this.drawZebra(ctx, width, height);
                break;
            default:
                console.warn(`[SkinSystem] Unknown skin type: ${type}`);
                return null;
        }

        texture.update();
        return texture;
    }

    /**
     * Draw Slash pattern (Diagonal lines)
     */
    private static drawSlash(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 10;
        ctx.beginPath();

        const spacing = 40;
        // Draw diagonal lines
        for (let i = -height; i < width; i += spacing) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
        }

        ctx.stroke();
    }

    /**
     * Draw Zebra pattern (Randomized sine waves)
     */
    private static drawZebra(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.fillStyle = '#FFFFFF';

        // Number of stripes
        const stripes = 15;
        const step = width / stripes;

        for (let i = 0; i < stripes; i++) {
            const x = i * step;
            const stripeWidth = step * 0.6;

            ctx.beginPath();
            ctx.moveTo(x, 0);

            // Draw wavy line down
            for (let y = 0; y <= height; y += 20) {
                const noise = Math.sin(y * 0.05 + i) * 20; // Simple sine wave
                const randomVar = (Math.random() - 0.5) * 10; // Little bit of noise
                ctx.lineTo(x + noise + randomVar, y);
            }

            // Draw back up to complete the shape
            for (let y = height; y >= 0; y -= 20) {
                const noise = Math.sin(y * 0.05 + i) * 20;
                const randomVar = (Math.random() - 0.5) * 10;
                ctx.lineTo(x + stripeWidth + noise + randomVar, y);
            }

            ctx.closePath();
            ctx.fill();
        }
    }
}
