import React from "react";
import { IComponent } from "sparkengineweb"
import { Inputs } from "../../../../primitives/Inputs";
import { FormInput } from "../../../../components";
import { Function } from "../../../../core/common";


export interface DynamicPropsGroupProps {
    component: IComponent,
    onChange?: CallableFunction,
}

const valueToFormInput = (propertyName: string, value: string | number | object, onChange?: CallableFunction, label?: string): React.ReactNode | React.ReactNode[] => {
    if (typeof value === 'object') {
        return Object.entries(value).map(([key, val]) => (
            valueToFormInput(propertyName, val as string | number, onChange, key)
        ));
    } else {
        return <FormInput
            data-testid="EntityPropsPanel.DynamicProp"
            defaultValue={value}
            label={label?.at(0)?.toUpperCase() ?? ''}
            onChange={(newValue: string | number) => onChange?.(propertyName, newValue)}
        />
    }
}

const camelCaseToCapitalizedWords = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1')
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

export const DynamicPropsGroup = ({ component, onChange }: DynamicPropsGroupProps) => {
    const { __type, ...props } = component.toJson();

    return (
        <>
            {Object.entries(props).map(([key, value]) => (
                <Inputs.Row key={key} $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                    <Inputs.Legend>{camelCaseToCapitalizedWords(key)}</Inputs.Legend>
                    {valueToFormInput(key, value as string | number | object, onChange)}
                </Inputs.Row>
            ))}
        </>
    )
}