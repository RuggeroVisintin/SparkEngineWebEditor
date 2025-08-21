import { BaseEntity, CameraComponent, GameObject, Type } from "sparkengineweb";

@Type('EditorCamera')
export class EditorCamera extends BaseEntity {
    public readonly camera: CameraComponent;

    constructor() {
        super();

        this.camera = new CameraComponent({
            transform: {
                size: { width: 1920, height: 1080 },
                scale: 1,
            }
        });

        console.log('This CAmera', this.camera);

        this.addComponent(this.camera);
        this.addComponent(this.camera.transform);
    }
}