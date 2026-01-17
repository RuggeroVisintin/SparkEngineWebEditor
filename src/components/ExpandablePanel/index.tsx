import { BackgroundColor, Box, BoxProps, FlexBox, Spacing } from "../../primitives"

interface ExpandablePanelProps extends BoxProps {
    children?: React.ReactNode;
    title?: string;
}

export const ExpandablePanel = ({ children, title, ...boxProps }: ExpandablePanelProps) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

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