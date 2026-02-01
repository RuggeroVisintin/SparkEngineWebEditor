import { EcsUtils, getOptionalType, IComponent, ImageAsset, MaterialComponentProps, Rgb, typeOf, Enum, isOptionallyInstanceOf } from "sparkengineweb"
import { Inputs } from "../../../../primitives/Inputs";
import { FormInput } from "../../../../components";
import { capitalize } from "../../../../core/common";
import { Button } from "../../../../primitives";
import { isArrayOf } from "../../../../core/common/utils/array";
import { isAnimationFrame } from "../../../../core/common/utils/guards";

type PrimitiveProp = string | number;
type ComplexProp = ImageAsset | Rgb | Enum | object;
type ComponentProp = PrimitiveProp | ComplexProp;

export interface DynamicPropsGroupProps {
    component: IComponent,
    onChange?: CallableFunction,
}

const valueToFormInput = (propertyName: string, value: ComponentProp, component: any, onChange?: CallableFunction, label?: string): React.ReactNode | React.ReactNode[] => {
    const originalValue = component[propertyName];

    if (isOptionallyInstanceOf(component, propertyName, Enum)) {
        const enumClass = Object.getPrototypeOf(value).constructor;
        const options = enumClass.getValues?.() || [];

        const optionsWithLabels = options.map((option: Enum) => {
            // Find the property name that holds this enum value
            const optionLabel = Object.entries(enumClass)
                .find(([_, val]) => val === option)?.[0] || String(option.value);

            return {
                value: String(option.value),
                label: optionLabel
            };
        });

        return (
            <FormInput
                data-testid={`EntityPropsPanel.${capitalize(propertyName)}`}
                type="select"
                defaultValue={(value as Enum)?.value}
                label={label}
                onChange={(newValue: string | number) => {
                    const selected = options.find((opt: Enum) => opt.value === newValue);
                    onChange?.(propertyName, selected);
                }}
                options={optionsWithLabels}
            />
        );
    } else if (isOptionallyInstanceOf(component, propertyName, Rgb)) {
        return <>
            <FormInput
                data-testid={`EntityPropsPanel.${capitalize(propertyName)}`}
                defaultValue={(originalValue as Rgb)?.toHexString() ?? 'null'}
                label={label}
                type="color"
                onChange={(newValue: string) => onChange?.(propertyName, Rgb.fromHex(newValue))}
            />
            <Button onClick={() => onChange?.(propertyName, null)} data-testid="EntityPropsPanel.RemoveDiffuseColor">
                X
            </Button>
        </>
    } else if (isOptionallyInstanceOf(component, propertyName, ImageAsset)){
        return <>
            <FormInput
                data-testid={`EntityPropsPanel.${capitalize(propertyName)}`}
                type="image"
                label={value ? 'Replace' : 'Add'}
                onChange={(newDiffuseTexture: ImageAsset) => { onChange?.('diffuseTexture', newDiffuseTexture) }}
            />
        </>

    } else if (Array.isArray(value) && isArrayOf(value, isAnimationFrame)) {
        return <Button data-testid={`EntityPropsPanel.${capitalize(propertyName)}`}>Edit</Button>
    } else if (typeof value === 'object') {
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
            data-testid={`EntityPropsPanel.${capitalize(propertyName)}${finalLabel ? '.' + finalLabel : ''}`}
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
    const props = EcsUtils.getPublicProperties(component, { writable: true });

    if (typeOf(component) === 'MaterialComponent') {
        delete (props as MaterialComponentProps).diffuseTexturePath;
    }

    return (
        <>
            {Object.entries(props).map(([key, value]) => (
                <Inputs.Row key={key} $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                    <Inputs.Legend>{camelCaseToCapitalizedWords(key)}</Inputs.Legend>
                    {valueToFormInput(key, value as ComponentProp, component as any, onChange)}
                </Inputs.Row>
            ))}
        </>
    )
}