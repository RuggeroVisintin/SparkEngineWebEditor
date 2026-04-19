import { EventBus } from "../../common/ports";
import { PreviewSceneCommand } from "../../editor";

export class PreviewService {

    public constructor(
        private readonly eventBus: EventBus
    ) { }

    public onPreviewStart(): void { }

    private onPreviewSceneCommand = (command: PreviewSceneCommand) => {
        console.log('Received scene data for preview:', command.sceneData);
    }
}