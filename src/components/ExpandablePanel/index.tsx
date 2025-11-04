import React from "react"
import { BackgroundColor, Box, BoxProps, Spacing } from "../../primitives"

interface ExpandablePanelProps extends BoxProps {
    children?: React.ReactNode;
    title?: string;
}

export const ExpandablePanel = ({ children, title, ...boxProps }: ExpandablePanelProps) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <Box {...boxProps}>
            <Box
                data-testid="ExpandablePanel.Title" onClick={() => setIsExpanded(!isExpanded)}
                $background={BackgroundColor.Secondary}
                $spacing={Spacing.xs}
                $hSpacing={Spacing.sm}
            >
                {title}
            </Box>
            {isExpanded &&
                <Box
                    $spacing={Spacing.xs}
                    $hSpacing={Spacing.sm}
                >
                    {children}
                </Box>
            }

        </Box>
    )
}