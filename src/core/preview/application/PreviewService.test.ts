import { ImageLoaderTestDouble } from "../../../__mocks__/core/assets/image/ImageLoaderTestDouble";
import { InMemoryEventBusDouble } from "../../../__mocks__/core/InMemoryEventBusDouble";
import { PreviewService } from "./PreviewService";

describeClass(PreviewService, ({ describeMethod }) => {
    describeMethod('onPreviewStart', () => {
        it('Should emit a PreviewReady event on the event bus', () => {
            const testSceneId = 'test-scene-id';

            const eventBus = new InMemoryEventBusDouble();
            const previewService = new PreviewService(eventBus, new ImageLoaderTestDouble());

            previewService.onPreviewStart(testSceneId, {} as CanvasRenderingContext2D, { width: 800, height: 600 });

            expect(eventBus).toHavePublished({
                name: 'PreviewViewReady',
                payload: {
                    sceneId: testSceneId
                }
            });
        });
    });

    describe('onMessage: PreviewSceneCommand', () => {
        it.failing('Should deserialize the scene data and render it in the preview', () => {
        });
    });
});