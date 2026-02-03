import { ReactNode, useState } from "react";
import { BackgroundColor, Box, BoxProps, Button, FlexBox, Spacing } from "../../primitives"

interface ExpandablePanelProps extends BoxProps {
    children?: ReactNode;
    title?: string;
    suffix?: ReactNode;
}

export const ExpandablePanel = ({ children, title, suffix, ...boxProps }: ExpandablePanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Box {...boxProps} role="region" aria-label={title}>
            <Box
                data-testid="ExpandablePanel.Title"
                onClick={() => setIsExpanded(!isExpanded)}
                $background={BackgroundColor.Secondary}
                $spacing={Spacing.xs}
                $hSpacing={Spacing.sm}
                $clickable
                role="button"
                aria-expanded={isExpanded}
            >
                <FlexBox $direction="row">
                    <FlexBox $fill>{title}</FlexBox>
                    <FlexBox>{isExpanded ? '-' : '+'}</FlexBox>
                    {
                        suffix &&
                        <FlexBox>
                            {suffix}
                        </FlexBox>
                    }
                </FlexBox>


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