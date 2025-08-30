import { CameraComponent, GameEngine, IEntity, isCollision, Rgb, Scene, toRounded, toTopLeftAABB, TransformComponent, Vec2 } from "sparkengineweb";
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

        // Compensate for camera zoom (scale)
        if (entityTransform && cameraTransform) {
            const scale = cameraTransform.scale ?? 1;

            const visibleCameraWidth = cameraTransform.size.width / scale;
            const visibleCameraHeight = cameraTransform.size.height / scale;

            const cameraAABB = toTopLeftAABB([
                cameraTransform.position.x,
                cameraTransform.position.y,
                visibleCameraWidth,
                visibleCameraHeight
            ]);
            const entityAABB = toTopLeftAABB([
                entityTransform.position.x,
                entityTransform.position.y,
                entityTransform.size.width,
                entityTransform.size.height
            ]);

            if (!isCollision(entityAABB, cameraAABB)) {
                cameraTransform.position = Vec2.from(entityTransform.position);
            }
        }
    }

    public zoomBy(factor: number): void {
        this._editorCamera.camera.transform.scale /= (1 + factor * 0.01);

        this._editorCamera.camera.transform.scale = toRounded(this._editorCamera.camera.transform.scale, 6);

        if (this._editorCamera.camera.transform.scale < 0.00001) {
            this._editorCamera.camera.transform.scale = 0.00001;
        } else if (this._editorCamera.camera.transform.scale > 10000) {
            this._editorCamera.camera.transform.scale = 10000;
        }
    }

    public loseFocus(): void {
        this.currentEntityOriginPivot.transform.size = { width: 0, height: 0 };
        this.currentEntityOutline.transform.size = { width: 0, height: 0 };
    }
}