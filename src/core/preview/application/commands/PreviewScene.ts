import { SerializedSceneWithAssets } from "../../../scene/infrastructure/SceneSerializerWithAssets";

export interface PreviewSceneCommand {
    sceneData: string;
    serializedScene?: SerializedSceneWithAssets;
}