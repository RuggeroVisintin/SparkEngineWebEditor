import { InMemoryEventBusDouble } from "../../../__mocks__/core/InMemoryEventBusDouble";
import { PreviewService } from "./PreviewService";

describe(__dirname, () => {
    describe(PreviewService.name, () => {
        describe(PreviewService.prototype.onPreviewStart.name, () => {
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
    })
});