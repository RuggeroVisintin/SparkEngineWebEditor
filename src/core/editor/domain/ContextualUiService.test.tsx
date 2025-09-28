import { CameraComponent, GameObject, Scene, toRounded, TransformComponent, Vec2 } from "sparkengineweb";
import { ContextualUiService } from "./ContextualUiService";

describe('core/editor/ContextualUiService', () => {
    let service: ContextualUiService;
    let contextualUiScene: Scene;

    beforeEach(() => {
        contextualUiScene = new Scene();
        service = new ContextualUiService();

        service.start(contextualUiScene);
    });

    describe('.start()', () => {
        it('Should initialize the given scene with contextual UI elements', () => {
            expect(contextualUiScene.entities).toEqual(expect.arrayContaining([
                service.currentEntityOriginPivot,
                service.currentEntityOutline,
                service.spawnPivot
            ]));
        });
    });

    describe('.moveSpawnPoint()', () => {
        it('Should move the spawn pivot to the given position', () => {
            const service = new ContextualUiService();
            const position = new Vec2(100, 200);

            service.moveSpawnOrigin(position);

            expect(service.spawnPivot.position).toEqual(position);
        });
    });

    describe('.focusOnEntity()', () => {
        it('Should move the current entity origin pivot to the entity position', () => {
            const entity = new GameObject();

            service.focusOnEntity(entity);

            expect(service.currentEntityOriginPivot.position).toEqual(entity.transform.position);
        });

        it('Should move the entity outline to the entity position shape and size', () => {
            const entity = new GameObject();
            entity.transform.size.height = 50;
            entity.transform.size.width = 100;

            service.focusOnEntity(entity);

            expect(service.currentEntityOutline.transform.position).toEqual(entity.transform.position);
            expect(service.currentEntityOutline.transform.size).toEqual(entity.transform.size);
        });

        it('Should make the current entity origin pivot visible', () => {
            const entity = new GameObject();
            entity.transform.size.height = 50;
            entity.transform.size.width = 100;

            service.focusOnEntity(entity);

            expect(service.currentEntityOriginPivot.transform.size).toEqual({ width: 10, height: 10 });
        });

        it('Should center the camera on the entity if not in viewport', () => {
            const entity = new GameObject();
            entity.transform.position = new Vec2(2000, 2000);

            service.focusOnEntity(entity);

            const cameraPosition = service.editorCamera.getComponent<CameraComponent>('CameraComponent')?.transform.position;
            expect(cameraPosition).toEqual(entity.transform.position);
        });

        it('Should compensate for camera zoom in when focusing on entity', () => {
            // Set up camera zoom
            const cameraComponent = service.editorCamera.getComponent<CameraComponent>('CameraComponent')!;

            cameraComponent.transform.scale = 2;
            cameraComponent.transform.size = { width: 100, height: 100 };
            cameraComponent.transform.position = new Vec2(0, 0);

            const entityOutside = new GameObject();
            entityOutside.transform.position = new Vec2(210, 210);
            entityOutside.transform.size = { width: 10, height: 10 };

            service.focusOnEntity(entityOutside);
            expect(cameraComponent.transform.position).toEqual(entityOutside.transform.position);
        });

        it('Should compensate for camera zoom in when foucing on entity', () => {
            // Set up camera zoom
            const cameraComponent = service.editorCamera.getComponent<CameraComponent>('CameraComponent')!;

            cameraComponent.transform.scale = 0.5;
            cameraComponent.transform.size = { width: 100, height: 100 };
            cameraComponent.transform.position = new Vec2(0, 0);

            const entityOutside = new GameObject();
            entityOutside.transform.position = new Vec2(60, 60);
            entityOutside.transform.size = { width: 10, height: 10 };

            service.focusOnEntity(entityOutside);
            expect(cameraComponent.transform.position).toEqual(entityOutside.transform.position);
        });

        it.each([[
            1,
            new Vec2(-449, -47),
            { width: 30, height: 30 }
        ], [
            1,
            new Vec2(782, 286),
            { width: 30, height: 30 }
        ]])('Should not move the camera if the entity is already in viewport', (cameraScale, entityPosition, entitySize) => {
            const cameraComponent = service.editorCamera.getComponent<CameraComponent>('CameraComponent')!;

            cameraComponent.transform.scale = cameraScale;
            cameraComponent.transform.size = { width: 1920, height: 1080 };
            cameraComponent.transform.position = new Vec2(0, 0);

            const entityInside = new GameObject();
            entityInside.transform.position = entityPosition;
            entityInside.transform.size = entitySize;

            service.focusOnEntity(entityInside);
            expect(cameraComponent.transform.position).toEqual(new Vec2(0, 0));
        });
    });

    describe('.loseFocus()', () => {
        beforeAll(() => {
            const entity = new GameObject();
            entity.transform.size.height = 50;
            entity.transform.size.width = 100;

            service.focusOnEntity(entity);
        })

        it('Should hide the current entity origin pivot', () => {
            service.loseFocus();

            expect(service.currentEntityOriginPivot.transform.size).toEqual({ width: 0, height: 0 });
        });

        it('Should hide the entity outline', () => {
            service.loseFocus();

            expect(service.currentEntityOutline.transform.size).toEqual({ width: 0, height: 0 });
        });
    });

    describe('.zoomBy()', () => {
        it('Should zoom the camera by the given factor', () => {
            const initialZoom = 1;
            const zoomFactor = 2;

            service.zoomBy(zoomFactor);

            const cameraComponent = service.editorCamera.getComponent<CameraComponent>("CameraComponent");
            expect(cameraComponent?.transform.scale).toBe(toRounded(initialZoom / (1 + zoomFactor * 0.01), 6));
        });

        it('Should cap the minimum scale', () => {
            const zoomFactor = 99; // Zoom in

            for (let i = 0; i < 10; i++) {
                service.zoomBy(zoomFactor);
            }

            const cameraComponent = service.editorCamera.getComponent<CameraComponent>("CameraComponent");
            expect(cameraComponent?.transform.scale).toBeGreaterThanOrEqual(0.00001);
        });

        it('Should cap the maximum scale', () => {
            const zoomFactor = -99; // Zoom out

            for (let i = 0; i < 10; i++) {
                service.zoomBy(zoomFactor);
            }

            const cameraComponent = service.editorCamera.getComponent<CameraComponent>("CameraComponent");
            expect(cameraComponent?.transform.scale).toBeLessThanOrEqual(10000);
        })
    });
});