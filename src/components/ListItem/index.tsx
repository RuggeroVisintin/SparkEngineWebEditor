import React, { MouseEventHandler } from "react";
import styled from "styled-components";
import { WithDataTestId } from "../../core/common";
import { BackgroundColor, Box, Button, FlexBox, Spacing } from "../../primitives";

const ItemWrapper = styled(Box)`
    padding: ${Spacing.sm};
    margin: ${Spacing.xxs} 0px;
    border-radius: 5px;
`

const ImageBox = styled.img`
    max-width: 45px;
    max-height: 45px;
    margin-right: ${Spacing.md};

    border-radius: 5px;

    background: ${BackgroundColor.Secondary}
`

const Text = styled.span`
    line-height: 1;
    vertical-align: middle;
    flex: 1;
`

interface ListButton extends WithDataTestId {
    text?: string,
    onClick?: MouseEventHandler<HTMLElement>
}
interface ListItemProps extends WithDataTestId {
    text?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    imgSrc?: string;
    button?: ListButton;
    isAcitve?: boolean;
    flex?: boolean;
}

export const ListItem = ({
    text,
    onClick,
    imgSrc,
    'data-testid': dataTestId,
    button,
    isAcitve,
    flex = true
}: ListItemProps) => {
    return (
        <ItemWrapper
            role={onClick ? "option" : "listitem"}
            $background={isAcitve ? BackgroundColor.Secondary : undefined}
            onClick={(e) => onClick?.(e)}
            data-testid={dataTestId}
            $size={flex ? 1 : 0}
            $clickable={!!onClick}
        >
            <FlexBox $direction="row" $centerItems>
                {imgSrc && <ImageBox src={new URL(`../../assets/images/${imgSrc}`, import.meta.url).href} alt="img" />}
                <Text>{text}</Text>
                {button &&
                    <Button
                        onClick={(e) => {
                            button.onClick?.(e);
                        }}
                        data-testid={button["data-testid"]}
                    >
                        {button.text}
                    </Button>
                }
            </FlexBox>
        </ItemWrapper>
    );
}