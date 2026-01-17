import { render, screen, fireEvent } from '@testing-library/react';
import { EntityFactoryPanel } from '.';
import { GameObject, IEntity, StaticObject, TriggerEntity, Vec2 } from '@sparkengine';

describe('EntityFactoryPanel', () => {
    describe("Add new entity", () => {
        it.each([[
            'GameObject',
            GameObject
        ], [
            'StaticObject',
            StaticObject
        ], [
            'TriggerObject',
            TriggerEntity
        ]])('Should create a new %s when triggered', (entityType, entityCtr) => {
            const cb = jest.fn();

            render(<EntityFactoryPanel onAddEntity={(entity: IEntity) => cb(entity)} />);

            fireEvent.click(screen.getByTestId(`Add${entityType}Button`));

            expect(cb).toHaveBeenCalledWith(expect.any(entityCtr));
        })

        it.each(
            ['GameObject', 'StaticObject', 'TriggerObject']
        )('Should create a new %s in a given spawn position', (entityType) => {
            const cb = jest.fn();
            const spawnPoint = new Vec2(10, 5);

            render(<EntityFactoryPanel onAddEntity={(entity: IEntity) => cb(entity)} spawnPoint={spawnPoint} />);

            fireEvent.click(screen.getByTestId(`Add${entityType}Button`));

            expect(cb).toHaveBeenCalledWith(expect.objectContaining({
                transform: expect.objectContaining({
                    position: expect.objectContaining(spawnPoint)
                })
            }));
        })
    })
})
