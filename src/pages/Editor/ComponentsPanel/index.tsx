import React from "react";
import { Box } from "../../../primitives";
import { ListItem } from "../../../components";

interface ComponentPanelProps {
    components: string[];
}

export const ComponentsPanel = ({
    components
}: ComponentPanelProps) => {
    return (
        <Box role="listbox" style={{ overflowY: 'auto', height: '100%', display: 'block' }}>
            {
                components.map(componentName => (
                    <ListItem
                        key={componentName}
                        text={componentName}
                        onClick={() => { }} />
                ))
            }
        </Box>
    );
};