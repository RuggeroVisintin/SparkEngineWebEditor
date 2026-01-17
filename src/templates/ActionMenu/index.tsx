import { PopupMenu } from "../../components/PopupMenu";
import { BackgroundColor, FlexBox, TextColor } from "../../primitives";
import { Function } from "../../core/common";

export interface ActionMenuProps {
    onProjectFileOpen: Function;
    onProjectFileSave: Function;
}

export const ActionMenu = (props: ActionMenuProps) => {
    return (
        <FlexBox style={{ height: '40px', background: BackgroundColor.Primary, borderBottom: `1px solid ${TextColor.Primary}` }}
            $direction='row'>
            <PopupMenu
                data-testid="action-menu.file"
                label="File"
                items={[{
                    label: 'Open',
                    action: props.onProjectFileOpen
                }, {
                    label: 'Save',
                    action: props.onProjectFileSave
                }]}
            />
        </FlexBox>
    )
}