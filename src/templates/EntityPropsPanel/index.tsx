import { IComponent, IEntity, typeOf } from "@sparkengine";
import { Box, Button, FlexBox, Spacing } from "../../primitives";
import { ExpandablePanel } from "../../components/ExpandablePanel";
import { Function, isComponentUnavaible, isComponentRequired } from "../../core/common";
import { isFeatureEnabled } from "../../core/featureFlags";
import { DynamicPropsGroup } from "./components/DynamicPropsGroup";

interface EntityPropsPanelProps {
    currentEntity?: IEntity,
    onAddComponent?: Function<void>
    onComponentUpdate?: CallableFunction,
}

export const EntityPropsPanel = ({ currentEntity, onAddComponent, onComponentUpdate }: EntityPropsPanelProps) => {
    const components = currentEntity?.components;

    return (
        <Box $size={1} $scroll $divide $spacing={Spacing.sm}>
            {components && components.map((component, index) => {
                if (isComponentUnavaible(component)) {
                    return null;
                }

                const componentType = typeOf(component);
                const isRequired = currentEntity && isComponentRequired(currentEntity, componentType);

                return (
                    <ExpandablePanel key={index} title={componentType} $divide={index > 0} suffix={
                        isFeatureEnabled('ADD_COMPONENTS') && <Button disabled={isRequired}> X </Button>
                    }>
                        <DynamicPropsGroup component={component} onChange={(propName: string, value: any) => {
                            onComponentUpdate?.(component, propName, value);
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