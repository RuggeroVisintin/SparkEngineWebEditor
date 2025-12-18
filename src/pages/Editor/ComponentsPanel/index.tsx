import React from "react";
import { Box } from "../../../primitives";
import { ListItem } from "../../../components";

interface ComponentPanelProps {
    components: string[];
    onSelectComponent?: (componentName: string) => void;
}

export const ComponentsPanel = ({
    components,
    onSelectComponent
}: ComponentPanelProps) => {
    return (
        <Box role="listbox" style={{ overflowY: 'auto', height: '100%', display: 'block' }}>
            {
                components.map(componentName => (
                    <ListItem
                        key={componentName}
                        text={componentName}
                        onClick={() => onSelectComponent?.(componentName)} />
                ))
            }
        </Box>
    );
};