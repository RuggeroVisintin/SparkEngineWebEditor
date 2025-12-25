import styled from "styled-components";
import { FlexBoxProps, flexStyles } from "./FlexBox";

export const InputRow = styled.fieldset<FlexBoxProps>`
    border: none;
    padding: 0;
    margin: 0;

    ${flexStyles}

    &+fieldset {
        margin-top: 5px;
    }
`;

