import React from "react";
import { ImageAsset, MaterialComponent, Rgb } from "@sparkengine";
import { FormInput } from "../../../../components";
import { Inputs } from "../../../../primitives/Inputs";
import { Button } from "../../../../primitives";

export interface MaterialPropsGroupProps {
    material: MaterialComponent,
    onMaterialUpdate?: CallableFunction,
}

export const MaterialPropsGroup = ({ material, onMaterialUpdate }: MaterialPropsGroupProps) => {
    const materialDiffuseColorGroup = [
        <FormInput type="color"
            key="material.diffuseColor"
            data-testid="EntityPropsPanel.DiffuseColor"
            defaultValue={material.diffuseColor?.toHexString()}
            onChange={(newDiffuseColor: string) => {
                onMaterialUpdate?.({ newDiffuseColor: Rgb.fromHex(newDiffuseColor) })
            }}
        />
    ];

    const matierialOpacityGroup = [
        <FormInput
            key="material.opacity"
            data-testid="EntityPropsPanel.Opacity"
            defaultValue={material.opacity}
            type="number"
            onChange={(newValue: number) => onMaterialUpdate?.({ newOpacity: newValue })}
        />
    ]

    const meterialDiffuseTextureGroup = [
        <FormInput
            key="material.diffuseTexture"
            data-testid="EntityPropsPanel.DiffuseTexture"
            type="image"
            label={material.diffuseTexture ? 'Replace' : 'Add'}
            onChange={(newDiffuseTexture: ImageAsset) => { onMaterialUpdate?.({ newDiffuseTexture }) }}
        />
    ]

    return (
        <>
            <Inputs.Row $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                <Inputs.Legend>Color</Inputs.Legend>
                {materialDiffuseColorGroup}
                <Button onClick={() => onMaterialUpdate?.({ removeDiffuseColor: true })} data-testid="EntityPropsPanel.RemoveDiffuseColor">
                    X
                </Button>
            </Inputs.Row>
            <Inputs.Row $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                <Inputs.Legend>Opacity</Inputs.Legend>
                {matierialOpacityGroup}
            </Inputs.Row>
            <Inputs.Row $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                <Inputs.Legend>Texture</Inputs.Legend>
                {meterialDiffuseTextureGroup}
            </Inputs.Row>
        </>
    )
}