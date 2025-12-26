import styled, { css } from 'styled-components';
import { Box } from './Box';

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
`;

export const FlexBox = styled.div<FlexBoxProps>`
    ${flexStyles}
`
