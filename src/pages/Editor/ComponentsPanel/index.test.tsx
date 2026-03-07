import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentsPanel } from ".";

describe('ComponentsPanel', () => {
    const mockComponents = ['Transform', 'Material', 'BoundingBox'];

    describe('onClose', () => {
        it('Should render close button with X text', () => {
            render(
                <ComponentsPanel
                    components={mockComponents}
                    onSelectComponent={() => { }}
                    onClose={() => { }}
                />
            );

            expect(screen.getByRole('button', { name: 'Close' })).toHaveTextContent('X');
        });

        it('Should invoke onClose callback when clicking close button', () => {
            const onClose = jest.fn();
            render(
                <ComponentsPanel
                    components={mockComponents}
                    onSelectComponent={() => { }}
                    onClose={onClose}
                />
            );

            fireEvent.click(screen.getByRole('button', { name: 'Close' }));

            expect(onClose).toHaveBeenCalled();
        });

        it('Should invoke onClose callback when clicking outside the panel', () => {
            const onClose = jest.fn();
            render(
                <div>
                    <div data-testid="outside-element">Outside</div>
                    <ComponentsPanel
                        components={mockComponents}
                        onSelectComponent={() => { }}
                        onClose={onClose}
                    />
                </div>
            );

            const outsideElement = screen.getByTestId('outside-element');
            fireEvent.mouseDown(outsideElement);

            expect(onClose).toHaveBeenCalled();
        });

        it('Should NOT invoke onClose when clicking inside the panel', () => {
            const onClose = jest.fn();
            render(
                <ComponentsPanel
                    components={mockComponents}
                    onSelectComponent={() => { }}
                    onClose={onClose}
                />
            );

            fireEvent.mouseDown(screen.getByText('Transform'));
            expect(onClose).not.toHaveBeenCalled();
        });
    });
});
