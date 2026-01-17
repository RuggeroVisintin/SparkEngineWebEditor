import { fireEvent, render, screen } from "@testing-library/react";
import { ActionMenu } from ".";

describe('ActionMenu', () => {
    describe('File>Open', () => {
        it('Should invoke .onFileOpen method with the given filehandle', (done) => {
            const onFileOpen = jest.fn();
            const onFileSave = jest.fn();

            const actionMenu = <ActionMenu onProjectFileOpen={onFileOpen} onProjectFileSave={onFileSave}></ActionMenu>;

            render(actionMenu);

            fireEvent.click(screen.getByTestId('action-menu.file.trigger'));
            fireEvent.click(screen.getAllByTestId('action-menu.file.item')[0]);

            setTimeout(() => {
                expect(onFileOpen).toHaveBeenCalled();
                done();
            })
        });
        it('Should invoke .onSceneSave method with the given filehandle', (done) => {
            const onFileOpen = jest.fn();
            const onFileSave = jest.fn();

            const actionMenu = <ActionMenu onProjectFileOpen={onFileOpen} onProjectFileSave={onFileSave}></ActionMenu>;

            render(actionMenu);

            fireEvent.click(screen.getByTestId('action-menu.file.trigger'));
            fireEvent.click(screen.getAllByTestId('action-menu.file.item')[1]);

            setTimeout(() => {
                expect(onFileSave).toHaveBeenCalled();
                done();
            })
        });
    })
})