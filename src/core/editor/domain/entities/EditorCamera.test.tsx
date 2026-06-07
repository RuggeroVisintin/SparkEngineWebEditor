import { BaseEntity, CameraComponent, typeOf } from 'sparkengineweb';
import { describeClass } from '../../../../test-utils/describeClass';
import { EditorCamera } from './EditrorCamera';

describeClass(EditorCamera, () => {
    it('Should be an instance of BaseEntity', () => {
        const camera = new EditorCamera();
        expect(camera).toBeInstanceOf(BaseEntity);
    });

    it('Should have a camera component registered by default', () => {
        const camera = new EditorCamera();

        const cameraComponent = camera.getComponent<CameraComponent>('CameraComponent');

        expect(cameraComponent).toBeDefined();
        expect(cameraComponent?.transform.size).toEqual({ width: 1920, height: 1080 });
    });

    it('Should have the correct type', () => {
        const camera = new EditorCamera();
        expect(typeOf(camera)).toBe('EditorCamera');
    });
});