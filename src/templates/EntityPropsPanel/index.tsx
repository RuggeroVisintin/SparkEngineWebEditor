import React from "react";
import { IEntity, MaterialComponent, TransformComponent, typeOf } from "@sparkengine";
import { Box, Button, FlexBox, Spacing } from "../../primitives";
import { ExpandablePanel } from "../../components/ExpandablePanel";
import { Function } from "../../core/common";
import { isFeatureEnabled } from "../../core/featureFlags";
import { DynamicPropsGroup } from "./components/DynamicPropsGroup";

interface EntityPropsPanelProps {
    currentEntity?: IEntity,
    onUpdatePosition?: CallableFunction,
    onUpdateSize?: CallableFunction,
    onMaterialUpdate?: CallableFunction,
    onAddComponent?: Function<void>
}

export const EntityPropsPanel = ({ currentEntity, onUpdatePosition, onUpdateSize, onMaterialUpdate, onAddComponent }: EntityPropsPanelProps) => {
    const transform = currentEntity?.getComponent<TransformComponent>('TransformComponent');
    const material = currentEntity?.getComponent<MaterialComponent>('MaterialComponent');

    return (
        <Box $size={1} $scroll $divide $spacing={Spacing.sm}>
            {transform &&
                <ExpandablePanel title="Transform">
                    <DynamicPropsGroup component={transform} onChange={(propName: string, newValue: any) => {
                        if (propName === 'position') {
                            onUpdatePosition?.({ newPosition: newValue });
                        } else if (propName === 'size') {
                            onUpdateSize?.({ newSize: newValue });
                        }
                    }} />
                </ExpandablePanel>
            }
            {material &&
                <ExpandablePanel title="Material" $divide>
                    <DynamicPropsGroup
                        component={material}
                        onChange={(propName: string, newValue: any) => {
                            const result: Record<string, any> = {};

                            result[propName] = newValue;

                            if (result['diffuseColor'] === null) {
                                result['removeDiffuseColor'] = true;
                                delete result['diffuseColor'];
                            }

                            onMaterialUpdate?.(result)
                        }}
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
            )}

            {isFeatureEnabled('ADD_COMPONENTS') && <Box $spacing={Spacing.md} $hSpacing={Spacing.none}>
                <FlexBox >
                    <Button onClick={() => onAddComponent?.()}> Add Component </Button>
                </FlexBox>
            </Box>
            }

        </Box>
    )
}