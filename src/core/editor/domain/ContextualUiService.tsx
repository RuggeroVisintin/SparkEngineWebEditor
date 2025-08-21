import { CameraComponent, GameEngine, IEntity, isCollision, Rgb, Scene, toTopLeftAABB, TransformComponent, Vec2 } from "sparkengineweb";
import { EntityOutline } from "./entities";
import Pivot from "./entities/Pivot";
import { EditorCamera } from "./entities/EditrorCamera";

export class ContextualUiService {
    private _spawnPivot = new Pivot({ diffuseColor: new Rgb(255, 125, 0) });
    private _currentEntityOriginPivot = new Pivot({ size: { width: 0, height: 0 }, diffuseColor: new Rgb(255, 255, 0) });
    private _currentEntityOutline = new EntityOutline();
    private _editorCamera = new EditorCamera();

    public get spawnPivot(): Pivot {
        return this._spawnPivot;
    }

    public get currentEntityOriginPivot(): Pivot {
        return this._currentEntityOriginPivot;
    }

    public get currentEntityOutline(): EntityOutline {
        return this._currentEntityOutline;
    }

    public get editorCamera(): EditorCamera {
        return this._editorCamera;
    }

    public start(contextualUiScene: Scene): void {
        contextualUiScene.registerEntity(this._currentEntityOutline);
        contextualUiScene.registerEntity(this._spawnPivot);
        contextualUiScene.registerEntity(this._currentEntityOriginPivot);
        contextualUiScene.registerEntity(this._editorCamera);
    }

    public moveSpawnOrigin(position: Vec2): void {
        this._spawnPivot.position = position;
    }

    public focusOnEntity(entity: IEntity): void {
        this._currentEntityOriginPivot.match(entity);
        this._currentEntityOutline.match(entity);

        this._currentEntityOriginPivot.transform.size = { width: 10, height: 10 };

        const entityTransform = entity.getComponent<TransformComponent>("TransformComponent");
        const cameraTransform = this._editorCamera.getComponent<CameraComponent>("CameraComponent")?.transform;

        if (entityTransform && cameraTransform && !isCollision(toTopLeftAABB([
            entityTransform.position.x,
            entityTransform.position.y,
            entityTransform.size.width,
            entityTransform.size.height
        ]), toTopLeftAABB([
            cameraTransform.position.x,
            cameraTransform.position.y,
            cameraTransform.size.width,
            cameraTransform.size.height
        ]))) {
            cameraTransform.position = Vec2.from(entityTransform.position);
        }
    }

    public zoomBy(factor: number): void {
        const previousScale = this._editorCamera.camera.transform.scale;

        this._editorCamera.camera.transform.scale += factor;

        if (this._editorCamera.camera.transform.scale < 0.1) {
            this._editorCamera.camera.transform.scale = 0.1; // Prevent zooming out
        }
    }

    public loseFocus(): void {
        this.currentEntityOriginPivot.transform.size = { width: 0, height: 0 };
        this.currentEntityOutline.transform.size = { width: 0, height: 0 };
    }
}