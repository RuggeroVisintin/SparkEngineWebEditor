import { SceneJsonProps } from "@sparkengine";
import { SerializedImageAssetSnapshot } from "../../../assets";

export interface PreviewSceneCommand {
    scene: string;
    assets: SerializedImageAssetSnapshot;
}