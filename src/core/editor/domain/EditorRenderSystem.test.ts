import { CameraComponent } from "@sparkengine";
import { EditorRenderSystem } from "./EditorRenderSystem";
import { EditorCamera } from "./entities/EditrorCamera";

describeClass(EditorRenderSystem, ({ describeMethod }) => {
    describeMethod('registerComponent', () => {
        it('should not register a CameraComponent if it is not an EditorCamera', () => {
            const editorRenderSystem = new EditorRenderSystem({} as any, {} as any);
            const cameraComponent = new CameraComponent();

            editorRenderSystem.registerComponent(cameraComponent);

            expect(editorRenderSystem.components).not.toContain(cameraComponent);
        });

        it('should register a CameraComponent if it is an EditorCamera', () => {
            const editorRenderSystem = new EditorRenderSystem({} as any, {} as any);
            const editorCamera = new EditorCamera();

            editorRenderSystem.registerComponent(editorCamera.camera);

            expect(editorRenderSystem.camera).toEqual(editorCamera.camera);
        });
    });
});