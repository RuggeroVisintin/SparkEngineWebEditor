import { Scene } from "@sparkengine";
import { RefConfigParams } from "../../../core/common";
import { SceneRepository } from "../../../core/scene";

export class SceneRepositoryTestDouble implements SceneRepository {
    private state: Record<string, Scene> = {}

    read(refConfig?: RefConfigParams): Promise<Scene> {
        const scene = this.state[refConfig?.path ?? ""];

        if (!scene) {
            throw new Error(`Scene not found at path: ${refConfig?.path}`);
        }

        return Promise.resolve(scene);
    }
    save(sceneJson: Scene, refConfig?: RefConfigParams): Promise<void> {
        this.state[refConfig?.path ?? ""] = sceneJson;
        return Promise.resolve();
    }

}