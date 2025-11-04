import styled from "styled-components";
import { BackgroundColor, TextColor } from "./colors";
import { Spacing } from "./spacing";

export interface BoxProps {
    $size?: number;
    $spacing?: Spacing
    $hSpacing?: Spacing;
    $background?: string;
    $scroll?: boolean;
    $divide?: boolean;
    $clickable?: boolean;
}

export const Box = styled.div<BoxProps>`
    flex: ${props => props.$size ?? 1};
    color: ${TextColor.Primary};
    background: ${props => props.$background ?? BackgroundColor.Primary};

    ${props => props.$spacing && `padding: ${props.$spacing};`}
    ${props => props.$hSpacing && `padding-left: ${props.$hSpacing}; padding-right: ${props.$hSpacing};`}
    ${props => props.$scroll && 'overflow: auto;'}

    ${props => props.$divide && 'border-top: 1px solid;'}

    ${props => props.$clickable && `
        &:hover {
            background: ${BackgroundColor.Accents};
        }

        cursor: pointer;
    `}
`;