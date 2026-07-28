import { SceneJsonProps } from "sparkengineweb";

export interface PreviewSceneCommand {
    scene: SceneJsonProps;
    assets: Record<string, {
        buffer: Uint8Array;
        format: string
    }>
}