import { BaseEntity, BoundingBoxComponent, GameObject, TransformComponent, TriggerEntity } from "@sparkengine";
import { SerializableCallback } from "sparkengineweb";
import { EntityPropsPanel } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
import { WithMemoryRouter } from "../../hooks";
import { getWindowCurrentUrl } from "../../__mocks__/window.mock";
import { disableFeature, enableFeature } from "../../core/featureFlags";

const noOp = () => { };

const renderEntityPropsPanel = (entity: BaseEntity, options?: {
    onNavigate?: ({ history, location }: { history: any; location: any }) => null;
    onComponentUpdate?: (component: any) => void;
    onAddComponent?: () => void;
    onComponentRemove?: () => void;
}) => {
    const { onNavigate, onComponentUpdate, onAddComponent } = options || {};
    let { onComponentRemove } = options || {};

    if (!onComponentRemove) {
        onComponentRemove = noOp;
    }

    render(
        WithMemoryRouter(
            <EntityPropsPanel
                currentEntity={entity}
                onComponentUpdate={onComponentUpdate}
                onAddComponent={onAddComponent}
                onComponentRemove={onComponentRemove}
            />,
            onNavigate
        )
    );
}

describe('EntityPropsPanel', () => {
    describe('TriggerEntity', () => {
        it('Should show open scripting inside a component with scriptable callback', () => {
            const entity = new TriggerEntity();

            renderEntityPropsPanel(entity);

            fireEvent.click(screen.getByRole('button', { name: /BoundingBoxComponent/i }));

            const scriptingButton = screen.getByRole('button', { name: /Open Scripting/i });
            expect(scriptingButton).toBeInTheDocument();
        });

        it('Should open the scripting page on a blank tab when open scripting is clicked from a component', () => {
            const entity = new TriggerEntity();
            const callbackComponent = entity.components.find(component =>
                Object.entries(component).some(([_, value]) => value instanceof SerializableCallback)
            )!;

            const callbackPropertyName = Object.entries(callbackComponent)
                .find(([_, value]) => value instanceof SerializableCallback)?.[0]!;

            const onNavigate = jest.fn(() => null);

            renderEntityPropsPanel(entity, { onNavigate });

            fireEvent.click(screen.getByRole('button', { name: /BoundingBoxComponent/i }));
            fireEvent.click(screen.getByRole('button', { name: /Open Scripting/i }));

            expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({
                location: expect.objectContaining({ pathname: '/' }),
            }));

            expect(getWindowCurrentUrl('scripting')).toBe(
                `/scripting/${entity.uuid}/${callbackComponent.uuid}/${callbackPropertyName}`
            );
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

            renderEntityPropsPanel(entity);

            expect(screen.queryByRole('region', { name: 'TransformComponent' })).toBeVisible();
            expect(screen.queryByRole('region', { name: 'BoundingBoxComponent' })).toBeVisible();

        });

        it('Shjould notify changes in component properties', () => {
            entity.addComponent(new TransformComponent());

            const onComponentUpdate = jest.fn();

            renderEntityPropsPanel(entity, { onComponentUpdate });

            fireEvent.click(screen.getByRole('button', { name: /TransformComponent/i }));
            const positionInput = screen.getByTestId('EntityPropsPanel.Position.X.InputField');

            fireEvent.change(positionInput, { target: { value: 10 } });

            expect(onComponentUpdate).toHaveBeenCalled();
        });

        it('Should show the scripting prop when any component has a scriptable callback', () => {
            const entity = new GameObject();

            entity.addComponent(new BoundingBoxComponent());

            renderEntityPropsPanel(entity);

            fireEvent.click(screen.getByRole('button', { name: /BoundingBoxComponent/i }));

            const scriptingButton = screen.getByRole('button', { name: /Open Scripting/i });
            expect(scriptingButton).toBeInTheDocument();
        });

        it('Should not show open scripting in components without scriptable callbacks', () => {
            const entity = new BaseEntity();
            entity.addComponent(new TransformComponent());

            renderEntityPropsPanel(entity);

            fireEvent.click(screen.getByRole('button', { name: /TransformComponent/i }));

            expect(screen.queryByRole('button', { name: /Open Scripting/i })).not.toBeInTheDocument();
        });
    })

    describe('Add Component', () => {
        describe('Feature Flag ENABLED', () => {
            beforeAll(() => {
                enableFeature('ADD_COMPONENTS');
            })

            it('Should have an "Add component" button', () => {
                const entity = new GameObject();

                renderEntityPropsPanel(entity);

                const addComponentButton = screen.queryByRole('button', { name: 'Add Component' });
                expect(addComponentButton).toBeVisible();
            });

            it('Should invoke the "onAddComponent" callback', () => {
                const entity = new GameObject();
                const cb = jest.fn();

                renderEntityPropsPanel(entity, { onAddComponent: cb });
                const addComponentButton = screen.getByRole('button', { name: 'Add Component' });
                fireEvent.click(addComponentButton);

                expect(cb).toHaveBeenCalled();
            });

            it('Should have a delete button for each component', () => {
                const entity = new GameObject();
                entity.addComponent(new TransformComponent());

                renderEntityPropsPanel(entity);

                expect(screen.queryAllByRole('button', { name: 'X' })[0]).toBeVisible();
            });

            it('Should disable delete button when components are required in the entity', () => {
                const entity = new GameObject();

                renderEntityPropsPanel(entity);

                // GameObject has 3 required components: Transform, Shape, Material
                const deleteButtons = screen.queryAllByRole('button', { name: 'X' });

                // All 3 delete buttons should be disabled (required components)
                expect(deleteButtons).toHaveLength(3);
                deleteButtons.forEach(button => {
                    expect(button).toBeDisabled();
                });
            });

            it('Should enable delete button for non-required components', () => {
                const entity = new GameObject();
                entity.addComponent(new BoundingBoxComponent());

                renderEntityPropsPanel(entity);

                const deleteButtons = screen.queryAllByRole('button', { name: 'X' });

                // 4 buttons: Transform (disabled), Shape (disabled), Material (disabled), BoundingBox (enabled)
                expect(deleteButtons).toHaveLength(4);

                // BoundingBox should be the last one and should be enabled (not required for GameObject)
                expect(deleteButtons[3]).not.toBeDisabled();
            });

            it('Should invoke the "onComponentRemove" callback when clicking the remove button', () => {
                const entity = new GameObject();
                entity.addComponent(new BoundingBoxComponent());

                const cb = jest.fn();

                renderEntityPropsPanel(entity, { onComponentRemove: cb });

                const deleteButtons = screen.queryAllByRole('button', { name: 'X' });
                fireEvent.click(deleteButtons[3]);

                expect(cb).toHaveBeenCalledWith(entity.components[3].uuid);
            });
        });

        describe('Feature Flag DISABLED', () => {
            beforeAll(() => {
                disableFeature('ADD_COMPONENTS');
            });

            it('Should not have an "Add component" button', () => {
                const entity = new GameObject();

                renderEntityPropsPanel(entity);

                const addComponentButton = screen.queryByRole('button', { name: 'Add Component' });
                expect(addComponentButton).not.toBeInTheDocument();
            });

            it('Should not show a component delete button', () => {
                const entity = new GameObject();
                entity.addComponent(new TransformComponent());

                renderEntityPropsPanel(entity);

                expect(screen.queryByRole('button', { name: 'X' })).not.toBeInTheDocument();
            });
        });
    });
})