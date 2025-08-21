import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import { EngineView } from ".";


const hoverWithCSS = async (element: HTMLElement) => {
    await user.hover(element);
    // Manually apply the style for testing
    element.setAttribute('data-test-hover', 'true');
};

const leaveWithCSS = async (element: HTMLElement) => {
    await user.unhover(element);
    // Manually remove the style for testing
    element.removeAttribute('data-test-hover');
}

const pause = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));

describe('EngineView', () => {
    beforeEach(() => {
        Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {
                left: 0,
                top: 0,
                width: 1920 / 1,
                height: 1080 / 1
            } as DOMRect;
        })
    })

    describe('.onClick()', () => {
        it('Should execute the onClick callback when clicked', async () => {
            const onClick = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onClick={onClick} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.click(canvas, {
                clientX: 100,
                clientY: 200,
                button: 0
            })

            expect(onClick).toHaveBeenCalledWith(expect.objectContaining({
                button: 0,
                targetX: expect.any(Number),
                targetY: expect.any(Number)
            }));
        });

        it('Should provide view adjusted mouse coordinates', async () => {
            const onClick = jest.fn();
            const onEngineReady = jest.fn();

            const scaleFactor = 2;

            Element.prototype.getBoundingClientRect = jest.fn(() => {
                return {
                    left: 0,
                    top: 0,
                    width: 1920 / scaleFactor,
                    height: 1080 / scaleFactor
                } as DOMRect;
            })

            const engineView = <EngineView onEngineViewReady={onEngineReady} onClick={onClick} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.click(canvas, {
                clientX: 100,
                clientY: 200,
                button: 0
            })

            expect(onClick).toHaveBeenCalledWith(expect.objectContaining({
                button: 0,
                targetX: 100 * scaleFactor,
                targetY: 200 * scaleFactor
            }));
        });

        it('Should round coordinates to the nearest integer', async () => {
            const onClick = jest.fn();
            const onEngineReady = jest.fn();

            const scaleFactor = 1.261;

            Element.prototype.getBoundingClientRect = jest.fn(() => {
                return {
                    left: 0,
                    top: 0,
                    width: 1920 / scaleFactor,
                    height: 1080 / scaleFactor
                } as DOMRect;
            })

            const engineView = <EngineView onEngineViewReady={onEngineReady} onClick={onClick} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.click(canvas, {
                clientX: 100,
                clientY: 200,
                button: 0
            })

            expect(onClick).toHaveBeenCalledWith(expect.objectContaining({
                button: 0,
                targetX: Math.round(100 * scaleFactor),
                targetY: Math.round(200 * scaleFactor)
            }));
        });

        it('Shoudld not execute the onClick callback when the mouse is dragged', async () => {
            const onClick = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onClick={onClick} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            fireEvent.click(canvas, {
                clientX: 100,
                clientY: 200,
                button: 0
            })
            fireEvent.mouseUp(canvas, { button: 0 });

            await pause(100);

            fireEvent.click(canvas, {
                clientX: 10,
                clientY: 20,
                button: 0
            })

            expect(onClick).toHaveBeenNthCalledWith(1, expect.objectContaining({
                button: 0,
                targetX: 10,
                targetY: 20
            }));
        });
    });

    describe('.onMouseDown', () => {
        it('Should execute when a mouse button is being pushed down', async () => {
            const onMouseDown = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDown={onMouseDown} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });

            expect(onMouseDown).toHaveBeenCalledWith(expect.objectContaining({
                button: 0,
                targetX: expect.any(Number),
                targetY: expect.any(Number)
            }));
        });

        it('Should propagate modifier keys being pressed', async () => {
            const onMouseDown = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDown={onMouseDown} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');

            fireEvent.keyDown(window, { code: 'Space' });

            fireEvent.mouseDown(canvas, { button: 0 });

            expect(onMouseDown).toHaveBeenCalledWith(expect.objectContaining({
                modifiers: expect.objectContaining({
                    space: true
                })
            }));
        });
    });

    describe('.onMouseDragStart()', () => {
        it('should execute when the mouse dragging action is being initiated', async () => {
            const onMouseDragStart = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragStart={onMouseDragStart} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });

            expect(onMouseDragStart).toHaveBeenCalled();
        });

        it('Should not execute when the mouse dragging is already ongoing', async () => {
            const onMouseDragStart = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragStart={onMouseDragStart} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            fireEvent.mouseMove(canvas, { clientX: 102, clientY: 200 });
            fireEvent.mouseUp(canvas, { button: 0 });

            expect(onMouseDragStart).toHaveBeenCalledTimes(1);
        });

        it('Should propagate the modifier keys being pressed', async () => {
            const onMouseDragStart = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragStart={onMouseDragStart} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');

            fireEvent.keyDown(window, { code: 'Space' });

            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            // second one is going to trigger dragging

            fireEvent.mouseUp(canvas, { button: 0 });

            expect(onMouseDragStart).toHaveBeenCalled();
            expect(onMouseDragStart).toHaveBeenCalledWith(expect.objectContaining({
                modifiers: expect.objectContaining({
                    space: true
                })
            }));
        });
    });

    describe('.onMouseDragging()', () => {
        it('Should execute when the mouse is being dragged', async () => {
            const onMouseDragging = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragging={onMouseDragging} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            // first one is not going to trigger dragging but dragStart
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            // second one is going to trigger dragging
            fireEvent.mouseMove(canvas, { clientX: 102, clientY: 200 });
            fireEvent.mouseUp(canvas, { button: 0 });

            expect(onMouseDragging).toHaveBeenCalled();
        });

        it('Should propagate the button being dragged', async () => {
            const onMouseDragging = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragging={onMouseDragging} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 1 });
            // first one is not going to trigger dragging but dragStart
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            // second one is going to trigger dragging
            fireEvent.mouseMove(canvas, { clientX: 102, clientY: 200 });
            fireEvent.mouseUp(canvas, { button: 1 });

            expect(onMouseDragging).toHaveBeenCalledWith(expect.objectContaining({
                button: 1
            }));
        })

        it('Should not execute upon initiating the action', async () => {
            const onMouseDragging = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragging={onMouseDragging} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            fireEvent.mouseUp(canvas, { button: 0 });

            expect(onMouseDragging).not.toHaveBeenCalled();
        });

        it('Should propagate the modifier keys being pressed', async () => {
            const onMouseDragging = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseDragging={onMouseDragging} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');

            fireEvent.keyDown(window, { code: 'Space' });

            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            // second one is going to trigger dragging
            fireEvent.mouseMove(canvas, { clientX: 102, clientY: 200 });

            fireEvent.mouseUp(canvas, { button: 0 });

            expect(onMouseDragging).toHaveBeenCalled();
            expect(onMouseDragging).toHaveBeenCalledWith(expect.objectContaining({
                modifiers: expect.objectContaining({
                    space: true
                })
            }));
        });
    });

    describe('.onMouseWheel()', () => {
        it('Should execute when the mouse wheel is scrolled', async () => {
            const onMouseWheel = jest.fn();
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} onMouseWheel={onMouseWheel} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.wheel(canvas, { deltaX: 100, deltaY: 200 });

            expect(onMouseWheel).toHaveBeenCalledWith(expect.objectContaining({
                scrollX: 100,
                scrollY: 200
            }));
        });
    });

    describe('grab cursor', () => {
        it('Should show the grab mouse cursor if the space bar is pressed while hovering the element', async () => {
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            await hoverWithCSS(canvas);

            fireEvent.keyDown(window, { code: 'Space' });
            expect(canvas).toHaveStyle('cursor: grab');
        });

        it('Should stop showing the grab cursor when the space bar is released', async () => {
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            await hoverWithCSS(canvas);

            fireEvent.keyDown(window, { code: 'Space' });

            fireEvent.keyUp(window, { code: 'Space' });
            expect(canvas).not.toHaveStyle('cursor: grab');
        });

        it('Should stop showing the grab cursor when the mouse stops hovering the element', async () => {
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');

            fireEvent.keyDown(window, { code: 'Space' });
            await hoverWithCSS(canvas);

            await leaveWithCSS(canvas);
            expect(canvas).not.toHaveStyle('cursor: grab');
        });
    })

    describe('grabbing cursor', () => {
        it('Should show the grabbing cursor when the space bar is pressed during a mouse down', async () => {
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.keyDown(window, { code: 'Space' });

            expect(canvas).toHaveStyle('cursor: grabbing');
        });

        it('Should show the grabbing cursor when the space bar is pressed during a mouse drag', async () => {
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            fireEvent.keyDown(window, { code: 'Space' });

            expect(canvas).toHaveStyle('cursor: grabbing');
        });

        it('Should stop showing the grabbing cursor when the space bar is released', async () => {
            const onEngineReady = jest.fn();

            const engineView = <EngineView onEngineViewReady={onEngineReady} />;
            render(engineView);

            const canvas = await screen.findByTestId('EngineView.canvas');
            fireEvent.mouseDown(canvas, { button: 0 });
            fireEvent.mouseMove(canvas, { clientX: 100, clientY: 200 });
            fireEvent.keyDown(window, { code: 'Space' });

            fireEvent.keyUp(window, { code: 'Space' });
            expect(canvas).not.toHaveStyle('cursor: grabbing');
        });
    });
});