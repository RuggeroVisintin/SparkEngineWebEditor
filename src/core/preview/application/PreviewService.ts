import { GameEngine, GameEngineOptions } from "sparkengineweb";
import { EventBus } from "../../common/ports";
import { PreviewSceneCommand } from "./commands";
import { SceneSerializerWithAssets, SerializedSceneWithAssets } from "../../scene/infrastructure/SceneSerializerWithAssets";
import { BufferImageRepository } from "../../assets/image/adapters/BufferImageRepository";

export class PreviewService {
    private sceneSerializer = new SceneSerializerWithAssets();
    private bufferImageRepo: BufferImageRepository;
    private gameEngine: GameEngine | null = null;
    private pendingSceneCommand: PreviewSceneCommand | null = null;

    public constructor(
        private readonly eventBus: EventBus
    ) {
        console.log('[POC] PreviewService - Constructor: Creating BufferImageRepository and subscribing to events');
        this.bufferImageRepo = new BufferImageRepository();
        eventBus.subscribe('SendSceneToPreview', this.onPreviewSceneCommand.bind(this));
        console.log('[POC] PreviewService - Event subscription complete');
    }

    public onPreviewStart(sceneId: string, context: CanvasRenderingContext2D, resolution: { width: number, height: number }): void {
        console.log('[POC] PreviewService.onPreviewStart() - Starting preview', { sceneId });
        
        this.gameEngine = new GameEngine({
            framerate: 60,
            context: context,
            resolution: {
                width: resolution.width,
                height: resolution.height
            },
            imageLoader: this.bufferImageRepo
        });
        console.log('[POC] PreviewService.onPreviewStart() - GameEngine created with BufferImageRepository');

        // If a scene command arrived before the engine was ready, render it now
        if (this.pendingSceneCommand) {
            console.log('[POC] PreviewService.onPreviewStart() - Processing pending scene command');
            this.onPreviewSceneCommand(this.pendingSceneCommand);
            this.pendingSceneCommand = null;
        }

        console.log('[POC] PreviewService.onPreviewStart() - Publishing PreviewViewReady event', { sceneId });
        this.eventBus.publish('PreviewViewReady', {
            sceneId
        });
        console.log('[POC] PreviewService.onPreviewStart() - Event published');
    }

    /**
     * Handle incoming scene data with embedded assets
     * This is called when the preview receives a scene to load
     */
    public async onPreviewSceneCommand(command: PreviewSceneCommand): Promise<any> {
        try {
            // If engine not ready, queue the command for later
            if (!this.gameEngine) {
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Engine not initialized, queueing scene');
                this.pendingSceneCommand = command;
                return;
            }

            if (command.serializedScene) {
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Received serialized scene');

                // Register asset buffers in the image repository
                const { assets } = command.serializedScene;
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Registering assets', { assetCount: Object.keys(assets).length, assetKeys: Object.keys(assets) });
                
                for (const [assetPath, assetData] of Object.entries(assets)) {
                    const typedAssetData = assetData as { buffer: Uint8Array; format: string };
                    const mimeType = this.getMimeType(typedAssetData.format);
                    const blob = new Blob([new Uint8Array(typedAssetData.buffer)], { type: mimeType });
                    // Register using the asset path as the key (same as in the JSON)
                    this.bufferImageRepo.registerBuffer(assetPath, blob);
                    console.log('[POC] PreviewService.onPreviewSceneCommand() - Registered asset', { assetPath, sizeKb: (blob.size / 1024).toFixed(2) });
                }

                // Deserialize the scene
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Deserializing scene');
                const scene = await this.sceneSerializer.deserialize(command.serializedScene);
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Scene deserialized', { entityCount: scene.entities.length });

                // Draw the scene to the engine
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Drawing scene to engine');
                scene.draw(this.gameEngine);
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Scene drawn, starting engine');

                // Start the engine rendering loop
                this.gameEngine.run();
                console.log('[POC] PreviewService.onPreviewSceneCommand() - Engine started');

                return scene;
            } else {
                // Fallback to legacy sceneData
                console.log('Received scene data for preview (legacy):', command.sceneData);
            }
        } catch (error) {
            console.error('[POC] PreviewService.onPreviewSceneCommand() - Error:', error);
            throw error;
        }
    }

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

    private getTotalAssetSize(assets: Record<string, any>): number {
        let total = 0;
        for (const asset of Object.values(assets)) {
            if (asset.buffer instanceof Uint8Array) {
                total += asset.buffer.byteLength;
            }
        }
        return Math.round(total / 1024); // Convert to KB
    }
}