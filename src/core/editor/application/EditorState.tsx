import { IEntity, Scene, Vec2 } from "sparkengineweb";

export interface EditorState {
    currentEntity?: IEntity;
    entities?: IEntity[];
    currentScene?: Scene;
    spawnPoint?: Vec2
    isComponentsPanelOpen?: boolean;
}