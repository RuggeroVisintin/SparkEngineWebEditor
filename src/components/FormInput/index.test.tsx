import React from "react";
import { FormInput } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
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
})