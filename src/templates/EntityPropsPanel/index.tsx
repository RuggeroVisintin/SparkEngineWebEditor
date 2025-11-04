import React from "react";
import { IEntity, MaterialComponent, TransformComponent, TransformComponentProps, typeOf, Vec2 } from "@sparkengine";
import { FormInput } from "../../components";
import { Box, Button, Spacing } from "../../primitives";
import { InputRow } from "../../primitives/InputRow";
import { MaterialPropsGroup } from "./components/MaterialPropsGroup";
import { ExpandablePanel } from "../../components/ExpandablePanel";

interface EntityPropsPanelProps {
    currentEntity?: IEntity,
    onUpdatePosition?: CallableFunction,
    onUpdateSize?: CallableFunction,
    onMaterialUpdate?: CallableFunction
}

interface TransformPropsGroupProps {
    transform: TransformComponentProps,
    onUpdateSize?: CallableFunction,
    onUpdatePosition?: CallableFunction
}

const TransformPropsGroup = ({ transform, onUpdateSize, onUpdatePosition }: TransformPropsGroupProps) => {
    const transformPositionGroup = [
        <FormInput
            label="X"
            type="number"
            key="transform.position.x"
            defaultValue={transform.position?.x}
            onChange={(newValue: number) => onUpdatePosition?.({ newPosition: new Vec2(newValue, transform.position?.y) })}
            data-testid="EntityPropsPanel.Position.x"
        ></FormInput>,
        <FormInput
            label="Y"
            type="number"
            key="transform.position.y"
            defaultValue={transform.position?.y}
            onChange={(newValue: number) => onUpdatePosition?.({ newPosition: new Vec2(transform.position?.x, newValue) })}
            data-testid="EntityPropsPanel.Position.y"
        ></FormInput>
        // TODO -- Zindex
    ];

    const transformSizeInputs = [
        <FormInput
            label="W"
            type="number"
            key="transform.size.width"
            defaultValue={transform.size?.width}
            onChange={(newValue: number) => onUpdateSize?.({ newSize: { width: newValue, height: transform.size?.height } })}
            data-testid="EntityPropsPanel.Size.width"
        ></FormInput>,
        <FormInput
            label="H"
            type="number"
            key="transform.size.height"
            defaultValue={transform.size?.height}
            onChange={(newValue: number) => onUpdateSize?.({ newSize: { width: transform.size?.width, height: newValue } })}
            data-testid="EntityPropsPanel.Size.height"
        ></FormInput>
    ];

    return (
        <>
            <InputRow $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                <Box>Position</Box>
                {transformPositionGroup}
            </InputRow>
            <InputRow $direction="row" $fill={false} $wrap={true} $fillMethod="flex">
                <Box>Size</Box>
                {transformSizeInputs}
            </InputRow>
        </>
    )
};

export const EntityPropsPanel = ({ currentEntity, onUpdatePosition, onUpdateSize, onMaterialUpdate }: EntityPropsPanelProps) => {
    const transform = currentEntity?.getComponent<TransformComponent>('TransformComponent');
    const material = currentEntity?.getComponent<MaterialComponent>('MaterialComponent');

    return (
        <Box $size={1} $scroll $divide $spacing={Spacing.sm}>
            {transform &&
                <ExpandablePanel title="Transform">
                    <TransformPropsGroup
                        transform={transform} onUpdatePosition={onUpdatePosition} onUpdateSize={onUpdateSize}></TransformPropsGroup>
                </ExpandablePanel>
            }
            {material &&
                <ExpandablePanel title="Material" $divide>
                    <MaterialPropsGroup
                        material={material}
                        onMaterialUpdate={onMaterialUpdate}
                    />
                </ExpandablePanel>
            }
            {typeOf(currentEntity) === 'TriggerEntity' && (
                // TODO: scripting should be done at a component level
                <ExpandablePanel title="Scripting" $divide>
                    <Box data-testid="EntityPropsPanel.TriggerEntity.ScriptingProp">
                        <Button
                            data-testid="EntityPropsPanel.TriggerEntity.ScriptingLink"
                            onClick={() => {
                                const namedWindow = window.open(`/scripting/${currentEntity?.uuid}`, 'scripting');

                                if (namedWindow) {
                                    namedWindow.focus();
                                }
                            }}
                        >
                            <Box> Open Scripting </Box>
                        </Button>
                    </Box>
                </ExpandablePanel>

            )
            }
        </Box >
    )
}