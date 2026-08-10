import { SceneJsonProps } from "sparkengineweb";
import { SerializedImageAssetSnapshot } from "../../../assets";

export interface PreviewSceneCommand {
    scene: SceneJsonProps;
    assets: SerializedImageAssetSnapshot;
}