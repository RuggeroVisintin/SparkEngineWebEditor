import { GameObject, IEntity, incrementallyUnique, Rgb, TransformComponent, Type, Vec2 } from "@sparkengine";
import IDebuggerEntity from "./IDebuggerEntity";

@Type('EntityOutline')
export class EntityOutline extends GameObject implements IDebuggerEntity {
    constructor() {

        super({
            name: incrementallyUnique('EntityOutline'),
            material: {
                diffuseColor: new Rgb(255, 255, 0)
            },
            shape: {
                isWireframe: true
            },
            transform: {
                // Depth -1 ensures this is always drawn on top of everything else
                depthIndex: -1
            }
        });
    }

    match(target: IEntity): void {
        const debuggerTransform = this.getComponent<TransformComponent>('TransformComponent');
        const targetTransform = target.getComponent<TransformComponent>('TransformComponent');

        if (!targetTransform || !debuggerTransform) {
            return;
        }

        debuggerTransform.position = Vec2.from(targetTransform.position);
        debuggerTransform.size.height = targetTransform.size.height;
        debuggerTransform.size.width = targetTransform.size.width;
    }
}