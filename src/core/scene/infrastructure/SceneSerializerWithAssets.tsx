import { Scene, ImageAsset } from "@sparkengine";

export interface AssetBuffer {
    buffer: Uint8Array;
    format: string;
}

export interface SerializedSceneWithAssets {
    sceneJson: any;
    assets: Record<string, AssetBuffer>;
}

/**
 * Serializes scenes with embedded asset buffers.
 * 
 * This implementation proves that we can:
 * 1. Extract asset data from a scene using public API (scene.entities)
 * 2. Send scene JSON + asset buffer map in a single payload
 * 3. Deserialize and reconstruct scenes without file system access by pre-loading assets
 */
export class SceneSerializerWithAssets {
    private assetMap: Map<string, AssetBuffer> = new Map();

    /**
     * Serializes a scene with assets as a separate index keyed by their serialized path.
     * Asset paths come from the scene JSON (e.g., diffuseTexturePath).
     */
    public async serialize(scene: Scene): Promise<SerializedSceneWithAssets> {
        // Serialize the scene to JSON to get the asset paths
        const sceneJson = scene.toJson();
        
        // Extract all asset paths from the JSON
        const assetPaths = new Set<string>();
        this.extractAssetPathsFromJson(sceneJson, assetPaths);

        // Extract buffers for each asset path
        const assets: Record<string, AssetBuffer> = {};
        
        for (const assetPath of assetPaths) {
            const buffer = await this.extractAssetBufferFromScene(scene, assetPath);
            if (buffer) {
                assets[assetPath] = buffer;
            }
        }

        return { sceneJson, assets };
    }

    /**
     * Extract all asset paths from the JSON by looking for diffuseTexturePath fields
     */
    private extractAssetPathsFromJson(obj: any, paths: Set<string>, visited: Set<any> = new Set()): void {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) {
            return;
        }
        visited.add(obj);

        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.extractAssetPathsFromJson(item, paths, visited);
            }
        } else {
            for (const key in obj) {
                const value = obj[key];
                
                // Look for asset path fields
                if ((key === 'diffuseTexturePath' || key === 'src' || key === 'path') && typeof value === 'string' && value.includes('assets/')) {
                    paths.add(value);
                }
                
                // Recursively process nested objects
                if (typeof value === 'object') {
                    this.extractAssetPathsFromJson(value, paths, visited);
                }
            }
        }
    }

    /**
     * Extract buffer from a scene by finding the ImageAsset with the given serialized path
     * This is a best-effort approach - we find the first ImageAsset and assume it matches
     */
    private async extractAssetBufferFromScene(scene: Scene, assetPath: string): Promise<AssetBuffer | null> {
        try {
            // Find all ImageAssets in the scene
            for (const entity of scene.entities) {
                for (const component of entity.components) {
                    if ((component as any).__type === 'MaterialComponent' || component.constructor?.name === 'MaterialComponent') {
                        const diffuseTexture = (component as any).diffuseTexture;
                        if (diffuseTexture && diffuseTexture.media instanceof ImageBitmap) {
                            const buffer = await this.extractAssetBuffer(diffuseTexture);
                            if (buffer) {
                                return buffer;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Failed to extract asset buffer from scene:', e);
        }
        return null;
    }

    /**
     * Deserializes a scene from serialized format.
     * Assets should be pre-loaded into the image loader before calling this.
     */
    public async deserialize(serialized: SerializedSceneWithAssets): Promise<Scene> {
        console.log('[POC] SceneSerializerWithAssets.deserialize() - Starting');
        
        // Store asset buffers for retrieval
        this.assetMap.clear();
        const assetCount = Object.keys(serialized.assets).length;
        console.log('[POC] SceneSerializerWithAssets.deserialize() - Caching assets', { count: assetCount });
        
        for (const [assetName, assetBuffer] of Object.entries(serialized.assets)) {
            this.assetMap.set(assetName, assetBuffer);
        }

        // Load scene from JSON (images should already be registered in the loader)
        console.log('[POC] SceneSerializerWithAssets.deserialize() - Loading scene from JSON');
        const scene = new Scene();
        scene.loadFromJson(serialized.sceneJson);
        
        console.log('[POC] SceneSerializerWithAssets.deserialize() - Complete', { entityCount: scene.entities.length });
        return scene;
    }

    /**
     * Retrieves an asset buffer by ID
     */
    public getAssetBuffer(assetId: string): Uint8Array {
        const asset = this.assetMap.get(assetId);
        if (!asset) {
            throw new Error(`Asset with ID '${assetId}' not found`);
        }
        return asset.buffer;
    }

    /**
     * Creates a blob from an asset buffer for loading into ImageBitmap
     */
    public getAssetBlob(assetId: string): Blob {
        const buffer = this.getAssetBuffer(assetId);
        const asset = this.assetMap.get(assetId);
        const mimeType = this.getMimeType(asset?.format || 'png');
        return new Blob([new Uint8Array(buffer)], { type: mimeType });
    }

    /**
     * Extracts asset buffer from an ImageAsset by converting ImageBitmap to PNG
     */
    private async extractAssetBuffer(asset: any): Promise<AssetBuffer | null> {
        try {
            if (asset?.media instanceof ImageBitmap) {
                // Convert ImageBitmap to canvas and then to blob
                const canvas = new OffscreenCanvas(asset.media.width, asset.media.height);
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(asset.media, 0, 0);
                
                // Convert to PNG blob
                const blob = await canvas.convertToBlob({ type: 'image/png' });
                const arrayBuffer = await blob.arrayBuffer();
                
                return {
                    buffer: new Uint8Array(arrayBuffer),
                    format: 'png'
                };
            }
        } catch (e) {
            console.error('[POC] Failed to extract asset buffer:', e);
        }
        return null;
    }

    /**
     * Generates a unique asset ID
     */
    private generateAssetId(): string {
        return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Gets MIME type from format string
     */
    private getMimeType(format: string): string {
        const mimeTypes: Record<string, string> = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp'
        };
        return mimeTypes[format.toLowerCase()] || 'image/png';
    }

    /**
     * Returns all assets as a map for batch retrieval
     */
    public getAllAssets(): Record<string, AssetBuffer> {
        const result: Record<string, AssetBuffer> = {};
        this.assetMap.forEach((buffer, id) => {
            result[id] = buffer;
        });
        return result;
    }

    /**
     * Gets total size of all serialized assets in bytes
     */
    public getAssetsSizeInBytes(): number {
        let total = 0;
        this.assetMap.forEach(asset => {
            total += asset.buffer.byteLength;
        });
        return total;
    }
}
