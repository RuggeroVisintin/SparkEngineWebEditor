import { fireEvent, render, screen } from "@testing-library/react";
import { ExpandablePanel } from ".";

describe('ExpandablePanel', () => {
    it('Should be collapsed by default', () => {
        render(
            <ExpandablePanel>
                <div>This is a child element</div>
                <p>Another child element</p>
            </ExpandablePanel>
        );
        const content = screen.queryByText('This is a child element');
        expect(content).not.toBeInTheDocument();
    });

    it('Should expand when clicked from collapsed', () => {
        render(
            <ExpandablePanel>
                <div>This is a child element</div>
                <p>Another child element</p>
            </ExpandablePanel>
        );

        const panel = screen.getByTestId('ExpandablePanel.Title');
        fireEvent.click(panel);

        const content = screen.queryByText('This is a child element');
        expect(content).toBeInTheDocument();
    });

    it('Should collapse when clicked from expansed', () => {
        render(
            <ExpandablePanel>
                <div>This is a child element</div>
                <p>Another child element</p>
            </ExpandablePanel>
        );

        const panel = screen.getByTestId('ExpandablePanel.Title');
        fireEvent.click(panel);
        fireEvent.click(panel);

        const content = screen.queryByText('This is a child element');
        expect(content).not.toBeInTheDocument();

    });

    it('Should display a given title', () => {
        render(
            <ExpandablePanel title="My Expandable Panel">
            </ExpandablePanel>
        );

        const title = screen.queryByText('My Expandable Panel');
        expect(title).toBeVisible();
    })
});