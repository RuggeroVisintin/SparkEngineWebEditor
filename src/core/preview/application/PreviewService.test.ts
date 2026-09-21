import { GameObject, Scene, Vec2 } from "@sparkengine";
import { ImageLoaderTestDouble } from "../../../__mocks__/core/assets/image/ImageLoaderTestDouble";
import { InMemoryEventBusDouble } from "../../../__mocks__/core/InMemoryEventBusDouble";
import { PreviewSceneCommand } from "./commands";
import { PreviewService } from "./PreviewService";
import { AssetSerializerTestDouble } from "../../../__mocks__/core/assets/common/ImageSerializerTestDouble";
import { toJsonString } from "../../common";
import { SerializedAssetSnapshot } from "../../assets/common/ports";

describeClass(PreviewService, ({ describeMethod }) => {
    let previewService: PreviewService;
    let eventBus: InMemoryEventBusDouble;
    let testSceneId: string;
    let imageSerializer: AssetSerializerTestDouble;

    beforeEach(() => {
        testSceneId = 'test-scene-id';

        eventBus = new InMemoryEventBusDouble();
        imageSerializer = new AssetSerializerTestDouble();
        const imageLoader = new ImageLoaderTestDouble();

        previewService = new PreviewService(eventBus,
            imageLoader,
            imageSerializer
        );

        previewService.start(testSceneId, {} as CanvasRenderingContext2D, { width: 800, height: 600 });
    });

    describeMethod('start', () => {
        it('Should emit a PreviewReady event on the event bus', () => {
            expect(eventBus).toHavePublished({
                name: 'PreviewViewReady',
                payload: {
                    sceneId: testSceneId
                }
            });
        });

        it('Should create a new scene and draw it', () => {
            expect(previewService.currentScene).toBeInstanceOf(Scene);
            expect(previewService.currentScene.shouldDraw).toEqual(true);
        });
    });

    describe('onMessage: PreviewSceneCommand', () => {
        it('Should add the scene to the preview renderer', () => {
            const sourceScene = new Scene();

            sourceScene.registerEntity(new GameObject({
                transform: {
                    position: new Vec2(100, 200),
                }
            }))

            const scenePayload = sourceScene.toJson();

            const testCommand: PreviewSceneCommand = {
                scene: toJsonString(scenePayload),
                assets: {}
            };

            eventBus.publish('PreviewScene', testCommand);

            expect(previewService.currentScene.toJson()).toEqual(scenePayload);
        });

        it('Should import assets in the image serializer', async () => {
            const sourceScene = new Scene();
            const assets: SerializedAssetSnapshot = {
                'assets/player.png': {
                    media: new Uint8Array([1, 2, 3, 4]),
                    type: 'image/png'
                },
                'assets/background.png': {
                    media: new Uint8Array([5, 6, 7, 8]),
                    type: 'image/png'
                }
            }

            sourceScene.registerEntity(new GameObject({
                transform: {
                    position: new Vec2(100, 200),
                }
            }))

            const scenePayload = sourceScene.toJson();

            const testCommand: PreviewSceneCommand = {
                scene: toJsonString(scenePayload),
                assets: assets
            };

            eventBus.publish('PreviewScene', testCommand);

            expect(await imageSerializer.exportSnapshot()).toEqual(assets);
        });
    });
});
