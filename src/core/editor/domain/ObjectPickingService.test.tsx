import { GameObject } from "sparkengineweb";
import { ObjectPickingService } from "./ObjectPickingService";


describeClass(ObjectPickingService, () => {
    const event = { button: 0, targetX: 100, targetY: 200, modifiers: {} };

    describe('.handleMouseClick()', () => {
        it('Should pick the object at the given coordinates on left mouse click', () => {
            const objectPickerMock = {
                pick: jest.fn(() => new GameObject()),
            };
            const service = new ObjectPickingService(objectPickerMock as any);

            service.handleMouseClick(event);

            expect(service.selectedEntity).toBeDefined();
        });

        it('Should not execute when not left mouse click', () => {
            const objectPickerMock = {
                pick: jest.fn(() => new GameObject()),
            };

            const service = new ObjectPickingService(objectPickerMock as any);
            service.handleMouseClick({ ...event, button: 1 });

            expect(service.selectedEntity).toBeUndefined();
        });

        it('Should not pick an object when no object is at the given coordinates', () => {
            const objectPickerMock = {
                pick: jest.fn(() => undefined),
            };
            const service = new ObjectPickingService(objectPickerMock as any);

            service.handleMouseClick(event);

            expect(service.selectedEntity).toBeUndefined();
        });

        it('Should invoke the given callback with the picked entity if any', () => {
            const objectPickerMock = {
                pick: jest.fn(() => new GameObject()),
            };
            const callbackMock = jest.fn();
            const service = new ObjectPickingService(objectPickerMock as any);

            service.handleMouseClick(event, callbackMock);

            expect(callbackMock).toHaveBeenCalledWith(service.selectedEntity);
        });
    });
});