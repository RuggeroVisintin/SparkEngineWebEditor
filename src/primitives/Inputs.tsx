import styled from "styled-components";
import { TextColor } from "./colors";
import { FlexBoxProps, flexStyles } from "./FlexBox";
import React from "react";
import { Box } from "./Box";

const Row = styled.fieldset<FlexBoxProps>`
    border: none;
    padding: 0;
    margin: 0;

    ${flexStyles}

    &+fieldset {
        margin-top: 5px;
    }
`;

const Legend = styled.legend`
    color: ${TextColor.Primary};
    display: contents;
    flex: 1;
`;

export const Inputs = {
    Row,
    Legend: ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) =>
        <Legend>
            <Box style={style}>{children}</Box>
        </Legend>
};

