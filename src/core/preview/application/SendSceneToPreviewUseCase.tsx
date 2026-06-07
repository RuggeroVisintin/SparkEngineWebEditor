import { Scene } from "@sparkengine";
import { EventBus } from "../../common/ports";
import { SceneSerializerWithAssets } from "../../scene/infrastructure/SceneSerializerWithAssets";
import { PreviewSceneCommand } from "./commands/PreviewScene";

/**
 * Handles sending a scene to the preview tab with embedded assets.
 * 
 * This use case demonstrates the POC flow:
 * 1. Load or create a scene in the editor
 * 2. Serialize the scene with all its assets
 * 3. Send the serialized scene + assets to preview via event bus
 * 4. Preview deserializes and loads without file system access
 */
export class SendSceneToPreviewUseCase {
    constructor(
        private readonly eventBus: EventBus
    ) { }

    public async execute(scene: Scene, sceneId: string): Promise<void> {
        try {
            // Serialize scene with embedded assets
            const serializer = new SceneSerializerWithAssets();
            const serializedScene = await serializer.serialize(scene);

            // Create command to send to preview
            const command: PreviewSceneCommand = {
                sceneData: JSON.stringify(serializedScene.sceneJson),
                serializedScene
            };

            // Send to preview via event bus
            this.eventBus.publish('SendSceneToPreview', command);
        } catch (error) {
            console.error('Failed to send scene to preview:', error);
            throw error;
        }
    }

    private calculatePayloadSize(command: PreviewSceneCommand): string {
        const json = JSON.stringify(command);
        const sizeBytes = new TextEncoder().encode(json).length;
        const sizeMb = (sizeBytes / 1024 / 1024).toFixed(2);
        return `${sizeMb} MB`;
    }
}
