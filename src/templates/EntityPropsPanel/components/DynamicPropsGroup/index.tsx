import React from "react";
import { IComponent, ImageAsset, MaterialComponent, MaterialComponentProps, Rgb, typeOf } from "sparkengineweb"
import { Inputs } from "../../../../primitives/Inputs";
import { FormInput } from "../../../../components";
import { capitalize } from "../../../../core/common";
import { Button } from "../../../../primitives";

type PrimitiveProp = string | number;
type ComplexProp = ImageAsset | Rgb | object;
type ComponentProp = PrimitiveProp | ComplexProp;

export interface DynamicPropsGroupProps {
    component: IComponent,
    onChange?: CallableFunction,
}

const valueToFormInput = (propertyName: string, value: ComponentProp, originalValue: any, onChange?: CallableFunction, label?: string): React.ReactNode | React.ReactNode[] => {
    if (originalValue instanceof Rgb) {
        return <>
            <FormInput
                data-testid={`EntityPropsPanel.${capitalize(propertyName)}`}
                defaultValue={(originalValue as Rgb).toHexString()}
                label={label}
                type="color"
                onChange={(newValue: string) => onChange?.(propertyName, Rgb.fromHex(newValue))}
            />
            <Button onClick={() => onChange?.(propertyName, null)} data-testid="EntityPropsPanel.RemoveDiffuseColor">
                X
            </Button>
        </>
    } if (typeof value === 'object') {
        return Object.entries(value).map(([key, val]: [string, PrimitiveProp]) => {
            const originalNestedValue = (originalValue as any)?.[key];
            return valueToFormInput(propertyName, val, originalNestedValue, (_: string, newVal: PrimitiveProp) => {
                const Constructor = Object.getPrototypeOf(originalValue).constructor;
                const result = Object.assign(Object.create(Constructor.prototype), value);

                result[key] = newVal;

                onChange?.(propertyName, result);
            }, key);
        });
    } else {
        const finalLabel = label?.at(0)?.toUpperCase() ?? '';

        return <FormInput
            data-testid={`EntityPropsPanel.${capitalize(propertyName)}.${finalLabel}`}
            defaultValue={value}
            label={finalLabel}
            onChange={(newValue: PrimitiveProp) => onChange?.(propertyName, newValue)}
        />
    }
}

const camelCaseToCapitalizedWords = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1')
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

export const DynamicPropsGroup = ({ component, onChange }: DynamicPropsGroupProps) => {
    const { __type, ...props } = component.toJson();

    let optionalMaterialProps = null;

    if (__type === 'MaterialComponent') {
        delete (props as MaterialComponentProps).diffuseTexturePath;

        optionalMaterialProps = (
            <Inputs.Row $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                <Inputs.Legend>Texture</Inputs.Legend>
                <FormInput
                    data-testid={`EntityPropsPanel.DiffuseTexture`}
                    type="image"
                    label={(component as MaterialComponent).diffuseTexture ? 'Replace' : 'Add'}
                    onChange={(newDiffuseTexture: ImageAsset) => { onChange?.('diffuseTexture', newDiffuseTexture) }}
                />
            </Inputs.Row>
        )
    }

    return (
        <>
            {Object.entries(props).map(([key, value]) => (
                <Inputs.Row key={key} $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                    <Inputs.Legend>{camelCaseToCapitalizedWords(key)}</Inputs.Legend>
                    {valueToFormInput(key, value as ComponentProp, (component as any)[key], onChange)}
                </Inputs.Row>
            ))}
            {/* TODO: find a systemic way to handle empty assets */}
            {optionalMaterialProps}
        </>
    )
}