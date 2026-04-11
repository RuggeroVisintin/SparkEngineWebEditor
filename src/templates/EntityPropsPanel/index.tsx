import { IEntity } from "@sparkengine";
import { typeOf } from "sparkengineweb";
import { Box, Button, FlexBox, Spacing } from "../../primitives";
import { ExpandablePanel } from "../../components/ExpandablePanel";
import { Function, isComponentUnavaible, isComponentRequired } from "../../core/common";
import { isFeatureEnabled } from "../../core/featureFlags";
import { DynamicPropsGroup } from "./components/DynamicPropsGroup";

interface EntityPropsPanelProps {
    currentEntity?: IEntity,
    onAddComponent?: Function<void>
    onComponentUpdate?: CallableFunction,
    onComponentRemove: Function<string>,
}

const toScriptingPath = (
    pathname: string,
    entityUuid: string,
    componentUuid: string,
    callbackPropertyName: string,
) => {
    const trimmedPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
    return `${trimmedPath}/scripting/${entityUuid}/${componentUuid}/${callbackPropertyName}`;
};

export const EntityPropsPanel = ({ currentEntity, onAddComponent, onComponentUpdate, onComponentRemove }: EntityPropsPanelProps) => {
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
                        isFeatureEnabled('ADD_COMPONENTS') && <Button disabled={isRequired} onClick={() => onComponentRemove(component.uuid)}> X </Button>
                    }>
                        <DynamicPropsGroup 
                            component={component} 
                            onChange={(propName: string, value: any) => {
                                onComponentUpdate?.(component, propName, value);
                            }} 
                            onOpenScripting={(callbackPropertyName: string) => {
                                const namedWindow = window.open(
                                    toScriptingPath(
                                        window.location.pathname,
                                        currentEntity?.uuid ?? '',
                                        component.uuid,
                                        callbackPropertyName,
                                    ),
                                    'scripting'
                                );

                                if (namedWindow) {
                                    namedWindow.focus();
                                }
                            }} 
                        />
                    </ExpandablePanel>
                )
            })}

            {isFeatureEnabled('ADD_COMPONENTS') && <Box $spacing={Spacing.md} $hSpacing={Spacing.none}>
                <FlexBox >
                    <Button onClick={() => onAddComponent?.()}> Add Component </Button>
                </FlexBox>
            </Box>
            }

        </Box>
    )
}