import { BaseEntity, BoundingBoxComponent, GameObject, SoundComponent, TransformComponent } from "@sparkengine";
import { EntityPropsPanel } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
import { WithMemoryRouter } from "../../hooks";
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

        it('Should keep repository prefix when opening scripting editor', () => {
            const entity = new GameObject();
            entity.addComponent(new BoundingBoxComponent());

            const openSpy = jest.spyOn(window, 'open').mockImplementation(
                () => ({ focus: jest.fn() } as unknown as Window)
            );

            window.history.pushState({}, '', '/SparkEngineWebEditor/');

            renderEntityPropsPanel(entity);
            fireEvent.click(screen.getByRole('button', { name: /BoundingBoxComponent/i }));
            fireEvent.click(screen.getByRole('button', { name: /Open Scripting/i }));

            expect(openSpy).toHaveBeenCalled();
            const targetUrl = openSpy.mock.calls[0][0] as string;
            expect(targetUrl.startsWith('/SparkEngineWebEditor/scripting/')).toBe(true);

            openSpy.mockRestore();
            window.history.pushState({}, '', '/');
        });

        it('Should not show open scripting in components without scriptable callbacks', () => {
            const entity = new BaseEntity();
            entity.addComponent(new TransformComponent());

            renderEntityPropsPanel(entity);

            fireEvent.click(screen.getByRole('button', { name: /TransformComponent/i }));

            expect(screen.queryByRole('button', { name: /Open Scripting/i })).not.toBeInTheDocument();
        });

        it('Should not render unavailable components such as SoundComponent', () => {
            const entity = new BaseEntity();
            entity.addComponent(new SoundComponent({ filePath: 'assets/test.mp3' }));

            renderEntityPropsPanel(entity);

            expect(screen.queryByRole('region', { name: 'SoundComponent' })).not.toBeInTheDocument();
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