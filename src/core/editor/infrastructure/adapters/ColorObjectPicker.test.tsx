import { BlendMethod, CanvasDevice, DOMImageLoader, DrawPrimitiveCommand, GameObject, PrimitiveType, RenderCommand, Renderer, SetBlendingMethodCommand, SetTransformMatrixCommand, ShapeComponent } from "sparkengineweb";
import { ColorObjectPicker } from "./ColorObjectPicker";
import { uuidToRgb } from "../../../common/uuidToRgb";
import Pivot from "../../domain/entities/Pivot";
import { EntityOutline } from "../../domain/entities";

class RendererTestDouble extends Renderer {
    public renderCommands: RenderCommand[] = [];

    public pushRenderCommand(command: RenderCommand): void {
        this.renderCommands.push(command);
    }
}

describe('core/editor/adapters/ColorObjectPicker', () => {
    let renderSystem: ColorObjectPicker;
    let renderer: RendererTestDouble
    let canvasContext: CanvasRenderingContext2D;

    beforeEach(() => {
        const resolution = { width: 1920, height: 1080 };
        canvasContext = new CanvasRenderingContext2D();

        jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext);

        renderer = new RendererTestDouble(new CanvasDevice(), resolution, canvasContext);
        renderSystem = new ColorObjectPicker(() => renderer, resolution, new DOMImageLoader());

        renderer.renderCommands = [];
    });

    describe('.update()', () => {
        it('Should render objects with a diffuse color based on their parent entity uuid', () => {
            const gameObject = new GameObject();
            const gameObject2 = new GameObject();

            renderSystem.registerComponent(gameObject.shape);
            renderSystem.registerComponent(gameObject2.shape);

            renderSystem.update();

            expect(renderer.renderCommands).toStrictEqual([
                new SetBlendingMethodCommand(BlendMethod.BM_Overwrite),
                new SetTransformMatrixCommand([-0, -0]),
                new DrawPrimitiveCommand(PrimitiveType.Rectangle, [gameObject.transform.position.x, gameObject.transform.position.y], [gameObject.transform.size.width, gameObject.transform.size.height], gameObject.transform.scale, true, uuidToRgb(gameObject.uuid).toRgbaString()),
                new DrawPrimitiveCommand(PrimitiveType.Rectangle, [gameObject2.transform.position.x, gameObject2.transform.position.y], [gameObject2.transform.size.width, gameObject2.transform.size.height], gameObject.transform.scale, true, uuidToRgb(gameObject2.uuid).toRgbaString()),
            ]);
        });

        it('Should render objects based on their depthIndex in reverse order (0 rendered last)', () => {
            const gameObject = new GameObject();
            const gameObject2 = new GameObject();

            gameObject2.transform.depthIndex = 1;

            renderSystem.registerComponent(gameObject.shape);
            renderSystem.registerComponent(gameObject2.shape);

            renderSystem.update();

            expect(renderer.renderCommands).toStrictEqual([
                new SetBlendingMethodCommand(BlendMethod.BM_Overwrite),
                new SetTransformMatrixCommand([-0, -0]),
                new DrawPrimitiveCommand(PrimitiveType.Rectangle, [gameObject2.transform.position.x, gameObject2.transform.position.y], [gameObject2.transform.size.width, gameObject2.transform.size.height], gameObject.transform.scale, true, uuidToRgb(gameObject2.uuid).toRgbaString()),
                new DrawPrimitiveCommand(PrimitiveType.Rectangle, [gameObject.transform.position.x, gameObject.transform.position.y], [gameObject.transform.size.width, gameObject.transform.size.height], gameObject.transform.scale, true, uuidToRgb(gameObject.uuid).toRgbaString()),
            ]);
        });

        it('Should not render objects without a parent entity', () => {
            const component = new ShapeComponent();

            renderSystem.registerComponent(component);
            renderSystem.update();

            expect(renderer.renderCommands).toStrictEqual([
                new SetBlendingMethodCommand(BlendMethod.BM_Overwrite),
                new SetTransformMatrixCommand([-0, -0]),
            ]);
        });

        it.each([
            Pivot, EntityOutline
        ].map((ctor) => [ctor.name, ctor])
        )('Should not render %s editor entities', (__, ctor: new () => any) => {
            const gameObject = new ctor();

            renderSystem.registerComponent(gameObject.shape);
            renderSystem.update();

            expect(renderer.renderCommands).toStrictEqual([
                new SetBlendingMethodCommand(BlendMethod.BM_Overwrite),
                new SetTransformMatrixCommand([-0, -0]),
            ]);
        });
    });

    describe('.pick()', () => {
        it('Should return the entity from a given x,y coordinate', () => {
            const gameObject = new GameObject();
            const gameObject2 = new GameObject();

            const objectX = gameObject.transform.position.x;
            const objectY = gameObject.transform.position.y;
            const object2X = gameObject2.transform.position.x;
            const object2Y = gameObject2.transform.position.y;

            const gameObjectRgb = uuidToRgb(gameObject.uuid);
            const gameObject2Rgb = uuidToRgb(gameObject2.uuid);

            jest.spyOn(canvasContext, 'getImageData').mockImplementation((x, y, width, height) => {
                if (x === objectX && y === object2Y) {
                    return {
                        data: new Uint8ClampedArray([
                            gameObjectRgb.r, gameObjectRgb.g, gameObjectRgb.b, 255, // RGBA for gameObject
                            0, 0, 0, 0 // Transparent for gameObject2
                        ]),
                        width,
                        height,
                        colorSpace: 'srgb'
                    }
                }

                if (x === object2X && y === object2Y) {
                    return {
                        data: new Uint8ClampedArray([
                            0, 0, 0, 0, // Transparent for gameObject
                            gameObject2Rgb.r, gameObject2Rgb.g, gameObject2Rgb.b, 255 // RGBA for gameObject2
                        ]),
                        width,
                        height,
                        colorSpace: 'srgb'
                    }
                }

                return {
                    data: new Uint8ClampedArray([]),
                    width,
                    height,
                    colorSpace: 'srgb'
                }
            })

            renderSystem.registerComponent(gameObject.shape);
            renderSystem.registerComponent(gameObject2.shape);

            renderSystem.update();

            const entity = renderSystem.pick(objectX, objectY);

            expect(entity?.uuid).toEqual(gameObject.uuid);
        });
    })
});