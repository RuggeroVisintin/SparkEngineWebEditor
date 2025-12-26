import React from "react";
import styled from "styled-components"
import { BackgroundColor, FlexBox } from "../../primitives";
import { WithDataTestId } from "../../core/common";
import { v4 } from "uuid";
import { FileSystemImageRepository } from "../../core/assets/image/adapters";
import { ImageAsset } from "sparkengineweb";

const Input = styled.input`
    border: 1px solid ${BackgroundColor.Secondary};
    flex: 1;
    min-width: 15px;
    width: 100%;
`;

const Label = styled.label`
    display: inline-block;
`;

interface FormInputProps extends WithDataTestId {
    label?: string;
    onChange?: CallableFunction,
    defaultValue?: number | string,
    type?: string;
}

const typesMap: Record<string, string> = {
    'number': 'number',
    'string': 'text',
    'image': 'file',
    'color': 'color',
}

const imageLoader = new FileSystemImageRepository();

export const FormInput = ({ label, onChange, defaultValue, "data-testid": dataTestId, type }: FormInputProps = {}) => {
    const id = v4();
    const inputType = type ? typesMap[type] : typesMap[typeof defaultValue] ?? typesMap;

    const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = inputType === 'number' ? parseInt(event.target.value) : event.target.value;
        onChange?.(newValue);
    }

    if (type === 'image') {
        return <FlexBox $direction="row" $fill $fillMethod="flex">
            {defaultValue && <img src={defaultValue as string} alt={defaultValue as string}></img>}
            {
                label && <button data-testid={`${dataTestId}.InputField`} onClick={() => {
                    imageLoader.load().then((image: ImageAsset) => {
                        onChange?.(image);
                    });
                }}>{label}</button>
            }

        </FlexBox>
    }

    return <FlexBox $direction="row" $fill $fillMethod="flex">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Input
            type={inputType}
            id={id}
            value={defaultValue}
            onChange={onValueChange}
            data-testid={`${dataTestId}.InputField`}
        />
    </FlexBox>
}