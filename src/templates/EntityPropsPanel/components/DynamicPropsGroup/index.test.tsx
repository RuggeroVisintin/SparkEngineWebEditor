import { fireEvent, render, within } from "@testing-library/react";
import { IComponent, Vec2 } from "sparkengineweb";
import { DynamicPropsGroup } from ".";
import React from "react";

describe('EntityPropsPanel/components/DynamicPropsGroup', () => {

    describe('Primitives', () => {
        it.each([
            ['number', 'spinbutton', 100],
            ['text', 'textbox', 'TestString'],
        ])('Should render %s component props', (_, ariaRole, value) => {
            const mockComponent = {
                toJson: () => ({
                    __type: 'MockComponent',
                    testProp: value
                })
            } as unknown as IComponent;

            const view = render(<DynamicPropsGroup component={mockComponent} />);

            const testPropGroup = view.getByRole('group', { name: 'Test Prop' });

            expect(testPropGroup).toBeVisible();
            expect(within(testPropGroup).getByRole(ariaRole, { name: '' })).toHaveValue(value);
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
            ['number', 'spinbutton', 0, 20],
            ['text', 'textbox', 'TestString', 'NewString'],
        ])('Should invoke onChange callbacks when properties are changed for %s', async (_, ariaRole, value, newValue) => {
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
    });

    describe('Complex Objects', () => {
        it('Should trim complex object\'s properties label by keeping the first letter capitalized', () => {
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

        it('Should invoke onChange callbacks when complex objects properties are changed', async () => {
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