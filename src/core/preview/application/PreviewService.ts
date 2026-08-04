import { GameEngine, ImageLoader, Scene } from "sparkengineweb";
import { EventBus } from "../../common/ports";
import { PreviewSceneCommand } from "./commands";
import { PreviewViewReadyEvent } from "../domain/events";
import { ImageSerializer } from "../../assets";

export class PreviewService {
    private _currentScene?: Scene;
    private _engine?: GameEngine;
    private readonly unsubscribeFromPreviewScene: () => void;

    public get currentScene(): Scene {
        if (!this._currentScene) {
            throw new Error('No scene is currently loaded in the preview service');
        }

        return this._currentScene;
    }

    public get engine(): GameEngine {
        if (!this._engine) {
            throw new Error('The game engine has not been initialized yet');
        }

        return this._engine;
    }

    public constructor(
        private readonly eventBus: EventBus,
        private readonly imageLoader: ImageLoader,
        private readonly imageSerializer: ImageSerializer
    ) {
        console.log('New PreviewService instance created');

        this.unsubscribeFromPreviewScene = eventBus.subscribe<PreviewSceneCommand>('PreviewScene', this.onPreviewSceneCommand);
    }

    public dispose(): void {
        this.unsubscribeFromPreviewScene();
        this._currentScene?.dispose();
        this._currentScene = undefined;
        this._engine = undefined;
        this.eventBus.dispose?.();
    }

    public start(sceneId: string, context: CanvasRenderingContext2D, resolution: { width: number, height: number }): void {
        this._engine = new GameEngine({
            framerate: 60,
            context: context,
            resolution: {
                width: resolution.width,
                height: resolution.height
            },
            imageLoader: this.imageLoader
        });

        this._currentScene = new Scene();
        this._currentScene.draw(this._engine);

        console.log('PreviewService: Starting preview for scene', sceneId);

        this.eventBus.publish<PreviewViewReadyEvent>('PreviewViewReady', {
            sceneId
        });
    }

    private onPreviewSceneCommand = (command: PreviewSceneCommand) => {
        console.log('PreviewService: Received PreviewSceneCommand', command);

        console.log('Current scene before loading new scene:', this._currentScene);
        this._currentScene?.loadFromJson(command.scene);
    }
}