import React from "react";
import { Box, FlexBox } from "../../../primitives";

interface ComponentPanelProps {
    components: string[];
}

export const ComponentsPanel = ({
    components
}: ComponentPanelProps) => {
    return (
        <FlexBox role="listbox">
            {
                components.map(componentName => (
                    <Box key={componentName} role="option">
                        {componentName}
                    </Box>
                ))
            }
        </FlexBox>
    );
};