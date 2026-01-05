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
    onComponentUpdate?: CallableFunction,
}

export const EntityPropsPanel = ({ currentEntity, onUpdatePosition, onUpdateSize, onMaterialUpdate, onAddComponent, onComponentUpdate }: EntityPropsPanelProps) => {
    const components = currentEntity?.components;

    return (
        <Box $size={1} $scroll $divide $spacing={Spacing.sm}>
            {components && components.map((component, index) => {
                return (
                    <ExpandablePanel key={index} title={typeOf(component)} $divide={index > 0}>
                        <DynamicPropsGroup component={component} onChange={(propName: string, value: any) => {
                            onComponentUpdate?.(component, propName, value);

                            if (component instanceof TransformComponent) {
                                if (propName === 'position') {
                                    onUpdatePosition?.({ newPosition: value });
                                } else if (propName === 'size') {
                                    onUpdateSize?.({ newSize: value });
                                }
                            } else if (component instanceof MaterialComponent) {
                                console.log('Material prop changed', propName, value);
                                onMaterialUpdate?.({ [propName]: value });
                            }
                        }} />
                    </ExpandablePanel>
                )
            })}
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