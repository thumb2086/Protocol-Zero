/**
 * ModelExporter - Export Babylon.js meshes to GLB format
 * Uses @babylonjs/serializers to convert scene meshes to GLB binary
 */

import { Scene, Mesh, TransformNode } from '@babylonjs/core'
import { GLTF2Export } from '@babylonjs/serializers'

export class ModelExporter {
    /**
     * Export a mesh (and its children) to GLB format
     * @param mesh The root mesh to export
     * @param filename The desired filename (without extension)
     * @returns Promise<Blob> containing GLB binary data
     */
    static async exportToGLB(mesh: Mesh | TransformNode, filename: string): Promise<Blob> {
        console.log('[ModelExporter] Exporting mesh:', mesh.name)

        // Get the scene from the mesh
        const scene = mesh.getScene()

        // Create a temporary scene with only the mesh we want to export
        // This prevents exporting the entire scene (cameras, lights, etc.)
        const exportMeshes = this.collectMeshes(mesh)

        console.log('[ModelExporter] Collected', exportMeshes.length, 'meshes for export')

        // Export using GLTF2Export
        try {
            const glb = await GLTF2Export.GLBAsync(scene, filename, {
                shouldExportNode: (node) => {
                    // Only export nodes that are part of our mesh hierarchy
                    return exportMeshes.some(m => m === node)
                },
                exportWithoutWaitingForScene: true
            })

            console.log('[ModelExporter] Export successful')
            return glb.glTFFiles[`${filename}.glb`] as Blob
        } catch (error) {
            console.error('[ModelExporter] Export failed:', error)
            throw new Error(`Failed to export GLB: ${error}`)
        }
    }

    /**
     * Collect all meshes in a hierarchy
     */
    private static collectMeshes(root: Mesh | TransformNode): Mesh[] {
        const meshes: Mesh[] = []

        const traverse = (node: Mesh | TransformNode) => {
            if (node instanceof Mesh && node.getTotalVertices() > 0) {
                meshes.push(node)
            }

            // Traverse children
            const children = node.getChildren()
            children.forEach(child => {
                if (child instanceof Mesh || child instanceof TransformNode) {
                    traverse(child)
                }
            })
        }

        traverse(root)
        return meshes
    }

    /**
     * Generate a thumbnail PNG from the current scene
     * @param scene The Babylon.js scene
     * @param width Thumbnail width
     * @param height Thumbnail height
     */
    static async generateThumbnail(
        scene: Scene,
        width: number = 512,
        height: number = 512
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            try {
                // Capture screenshot using engine
                const engine = scene.getEngine()

                // Create screenshot
                const canvas = engine.getRenderingCanvas()
                if (!canvas) {
                    reject(new Error('No rendering canvas available'))
                    return
                }

                // Render one frame to ensure scene is up to date
                scene.render()

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob)
                    } else {
                        reject(new Error('Failed to create thumbnail blob'))
                    }
                }, 'image/png')
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Download a blob as a file
     */
    static downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        console.log('[ModelExporter] Download triggered:', filename)
    }
}
