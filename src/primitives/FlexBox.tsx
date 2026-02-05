import styled, { css } from 'styled-components';
import { Box } from './Box';
import { Spacing } from './spacing';

const getFillProp = ($fillMethod: FillMethod = ''): string => {
    if ($fillMethod === 'flex') {
        return `flex: 1;`;
    }

    return `
        flex: auto;
        height: 100%;
    `;
}

type FillMethod = 'flex' | 'size' | '';

export interface FlexBoxProps {
    $direction?: 'column' | 'row';
    $centerItems?: boolean;
    $fill?: boolean;
    $wrap?: boolean;
    $fillMethod?: FillMethod
    $spacing?: Spacing;
}

export const flexStyles = css<FlexBoxProps>`
    display: flex;
    flex-direction: ${props => props.$direction ?? 'column'};
    align-items: ${props => props.$centerItems ? 'center' : 'unset'};
    
    ${props => props.$wrap && 'flex-wrap: wrap;'}
    ${props => props.$fill && getFillProp(props.$fillMethod)}

    &:${Box} {
        flex: auto;
    }

    ${props => props.$spacing && `margin-left: ${props.$spacing};`}
`;

export const FlexBox = styled.div<FlexBoxProps>`
    ${flexStyles}
`
