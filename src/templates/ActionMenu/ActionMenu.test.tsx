import { fireEvent, render, screen } from "@testing-library/react";
import { ActionMenu } from ".";
import { disableFeature, enableFeature } from "../../core/featureFlags";

describe('ActionMenu', () => {
    describe('Preview', () => {
        afterEach(() => {
            disableFeature('PREVIEW_MODE');
        });

        it('Should invoke .onPreviewOpen when clicking Preview action and feature flag is enabled', () => {
            enableFeature('PREVIEW_MODE');

            const onFileOpen = jest.fn();
            const onFileSave = jest.fn();
            const onPreviewOpen = jest.fn();

            const actionMenu = <ActionMenu onProjectFileOpen={onFileOpen} onProjectFileSave={onFileSave} {...({ onPreviewOpen } as any)}></ActionMenu>;

            render(actionMenu);

            fireEvent.click(screen.getByRole('option', { name: 'Preview' }));

            expect(onPreviewOpen).toHaveBeenCalled();
        });
    });

    describe('File>Open', () => {
        it('Should invoke .onFileOpen method with the given filehandle', (done) => {
            const onFileOpen = jest.fn();
            const onFileSave = jest.fn();

            const actionMenu = <ActionMenu onProjectFileOpen={onFileOpen} onProjectFileSave={onFileSave}></ActionMenu>;

            render(actionMenu);

            fireEvent.click(screen.getByRole('option', { name: 'File' }));
            fireEvent.click(screen.getByRole('option', { name: 'Open' }));

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

            fireEvent.click(screen.getByRole('option', { name: 'File' }));
            fireEvent.click(screen.getByRole('option', { name: 'Save' }));

            setTimeout(() => {
                expect(onFileSave).toHaveBeenCalled();
                done();
            })
        });
    })
})