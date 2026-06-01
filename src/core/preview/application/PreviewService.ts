import { EventBus } from "../../common/ports";
import { PreviewSceneCommand } from "./commands";

export class PreviewService {
    public constructor(
        private readonly eventBus: EventBus
    ) { }

    public onPreviewStart(sceneId: string): void {
        this.eventBus.publish('PreviewViewReady', {
            sceneId
        });
    }

    private onPreviewSceneCommand = (command: PreviewSceneCommand) => {
        console.log('Received scene data for preview:', command.sceneData);
    }
}