import { GameEngine } from "sparkengineweb";
import { EventBus } from "../../common/ports";
import { PreviewSceneCommand } from "./commands";
import { PreviewViewReadyEvent } from "../domain/events";

export class PreviewService {
    public constructor(
        private readonly eventBus: EventBus
    ) {
        eventBus.subscribe<PreviewSceneCommand>('PreviewScene', this.onPreviewSceneCommand);
    }

    public onPreviewStart(sceneId: string, context: CanvasRenderingContext2D, resolution: { width: number, height: number }): void {
        new GameEngine({
            framerate: 60,
            context: context,
            resolution: {
                width: resolution.width,
                height: resolution.height
            }
        });

        this.eventBus.publish<PreviewViewReadyEvent>('PreviewViewReady', {
            sceneId
        });
    }

    private onPreviewSceneCommand = (command: PreviewSceneCommand) => {
        console.log('Received scene data for preview:', command.scene, command.assets);
    }
}