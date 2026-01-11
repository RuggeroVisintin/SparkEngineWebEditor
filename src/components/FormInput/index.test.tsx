import React from "react";
import { FormInput } from ".";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { setMockedFile } from "../../__mocks__/fs-api.mock";
import { ImageAsset } from "sparkengineweb";

describe('FormInput', () => {
    describe('image', () => {
        it('Should load an ImageAsset from the file system when clicked', async () => {
            setMockedFile('assets/test.png');

            const promise = new Promise((resolve) => {
                const inputItem = <FormInput type="image" data-testid="test-input" label="Image" onChange={(image: ImageAsset) => {
                    expect(image).toBeInstanceOf(ImageAsset);
                    resolve(null);
                }} />;

                render(inputItem);

                screen.findByTestId('test-input.InputField').then((inputField) => {
                    inputField.click();
                    resolve(null);
                });
            });

            await promise;
        });
    })

    describe('number', () => {
        it.each([
            ['Explicit type', 'number'],
            ['Inferred type', undefined],
        ])('Should invoke the onChange callback when the value is changed with %s', (_, type) => {
            const onChangeMock = jest.fn();

            const inputItem = <FormInput type={type} data-testid="test-input" defaultValue={10} onChange={onChangeMock} />;

            render(inputItem);

            const inputField = screen.getByTestId('test-input.InputField') as HTMLInputElement;
            fireEvent.change(inputField, { target: { value: '20' } });

            expect(onChangeMock).toHaveBeenCalledWith(20);
        });
    });

    describe('select', () => {
        it('Should show the current selected option', () => {
            const options = [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
            ];

            const inputItem = <FormInput type="select" data-testid="test-input" defaultValue="option2" options={options} />;

            render(inputItem);

            const inputField = screen.getByTestId('test-input.InputField') as HTMLSelectElement;
            expect(inputField.value).toBe('option2');
        });

        it('Should invoke the onChange callback when the value is changed', () => {
            const options = [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
            ];

            const onChangeMock = jest.fn();

            const inputItem = <FormInput type="select" data-testid="test-input" defaultValue="option1" options={options} onChange={onChangeMock} />;

            render(inputItem);

            const inputField = screen.getByTestId('test-input.InputField') as HTMLSelectElement;
            fireEvent.change(inputField, { target: { value: 'option3' } });

            expect(onChangeMock).toHaveBeenCalledWith('option3');
        });
    })

    describe('boolean', () => {
        it('Should treat boolean type as checkbox', () => {
            const onChangeMock = jest.fn();

            const inputItem = <FormInput data-testid="test-input" defaultValue={true} onChange={onChangeMock} />;

            render(inputItem);

            const inputField = screen.getByTestId('test-input.InputField') as HTMLInputElement;
            expect(inputField.type).toBe('checkbox');
        });

        it('Should invoke the onChange callback when the checkbox is toggled', () => {
            let defaultValue = true;

            const onChangeMock = jest.fn(() => {
                defaultValue = !defaultValue;
            });

            const inputItem = <FormInput data-testid="test-input" defaultValue={defaultValue} onChange={onChangeMock} />;

            render(inputItem);

            const inputField = screen.getByTestId('test-input.InputField') as HTMLInputElement;
            fireEvent.click(inputField);

            expect(onChangeMock).toHaveBeenCalledWith(false);
        });
    });
})