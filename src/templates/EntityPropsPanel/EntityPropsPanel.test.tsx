import { GameObject, TriggerEntity } from "@sparkengine";
import { EntityPropsPanel } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
import { WithMemoryRouter } from "../../hooks";
import { getWindowCurrentUrl } from "../../__mocks__/window.mock";
import { disableFeature, enableFeature } from "../../core/featureFlags";

describe('EntityPropsPanel', () => {
    describe('TriggerEntity', () => {
        it('Should show the scripting prop', () => {
            const entity = new TriggerEntity();

            render(
                WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
            );
            fireEvent.click(screen.getByText('Scripting'));

            const scriptingPanel = screen.getByTestId('EntityPropsPanel.TriggerEntity.ScriptingProp');
            expect(scriptingPanel).toBeInTheDocument();
        });

        it('Should open the scripting panel on a blank tab when the link is clicked', () => {
            const entity = new TriggerEntity();

            const onNavigate = jest.fn();

            render(
                WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />, onNavigate)
            );
            fireEvent.click(screen.getByText('Scripting'));

            fireEvent.click(screen.getByTestId('EntityPropsPanel.TriggerEntity.ScriptingLink'));

            expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({
                location: expect.objectContaining({ pathname: '/' }),
            }));

            expect(getWindowCurrentUrl('scripting')).toBe(`/scripting/${entity.uuid}`);
        });
    });

    describe('Components', () => {
        let entity: BaseEntity;

        beforeEach(() => {
            entity = new BaseEntity();
        });

        it('Should render all the components available in the entity', () => {
            const entity = new BaseEntity();

            entity.addComponent(new TransformComponent());
            entity.addComponent(new BoundingBoxComponent());

            render(
                WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
            );

            expect(screen.queryByRole('region', { name: 'TransformComponent' })).toBeVisible();
            expect(screen.queryByRole('region', { name: 'BoundingBoxComponent' })).toBeVisible();

        });

        it('Shjould notify changes in component properties', () => {
            entity.addComponent(new TransformComponent());

            const onComponentUpdate = jest.fn();

            render(
                WithMemoryRouter(<EntityPropsPanel currentEntity={entity} onComponentUpdate={onComponentUpdate} />)
            );

            fireEvent.click(screen.getByRole('button', { name: /TransformComponent/i }));
            const positionInput = screen.getByTestId('EntityPropsPanel.Position.X.InputField');

            fireEvent.change(positionInput, { target: { value: 10 } });

            expect(onComponentUpdate).toHaveBeenCalled();
        });
    })

    describe('Add Component', () => {
        describe('Feature Flag ENABLED', () => {
            beforeAll(() => {
                enableFeature('ADD_COMPONENTS');
            })

            it('Should have an "Add component" button', () => {
                const entity = new GameObject();

                render(
                    WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
                );

                const addComponentButton = screen.queryByRole('button', { name: 'Add Component' });
                expect(addComponentButton).toBeVisible();
            });

            it('Should invoke the "onAddComponent" callback', () => {
                const entity = new GameObject();
                const cb = jest.fn();

                render(
                    WithMemoryRouter(<EntityPropsPanel currentEntity={entity} onAddComponent={cb} />)
                );
                const addComponentButton = screen.getByRole('button', { name: 'Add Component' });
                fireEvent.click(addComponentButton);

                expect(cb).toHaveBeenCalled();
            });
        });

        describe('Feature Flag DISABLED', () => {
            beforeAll(() => {
                disableFeature('ADD_COMPONENTS');
            });

            it('Should not have an "Add component" button', () => {
                const entity = new GameObject();

                render(
                    WithMemoryRouter(<EntityPropsPanel currentEntity={entity} />)
                );

                const addComponentButton = screen.queryByRole('button', { name: 'Add Component' });
                expect(addComponentButton).not.toBeInTheDocument();
            });
        });
    });
})