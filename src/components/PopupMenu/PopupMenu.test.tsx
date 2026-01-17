import { fireEvent, render, screen } from "@testing-library/react";
import { PopupMenu } from ".";

describe('PopupMenu', () => {
    it('Should render the menu label based on the given config', () => {
        const popupMenu = <PopupMenu data-testid='test-popup-menu' label="File"></PopupMenu>;

        render(popupMenu);
        expect(screen.getByTestId(`test-popup-menu.trigger`)).toHaveTextContent('File');
    })

    it('Should not show children menu by default', () => {
        const popupMenu = <PopupMenu data-testid='test-popup-menu-file' label="File" items={[{
            label: 'Open'
        }, {
            label: 'Save'
        }]}></PopupMenu>;

        render(popupMenu);
        expect(screen.queryAllByTestId(`test-popup-menu-file.item`)).toEqual([]);
    });

    it('Should open the child submenu when children property is defined', () => {
        const popupMenu = <PopupMenu data-testid='test-popup-menu-file' label="File" items={[{
            label: 'Open'
        }, {
            label: 'Save'
        }]}></PopupMenu>;

        render(popupMenu);
        fireEvent.click(screen.getByTestId(`test-popup-menu-file.trigger`));

        const items = screen.queryAllByTestId(`test-popup-menu-file.item`);

        expect(items[0]).toHaveTextContent('Open');
        expect(items[1]).toHaveTextContent('Save');
    });

    it('Should close the menu if an action is clicked', () => {
        const popupMenu = <PopupMenu data-testid='test-popup-menu-file' label="File" items={[{
            label: 'Open'
        }, {
            label: 'Save'
        }]}></PopupMenu>;

        render(popupMenu);
        fireEvent.click(screen.getByTestId(`test-popup-menu-file.trigger`));

        const items = screen.queryAllByTestId(`test-popup-menu-file.item`);

        fireEvent.click(items[0])
        expect(screen.queryAllByTestId(`test-popup-menu-file.item`)).toEqual([]);
    });

    it('Should invoke a children\'s action if defined', () => {
        const testAction = jest.fn();
        const popupMenu = <PopupMenu data-testid='test-popup-menu-file' label="File" items={[{
            label: 'Open',
            action: testAction
        }, {
            label: 'Save'
        }]}></PopupMenu>;

        render(popupMenu);
        fireEvent.click(screen.getByTestId(`test-popup-menu-file.trigger`));

        const items = screen.queryAllByTestId(`test-popup-menu-file.item`);

        fireEvent.click(items[0])

        expect(testAction).toHaveBeenCalled();
    });

    it('Should invoke the main action when defined', () => {
        const testAction = jest.fn();
        const popupMenu = <PopupMenu data-testid='test-popup-menu-file' label="File" action={testAction}></PopupMenu>;

        render(popupMenu);
        fireEvent.click(screen.getByTestId(`test-popup-menu-file.trigger`));

        expect(testAction).toHaveBeenCalled();
    });

    it('Should not open the children menu when main action is defined', () => {
        const testAction = jest.fn();
        const popupMenu = <PopupMenu data-testid='test-popup-menu-file' label="File" action={testAction} items={[{
            label: 'Open'
        }, {
            label: 'Save'
        }]}></PopupMenu>;

        render(popupMenu);
        fireEvent.click(screen.getByTestId('test-popup-menu-file.trigger'));

        expect(testAction).toHaveBeenCalled();
        expect(screen.queryAllByTestId('test-popup-menu-file.item')).toEqual([]);
    })
})