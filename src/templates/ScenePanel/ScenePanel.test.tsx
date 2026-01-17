import { GameObject, StaticObject } from "@sparkengine"
import { ScenePanel } from "."
import { fireEvent, render, screen } from '@testing-library/react';

describe('ScenePanel', () => {
    it('Should render the given entities', () => {
        const entityList = [
            new GameObject(),
            new StaticObject(),
            new GameObject()
        ]

        render(<ScenePanel entities={entityList} onRemoveEntity={() => { }} onFocusEntity={() => { }}></ScenePanel>)
        expect(screen.getAllByTestId(`ScenePanel.EntityEntry`, { exact: false }).length).toBe(3);
    });

    it('Should invoke the onRemoveEntity callback when the entity remove button is clicked', () => {
        const entityList = [
            new GameObject(),
            new StaticObject(),
            new GameObject()
        ]

        const cb = jest.fn();
        render(<ScenePanel entities={entityList} onRemoveEntity={cb} onFocusEntity={() => { }}></ScenePanel>);

        fireEvent.click(screen.getByTestId(`RemoveEntityButton.${entityList[0].uuid}`));
        expect(cb).toHaveBeenCalledWith(entityList[0]);
    });

    it('Should invoke the onEntityFocused callback when the entity item is clicked', () => {
        const entityList = [
            new GameObject(),
            new StaticObject(),
            new GameObject()
        ]

        const cb = jest.fn();
        render(<ScenePanel entities={entityList} onRemoveEntity={() => { }} onFocusEntity={cb}></ScenePanel>);

        fireEvent.click(screen.getByTestId(`ScenePanel.EntityEntry.${entityList[1].uuid}`));
        expect(cb).toHaveBeenCalledWith(entityList[1]);
    })
})