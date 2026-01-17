import styled from "styled-components"
import { BackgroundColor, FlexBox } from "../../primitives";
import { WithDataTestId } from "../../core/common";
import { v4 } from "uuid";
import { FileSystemImageRepository } from "../../core/assets/image/adapters";
import { ImageAsset } from "sparkengineweb";


type InputValue = string | number | boolean;

const Input = styled.input`
    border: 1px solid ${BackgroundColor.Secondary};
    flex: 1;
    min-width: 15px;
    width: 100%;
`;

const Select = styled.select`
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
    defaultValue?: InputValue,
    type?: string;
    options?: Array<{ value: InputValue; label: string }>;
}

const typesMap: Record<string, string> = {
    'number': 'number',
    'string': 'text',
    'image': 'file',
    'color': 'color',
    'boolean': 'checkbox',
}

const imageLoader = new FileSystemImageRepository();

export const FormInput = ({ label, onChange, defaultValue, "data-testid": dataTestId, type, options }: FormInputProps = {}) => {
    const id = v4();
    const inputType = type ? typesMap[type] : typesMap[typeof defaultValue] ?? typesMap;

    const onValueChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let newValue: InputValue = event.target.value;

        switch (inputType) {
        case 'checkbox':
            newValue = (event.target as HTMLInputElement).checked === true;
            break;
        case 'number':
            newValue = parseInt(event.target.value)
            break;
        }

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

    if (type === 'select') {
        return <FlexBox $direction="row" $fill $fillMethod="flex">
            {label && <Label htmlFor={id}>{label}</Label>}
            <Select
                id={id}
                value={defaultValue as string | number}
                onChange={onValueChange}
                data-testid={`${dataTestId}.InputField`}
            >
                {options?.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                    </option>
                ))}
            </Select>
        </FlexBox>
    }

    return <FlexBox $direction="row" $fill $fillMethod="flex">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Input
            role={type === 'color' ? 'color' : undefined}
            type={inputType}
            id={id}
            onChange={onValueChange}
            data-testid={`${dataTestId}.InputField`}
            {...inputType === 'checkbox' ? {
                checked: defaultValue as boolean ?? false
            } : {
                value: defaultValue as string | number
            }}
        />
    </FlexBox>
}