import { fireEvent, render, screen, within } from "@testing-library/react";
import { Enum, IComponent, ImageAsset, MaterialComponent, Rgb, Vec2, AnimationFrame } from "sparkengineweb";
import { DynamicPropsGroup } from ".";
import { FakeBitmap } from "../../../../__mocks__/bitmap.mock";
import { setMockedFile } from "../../../../__mocks__/fs-api.mock";

describe('EntityPropsPanel/components/DynamicPropsGroup', () => {
    describe('Primitives', () => {
        it.each([
            ['number', 'spinbutton', 100],
            ['text', 'textbox', 'TestString'],
        ])('Should render %s component props', (_, ariaRole, value) => {
            const mockComponent = {
                __type: 'MockComponent',
                testProp: value
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} />);

            const testPropGroup = screen.getByRole('group', { name: 'Test Prop' });

            expect(testPropGroup).toBeVisible();
            expect(within(testPropGroup).getByRole(ariaRole, { name: '' })).toHaveValue(value);
        });

        it('Should map properties names to capitalized labels', async () => {
            const mockComponent = {
                __type: 'MockComponent',
                diffuseColor: '#FF0000',
                opacity: 0.5
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} />);

            const diffuseColorGroup = await screen.findByRole('group', { name: 'Diffuse Color' });
            expect(diffuseColorGroup).toBeVisible();

            const opacityGroup = await screen.findByRole('group', { name: 'Opacity' });
            expect(opacityGroup).toBeVisible();
        });

        it.each([
            ['number', 'spinbutton', 0, 20],
            ['text', 'textbox', 'TestString', 'NewString'],
        ])('Should invoke onChange callbacks when properties are changed for %s', async (_, ariaRole, value, newValue) => {
            const onChangeMock = jest.fn();

            const mockComponent = {
                __type: 'MockComponent',
                prop: value
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} onChange={onChangeMock} />);

            const propGroup = screen.getByRole('group', { name: 'Prop' });
            const propInput = within(propGroup).getByRole(ariaRole, { name: '' });

            fireEvent.change(propInput, { target: { value: newValue } });

            expect(onChangeMock).toHaveBeenCalledWith('prop', newValue);
        });
    });

    describe('Complex Objects', () => {
        it('Should trim complex object\'s properties label by keeping the first letter capitalized', () => {
            const mockComponent = {
                __type: 'MockComponent',
                size: {
                    width: 1920,
                    height: 1080
                }
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} />);

            const sizeGroup = screen.getByRole('group', { name: 'Size' });
            expect(sizeGroup).toBeVisible();

            const widthInput = within(sizeGroup).getByRole('spinbutton', { name: 'W' });
            expect(widthInput).toBeVisible();
            expect(widthInput).toHaveValue(1920);

            const heightInput = within(sizeGroup).getByRole('spinbutton', { name: 'H' });
            expect(heightInput).toBeVisible();
            expect(heightInput).toHaveValue(1080);
        });

        it('Should render nested component props', () => {
            const mockComponent = {
                __type: 'MockComponent',
                nested: {
                    string: 'InnerValue',
                    number: 42
                }
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} />);

            const nestedPropGroup = screen.getByRole('group', { name: 'Nested' });
            expect(nestedPropGroup).toBeVisible();

            const innerStringInput = within(nestedPropGroup).getByRole('textbox', { name: 'S' });
            expect(innerStringInput).toBeVisible();
            expect(innerStringInput).toHaveValue('InnerValue');

            const innerNumberInput = within(nestedPropGroup).getByRole('spinbutton', { name: 'N' });
            expect(innerNumberInput).toBeVisible();
            expect(innerNumberInput).toHaveValue(42);
        });

        it('Should invoke onChange callbacks when complex objects properties are changed', async () => {
            const onChangeMock = jest.fn();

            const resultJson = {
                __type: 'MockComponent',
                size: new Vec2(12, 12)
            };

            const mockComponent = resultJson as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} onChange={onChangeMock} />);

            const nestedPropGroup = screen.getByRole('group', { name: 'Size' });

            const innerSizeInput = within(nestedPropGroup).getByRole('spinbutton', { name: 'X' });
            fireEvent.change(innerSizeInput, { target: { value: 2929 } });

            expect(onChangeMock).toHaveBeenCalledWith('size', new Vec2(2929, 12));
            expect(resultJson.size.x).toBe(12);
        });

        describe('ImageAsset', () => {
            it('Should render image asset as image input', () => {
                const materialComponent = new MaterialComponent();
                materialComponent.diffuseTexture = new ImageAsset(new FakeBitmap(), 'png');

                render(<DynamicPropsGroup component={materialComponent} />);

                const textureGroup = screen.getByRole('group', { name: 'Diffuse Texture' });
                const textureInput = within(textureGroup).getByRole('button', { name: /replace/i });
                expect(textureInput).toBeVisible();
            });

            it('Should render image asset load button when asset is missing on MaterialComponent', () => {
                const materialComponent = new MaterialComponent();

                render(<DynamicPropsGroup component={materialComponent} />);

                const textureGroup = screen.getByRole('group', { name: 'Diffuse Texture' });
                const textureInput = within(textureGroup).getByRole('button', { name: /add/i });
                expect(textureInput).toBeVisible();
            });

            it('Should invoke onChange callback with the loaded image asset when the asset is changed', async () => {
                const materialComponent = new MaterialComponent();
                setMockedFile('assets/test.png');

                const onChangeMock = jest.fn();

                await new Promise((resolve) => {
                    render(<DynamicPropsGroup component={materialComponent} onChange={((propName: string, value: ImageAsset) => {
                        expect(value).toBeInstanceOf(ImageAsset);
                        onChangeMock(propName, value);

                        resolve(null);
                    })} />);

                    const textureGroup = screen.getByRole('group', { name: 'Diffuse Texture' });
                    const textureInput = within(textureGroup).getByRole('button', { name: /add/i });

                    textureInput.click();
                });

                expect(onChangeMock).toHaveBeenCalled();
            });
        });

        describe('Color', () => {
            it('Should render a color picker when a color is detected', () => {
                const mockComponent = new MaterialComponent({
                    diffuseColor: new Rgb(255, 0, 0)
                })

                render(<DynamicPropsGroup component={mockComponent} />);

                const nestedPropGroup = screen.getByRole('group', { name: 'Diffuse Color' });
                const innerColorInput = within(nestedPropGroup).getByRole('color');

                expect(innerColorInput).toHaveValue('#ff0000');
            });

            it('Should invoke onChange callbacks when color is changed', () => {
                const onChangeMock = jest.fn();

                const mockComponent = new MaterialComponent({
                    diffuseColor: new Rgb(0, 255, 0)
                })

                render(<DynamicPropsGroup component={mockComponent} onChange={onChangeMock} />);

                const nestedPropGroup = screen.getByRole('group', { name: 'Diffuse Color' });
                const innerColorInput = within(nestedPropGroup).getByRole('color');

                fireEvent.change(innerColorInput, { target: { value: '#0000ff' } });

                expect(onChangeMock).toHaveBeenCalledWith('diffuseColor', Rgb.fromHex('#0000ff'));
            });

            it('Should allow to remove color if needed', () => {
                const onChangeMock = jest.fn();

                const mockComponent = new MaterialComponent({
                    diffuseColor: new Rgb(0, 255, 0)
                })

                render(<DynamicPropsGroup component={mockComponent} onChange={onChangeMock} />);

                const nestedPropGroup = screen.getByRole('group', { name: 'Diffuse Color' });

                const removeButton = within(nestedPropGroup).getByRole('button', { name: /x/i });
                fireEvent.click(removeButton);

                expect(onChangeMock).toHaveBeenCalledWith('diffuseColor', null);
            });
        })
    });

    describe('Enum', () => {
        it('Should render enum properties as select inputs', () => {
            class TestEnum extends Enum<string> {
                static readonly OptionA = new TestEnum('OptionA');
                static readonly OptionB = new TestEnum('OptionB');
                static readonly OptionC = new TestEnum('OptionC');
            }

            const mockComponent = {
                __type: 'MockComponent',
                enumProp: TestEnum.OptionB
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} />);

            const enumPropGroup = screen.getByRole('group', { name: 'Enum Prop' });
            const enumSelect = within(enumPropGroup).getByRole('combobox');

            expect(enumSelect).toBeVisible();
            expect(enumSelect).toHaveValue('OptionB');
        });
    });

    describe('Arrays of AnimationFrame', () => {
        it('Should recognize arrays of AnimationFrame', () => {
            const mockComponent = {
                __type: 'AnimationComponent',
                frames: [
                    { duration: 100 },
                    { duration: 200 }
                ]
            } as unknown as IComponent;

            render(<DynamicPropsGroup component={mockComponent} />);

            const framesGroup = screen.getByRole('group', { name: 'Frames' });
            expect(framesGroup).toBeVisible();

            const editButton = within(framesGroup).getByRole('button', { name: 'Edit' });
            expect(editButton).toBeVisible();
        });
    });
});