import { GameObject, IEntity, incrementallyUnique, Rgb, TransformComponent, Type, Vec2 } from "@sparkengine";
import IDebuggerEntity from "./IDebuggerEntity";

interface PivotProps {
    size?: { width: number; height: number };
    diffuseColor?: Rgb;
}

@Type('Pivot')
export default class Pivot extends GameObject implements IDebuggerEntity {
    public get position(): Vec2 {
        return this.getComponent<TransformComponent>('TransformComponent')?.position ?? new Vec2(0, 0);
    }

    public set position(value: Vec2) {
        const transform = this.getComponent<TransformComponent>('TransformComponent');

        if (transform) {
            transform.position = value;
        }
    }

    constructor(props?: PivotProps) {
        super({
            name: incrementallyUnique('Pivot'),
            material: {
                diffuseColor: props?.diffuseColor ? props.diffuseColor : new Rgb(255, 255, 0)
            },
            shape: {
                isWireframe: false
            },
            transform: {
                // Depth -1 ensures this is always drawn on top of everything else
                depthIndex: -1,
                size: props?.size ? props.size : { width: 10, height: 10 },
                position: new Vec2(55, 55)
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
    }
}