import { RenderSystem, IDrawableComponent, CameraComponent, typeOf } from "@sparkengine";
import { EditorCamera } from "./entities/EditrorCamera";

export class EditorRenderSystem extends RenderSystem {
    registerComponent(component: IDrawableComponent): void {
        const container = component.getContainer();

        if (component instanceof CameraComponent && container && typeOf(container) !== typeOf(EditorCamera)) {
            return;
        }

        super.registerComponent(component);
    }
}