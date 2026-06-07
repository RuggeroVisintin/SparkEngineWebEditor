import { InMemoryEventBusDouble } from "../../../__mocks__/core/InMemoryEventBusDouble";
import { describeClass } from "../../../test-utils/describeClass";
import { PreviewService } from "./PreviewService";

describeClass(PreviewService, ({ describeMethod }) => {
    describeMethod('onPreviewStart', () => {
        it('Should emit a PreviewReady event on the event bus', () => {
            const testSceneId = 'test-scene-id';

            const eventBus = new InMemoryEventBusDouble();
            const previewService = new PreviewService(eventBus);

            previewService.onPreviewStart(testSceneId, {} as CanvasRenderingContext2D, { width: 800, height: 600 });

            expect(eventBus).toHavePublished({
                name: 'PreviewViewReady',
                payload: {
                    sceneId: testSceneId
                }
            });
        });
    });
});