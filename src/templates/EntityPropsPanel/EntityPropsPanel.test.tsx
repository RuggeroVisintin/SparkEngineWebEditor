import React from "react";
import { GameObject, ImageAsset, Rgb, TriggerEntity, Vec2 } from "@sparkengine";
import { EntityPropsPanel } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
import { FakeBitmap } from "../../__mocks__/bitmap.mock";
import { setMockedFile } from "../../__mocks__/fs-api.mock";
import { WithMemoryRouter } from "../../hooks";
import { getWindowCurrentUrl } from "../../__mocks__/window.mock";
import { disableFeature, enableFeature } from "../../core/featureFlags";

describe('EntityPropsPanel', () => {
    describe('Transform', () => {
        describe('.position', () => {
            const positionProps: ('x' | 'y')[] = ['x', 'y'];

            it.each(positionProps)('Should initialize the position input props to the same value as the selected entity', (prop) => {
                const entity = new GameObject();
                entity.transform.position[prop] = 1;

                render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Transform'));

                const inputFieldX = screen.getByTestId(`EntityPropsPanel.Position.${prop}.InputField`);

                expect(inputFieldX).toHaveValue(entity.transform.position[prop]);
            });

            it.each(positionProps)('Should update the default transform.position.%s value when entity is changed', (prop) => {
                const entity = new GameObject();
                entity.transform.position[prop] = 1;

                const { rerender } = render(<EntityPropsPanel currentEntity={entity} />);

                const newEntity = new GameObject();

                rerender(<EntityPropsPanel currentEntity={newEntity} />);
                fireEvent.click(screen.getByText('Transform'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Position.${prop}.InputField`);
                expect(inputField).toHaveValue(newEntity.transform.position[prop]);
            });

            it.each(positionProps)('Should invoke the onUpdatePosition callback when the %s input changes', (prop) => {
                const entity = new GameObject();

                const result = new Vec2();
                result[prop] = 23;

                const cb = jest.fn();

                render(<EntityPropsPanel currentEntity={entity} onUpdatePosition={cb} />);
                fireEvent.click(screen.getByText('Transform'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Position.${prop}.InputField`);
                fireEvent.change(inputField, { target: { value: '23' } })

                expect(cb).toHaveBeenCalledWith({ newPosition: result });
            });
        })

        describe('.size', () => {
            const sizeProps: ('width' | 'height')[] = ['width', 'height'];

            it.each(sizeProps)('Should initialize the size input props to the same value as the selected entity', (prop) => {
                const entity = new GameObject();
                entity.transform.size[prop] = 1;

                render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Transform'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Size.${prop}.InputField`);


                expect(inputField).toHaveValue(entity.transform.size[prop]);
            });

            it.each(sizeProps)('Should update the default transform.size.%s value when entity is changed', (prop) => {
                const entity = new GameObject();
                entity.transform.size[prop] = 1;

                const { rerender } = render(<EntityPropsPanel currentEntity={entity} />);

                const newEntity = new GameObject();

                rerender(<EntityPropsPanel currentEntity={newEntity} />);
                fireEvent.click(screen.getByText('Transform'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Size.${prop}.InputField`);

                expect(inputField).toHaveValue(newEntity.transform.size[prop]);
            });

            it.each(sizeProps)('Should invoke the onUpdateSize callback when size.%s input changes', (prop) => {
                const entity = new GameObject();
                entity.transform.size = { width: 15, height: 10 }

                const result = { ...entity.transform.size };
                result[prop] = 23;

                const cb = jest.fn();

                render(<EntityPropsPanel currentEntity={entity} onUpdateSize={cb} />);
                fireEvent.click(screen.getByText('Transform'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Size.${prop}.InputField`);
                fireEvent.change(inputField, { target: { value: '23' } })

                expect(cb).toHaveBeenCalledWith({ newSize: result });
            });
        })
    })

    describe('Material', () => {
        describe('.diffuseColor', () => {
            const diffuseColorProps: ('r' | 'g' | 'b')[] = ['r', 'g', 'b'];

            it.each(diffuseColorProps)('Should initialize the material diffuse color props with the same value as the selected entity', (prop) => {
                const entity = new GameObject();
                entity.material.diffuseColor = new Rgb(123, 233, 111);

                render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Material'));

                const inputFieldX = screen.getByTestId(`EntityPropsPanel.DiffuseColor.InputField`);

                expect(inputFieldX).toHaveValue(entity.material.diffuseColor.toHexString());
            })

            it.each(diffuseColorProps)('Should update the default material.diffuseColor.%s value when entity is changed', (prop) => {
                const entity = new GameObject();
                entity.material.diffuseColor = new Rgb(123, 233, 111);

                const { rerender } = render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Material'));

                const newEntity = new GameObject();
                newEntity.material.diffuseColor = new Rgb(222, 111, 121);

                rerender(<EntityPropsPanel currentEntity={newEntity} />);

                const inputField = screen.getByTestId(`EntityPropsPanel.DiffuseColor.InputField`);
                expect(inputField).toHaveValue(newEntity.material.diffuseColor.toHexString());
            });

            it.each(diffuseColorProps)('Should invoke the onMaterialUpdate callback when the %s input changes', (prop) => {
                const entity = new GameObject();
                entity.material.diffuseColor = new Rgb(123, 233, 111);

                const result = Rgb.fromRgb(entity.material.diffuseColor);
                result[prop] = 125;

                const cb = jest.fn();

                render(<EntityPropsPanel currentEntity={entity} onMaterialUpdate={cb} />);
                fireEvent.click(screen.getByText('Material'));


                const inputField = screen.getByTestId(`EntityPropsPanel.DiffuseColor.InputField`);
                fireEvent.change(inputField, { target: { value: result.toHexString() } })

                expect(cb).toHaveBeenCalledWith({ newDiffuseColor: result });
            })

            it('Should invoke the onMaterialUpdate callback when the remove diffuse color button is clicked', () => {
                const entity = new GameObject();
                entity.material.diffuseColor = new Rgb(123, 233, 111);

                const cb = jest.fn();

                render(<EntityPropsPanel currentEntity={entity} onMaterialUpdate={cb} />);
                fireEvent.click(screen.getByText('Material'));

                const button = screen.getByTestId(`EntityPropsPanel.RemoveDiffuseColor`);
                fireEvent.click(button);

                expect(cb).toHaveBeenCalledWith({ removeDiffuseColor: true });
            })
        });

        describe('.opacity', () => {
            it('Should initialize the material.opacity value with the same value as the selected entity', () => {
                const entity = new GameObject();
                entity.material.opacity = 0.5;

                render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Material'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Opacity.InputField`);

                expect(inputField).toHaveValue(entity.material.opacity);
            });

            it('Should update the default material.opacity value when entity is changed', () => {
                const entity = new GameObject();
                entity.material.opacity = 0.5;

                const { rerender } = render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Material'));

                const newEntity = new GameObject();
                newEntity.material.opacity = 50;

                rerender(<EntityPropsPanel currentEntity={newEntity} />);

                const inputField = screen.getByTestId(`EntityPropsPanel.Opacity.InputField`);
                expect(inputField).toHaveValue(newEntity.material.opacity);
            });

            it('Should invoke the onMaterialUpdate callback when the opacity input changes', () => {
                const entity = new GameObject();
                entity.material.opacity = 0.5;

                const cb = jest.fn();

                render(<EntityPropsPanel currentEntity={entity} onMaterialUpdate={cb} />);
                fireEvent.click(screen.getByText('Material'));

                const inputField = screen.getByTestId(`EntityPropsPanel.Opacity.InputField`);

                expect(inputField).toHaveValue(entity.material.opacity);
                fireEvent.change(inputField, { target: { value: '75' } })
                expect(cb).toHaveBeenCalledWith({ newOpacity: 75 });
            })
        });

        describe('.diffuseTexture', () => {
            it('Should prompt to add the image when no texture is loaded', () => {
                const entity = new GameObject();
                entity.material.diffuseTexturePath = 'test.png';

                render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Material'));

                const inputField = screen.getByTestId(`EntityPropsPanel.DiffuseTexture.InputField`);

                expect(inputField).toHaveTextContent("Add");
            });

            it('Should prompt to replace the image when a texture is loaded', () => {
                const entity = new GameObject();
                entity.material.diffuseTexturePath = 'test.png';
                entity.material.diffuseTexture = new ImageAsset(new FakeBitmap(), 'test.png');

                render(<EntityPropsPanel currentEntity={entity} />);
                fireEvent.click(screen.getByText('Material'));

                const inputField = screen.getByTestId(`EntityPropsPanel.DiffuseTexture.InputField`);

                expect(inputField).toHaveTextContent("Replace");
            })

            it('Should invoke the onMaterialUpdate callback when the diffuse texture input changes', async () => {
                const entity = new GameObject();
                entity.material.diffuseTexturePath = 'test.png';

                setMockedFile('assets/test.png');

                const promise = new Promise((resolve) => {
                    render(<EntityPropsPanel currentEntity={entity} onMaterialUpdate={({ newDiffuseTexture }: { newDiffuseTexture: ImageAsset }) => {
                        expect(newDiffuseTexture).toBeInstanceOf(ImageAsset);
                        resolve(null);
                    }} />);

                    fireEvent.click(screen.getByText('Material'));


                    const inputField = screen.getByTestId(`EntityPropsPanel.DiffuseTexture.InputField`);
                    inputField.click();
                })

                await promise;
            });
        })
    });

    describe('TriggerEntity', () => {
        it('Should show the scripting prop', () => {
            const entity = new TriggerEntity();

            render(
                WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
            );
            fireEvent.click(screen.getByText('Scripting'));

            const scriptingPanel = screen.getByTestId('EntityPropsPanel.TriggerEntity.ScriptingProp');
            expect(scriptingPanel).toBeInTheDocument();
        });

        it('Should open the scripting panel on a blank tab when the link is clicked', () => {
            const entity = new TriggerEntity();

            const onNavigate = jest.fn();

            render(
                WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />, onNavigate)
            );
            fireEvent.click(screen.getByText('Scripting'));

            fireEvent.click(screen.getByTestId('EntityPropsPanel.TriggerEntity.ScriptingLink'));

            expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({
                location: expect.objectContaining({ pathname: '/' }),
            }));

            expect(getWindowCurrentUrl('scripting')).toBe(`/scripting/${entity.uuid}`);
        });
    });

    describe('Add Component', () => {
        describe('Feature Flag ENABLED', () => {
            beforeAll(() => {
                enableFeature('ADD_COMPONENTS');
            })

            it('Should have an "Add component" button', () => {
                const entity = new GameObject();

                render(
                    WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
                );

                const addComponentButton = screen.queryByRole('button', { name: 'Add Component' });
                expect(addComponentButton).toBeVisible();
            });

            it('Should invoke the "onAddComponent" callback', () => {
                const entity = new GameObject();
                const cb = jest.fn();

                render(
                    WithMemoryRouter(<EntityPropsPanel currentEntity={entity} onAddComponent={cb} />)
                );
                const addComponentButton = screen.getByRole('button', { name: 'Add Component' });
                fireEvent.click(addComponentButton);

                expect(cb).toHaveBeenCalled();
            });
        });

        describe('Feature Flag DISABLED', () => {
            beforeAll(() => {
                disableFeature('ADD_COMPONENTS');
            });

            it('Should not have an "Add component" button', () => {
                const entity = new GameObject();

                render(
                    WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
                );

                const addComponentButton = screen.queryByRole('button', { name: 'Add Component' });
                expect(addComponentButton).not.toBeInTheDocument();
            });
        });
    });
})