import { fireEvent, render, within } from "@testing-library/react";
import { IComponent, Vec2 } from "sparkengineweb";
import { DynamicPropsGroup } from ".";
import React from "react";

describe('EntityPropsPanel/components/DynamicPropsGroup', () => {

    it('Should render number component props', () => {
        const mockComponent = {
            toJson: () => ({
                __type: 'MockComponent',
                numericProp: 100
            })
        } as unknown as IComponent;

        const view = render(<DynamicPropsGroup component={mockComponent} />);

        const numericPropGroup = view.getByRole('group', { name: 'Numeric Prop' });

        expect(numericPropGroup).toBeVisible();
        expect(within(numericPropGroup).getByRole('spinbutton', { name: '' })).toHaveValue(100);
    });

    it('Should render string component props', () => {
        const mockComponent = {
            toJson: () => ({
                __type: 'MockComponent',
                stringProp: 'TestString'
            })
        } as unknown as IComponent;

        const result = render(<DynamicPropsGroup component={mockComponent} />);

        const stringPropGroup = result.getByRole('group', { name: 'String Prop' });

        expect(stringPropGroup).toBeVisible();
        expect(within(stringPropGroup).getByRole('textbox', { name: '' })).toHaveValue('TestString');
    });

    it('Should map properties names to capitalized labels', async () => {
        const mockComponent = {
            toJson: () => ({
                __type: 'MockComponent',
                diffuseColor: '#FF0000',
                opacity: 0.5
            })
        } as unknown as IComponent;

        const view = render(<DynamicPropsGroup component={mockComponent} />);

        const diffuseColorGroup = await view.findByRole('group', { name: 'Diffuse Color' });
        expect(diffuseColorGroup).toBeVisible();

        const opacityGroup = await view.findByRole('group', { name: 'Opacity' });
        expect(opacityGroup).toBeVisible();
    });

    it.each([
        ['spinbutton', 0, 20],
        ['textbox', 'TestString', 'NewString'],
    ])('Should invoke onChange callbacks when properties are changed with value %s', async (ariaRole, value, newValue) => {
        const onChangeMock = jest.fn();

        const mockComponent = {
            toJson: () => ({
                __type: 'MockComponent',
                prop: value
            })
        } as unknown as IComponent;

        const view = render(<DynamicPropsGroup component={mockComponent} onChange={onChangeMock} />);

        const propGroup = view.getByRole('group', { name: 'Prop' });
        const propInput = within(propGroup).getByRole(ariaRole, { name: '' });

        fireEvent.change(propInput, { target: { value: newValue } });

        expect(onChangeMock).toHaveBeenCalledWith('prop', newValue);
    });

    describe('Nested Properties', () => {
        it('Should trim nested component properties label by keeping the first letter capitalized', () => {
            const mockComponent = {
                toJson: () => ({
                    __type: 'MockComponent',
                    size: {
                        width: 1920,
                        height: 1080
                    }
                })
            } as unknown as IComponent;

            const view = render(<DynamicPropsGroup component={mockComponent} />);

            const sizeGroup = view.getByRole('group', { name: 'Size' });
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
                toJson: () => ({
                    __type: 'MockComponent',
                    nested: {
                        string: 'InnerValue',
                        number: 42
                    }
                })
            } as unknown as IComponent;

            const result = render(<DynamicPropsGroup component={mockComponent} />);

            const nestedPropGroup = result.getByRole('group', { name: 'Nested' });
            expect(nestedPropGroup).toBeVisible();

            const innerStringInput = within(nestedPropGroup).getByRole('textbox', { name: 'S' });
            expect(innerStringInput).toBeVisible();
            expect(innerStringInput).toHaveValue('InnerValue');

            const innerNumberInput = within(nestedPropGroup).getByRole('spinbutton', { name: 'N' });
            expect(innerNumberInput).toBeVisible();
            expect(innerNumberInput).toHaveValue(42);
        });

        it('Should invoke onChange callbacks when nested properties are changed', async () => {
            const onChangeMock = jest.fn();

            const resultJson = {
                __type: 'MockComponent',
                size: new Vec2(12, 12)
            };

            const mockComponent = {
                toJson: () => resultJson
            } as unknown as IComponent;

            const view = render(<DynamicPropsGroup component={mockComponent} onChange={onChangeMock} />);

            const nestedPropGroup = view.getByRole('group', { name: 'Size' });

            const innerSizeInput = within(nestedPropGroup).getByRole('spinbutton', { name: 'X' });
            fireEvent.change(innerSizeInput, { target: { value: 2929 } });

            expect(onChangeMock).toHaveBeenCalledWith('size', new Vec2(2929, 12));
            expect(resultJson.size.x).toBe(12);
        });
    });
});