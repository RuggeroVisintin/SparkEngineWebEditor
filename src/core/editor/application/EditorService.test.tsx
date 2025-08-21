import { CanvasDevice, DOMImageLoader, GameObject, IEntity, Renderer, RenderSystem, Scene, SerializableCallback, TransformComponent, TriggerEntity, Vec2 } from "sparkengineweb";
import { EditorService } from "./EditorService";
import { FileSystemImageRepository } from "../../assets";
import { ProjectRepository } from "../../project/domain";
import { Project } from "../../project/domain";
import { SceneRepositoryTestDouble } from "../../../__mocks__/core/scene/SceneRepositoryTestDouble";
import { Optional, WeakRef } from "../../common";
import { ObjectPickingService } from "../domain/ObjectPickingService";
import { ColorObjectPicker } from "../infrastructure";
import { ReactStateRepository } from "../../common/adapters/ReactStateRepository";
import { StateRepository } from "../../common/ports/StateRepository";
import { ContextualUiService } from "../domain/ContextualUiService";
import { EditorState } from "./EditorState";
import { InMemoryEventBusDouble } from "../../../__mocks__/core/InMemoryEventBusDouble";
import { ScriptingEditorReady, ScriptSaved } from "../../scripting/domain/events";
import { OpenScriptingEditorCommand } from "../../scripting/domain/commands";

class ProjectRepositoryTestDouble implements ProjectRepository {
    public read(): Promise<Project> {
        return Promise.resolve(this.project as Project);
    }

    save = jest.fn();
    update = jest.fn();

    public project?: Project;
}

class ObjectPickingServiceTestDouble extends ObjectPickingService {
    public _result?: IEntity;

    public get selectedEntity(): Optional<IEntity> {
        return this._result;
    }

    handleMouseClick = jest.fn();
    getRenderSystem = jest.fn(() => new RenderSystem(new Renderer(new CanvasDevice(), { width: 0, height: 0 }, new CanvasRenderingContext2D()), new DOMImageLoader()))
}

class ContextualUiServiceTestDouble extends ContextualUiService {
    public currentScene?: Scene;
    public lastFocusedEntity?: IEntity;
    public currentSpawnPosition?: Vec2;

    public start(contextualUiScene: Scene): void {
        this.currentScene = contextualUiScene;
    }

    public focusOnEntity(entity: IEntity): void {
        this.lastFocusedEntity = entity;
    }

    public loseFocus(): void {
        this.lastFocusedEntity = undefined;
    }

    public moveSpawnOrigin(position: Vec2): void {
        this.currentSpawnPosition = position;
    }
}

const sceneToLoad = new Scene();

describe('EditorService', () => {
    let editorService: EditorService;
    let imageLoader: FileSystemImageRepository;
    let context: CanvasRenderingContext2D;
    let projectRepositoryDouble: ProjectRepositoryTestDouble;
    let sceneRepository: SceneRepositoryTestDouble;
    let objectPicking: ObjectPickingServiceTestDouble;
    let appState: StateRepository<EditorState>;
    let contextualUiServiceDouble: ContextualUiServiceTestDouble;
    let eventBus: InMemoryEventBusDouble;

    beforeEach(() => {
        projectRepositoryDouble = new ProjectRepositoryTestDouble();
        sceneRepository = new SceneRepositoryTestDouble();
        context = new CanvasRenderingContext2D();
        imageLoader = new FileSystemImageRepository();
        objectPicking = new ObjectPickingServiceTestDouble(new ColorObjectPicker(() => new Renderer(new CanvasDevice(), { width: 0, height: 0 }, context), { width: 0, height: 0 }, imageLoader));
        appState = new ReactStateRepository<EditorState>();
        contextualUiServiceDouble = new ContextualUiServiceTestDouble();
        eventBus = new InMemoryEventBusDouble();

        editorService = new EditorService(
            imageLoader,
            imageLoader,
            projectRepositoryDouble,
            sceneRepository,
            objectPicking,
            appState,
            contextualUiServiceDouble,
            eventBus
        );

        sceneRepository.save(sceneToLoad, { path: 'test-scene.spark.json', accessScope: new WeakRef<null>(null) });
    });

    describe('.start()', () => {
        it('Should create a new engine with the given configuration', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(editorService.engine?.renderer.resolution).toEqual(resolution);
            expect(editorService.engine?.imageLoader).toEqual(imageLoader);
        });

        it('Should create a new scene', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(editorService.currentScene).toBeDefined();
        });

        it('Should draw the current scene', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(editorService.currentScene?.shouldDraw).toBe(true);
        });

        it('Should create a new editor scene', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(editorService.editorScene).toBeDefined();
        });

        it('Should draw the editor scene', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(editorService.editorScene?.shouldDraw).toBe(true);
        });

        it('Should create a new project with a default game scene', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(editorService.project).toBeDefined();
            expect(editorService.project?.scenes).toContain(editorService.currentScene);
        });

        it('Should start the contextual ui service with the editor scene', () => {
            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            expect(contextualUiServiceDouble.currentScene?.uuid).toEqual(editorService.editorScene?.uuid);
        })

        // Cannot test this yet as cannot retrieve the default wireframe thickness of the engine renderer once set
        it.todo('Should set the default wireframe thickness of the engine renderer');

        // No way to tell if engine is running
        it.todo('Should start the engine');
    });

    describe('.openProject()', () => {
        it('Should load a new project from the given repository', async () => {
            const resolution = { width: 800, height: 600 };
            projectRepositoryDouble.project = new Project({
                name: 'loaded-project',
                scenes: ['test-scene.spark.json']
            });

            editorService.start(context, resolution);
            await editorService.openProject();

            expect(editorService.project).toEqual(projectRepositoryDouble.project);
            expect(editorService.project?.scenes).toEqual([sceneToLoad])
        });

    });

    describe('.handleMouseClick()', () => {
        describe('left mouse button', () => {
            it('Should focus on the entity at the given position if any and left mouse button', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                objectPicking._result = gameObject;

                editorService.start(context, resolution);
                editorService.handleMouseClick({
                    targetX: 100,
                    targetY: 100,
                    modifiers: {},
                    button: 0
                });

                expect(editorService.currentEntity).toEqual(gameObject);
                expect(contextualUiServiceDouble.lastFocusedEntity).toEqual(gameObject);
            });

            it('Should remove focus from the current entity if no entity at the given position', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                objectPicking._result = undefined;

                editorService.start(context, resolution);
                editorService.selectEntity(gameObject);
                editorService.handleMouseClick({
                    targetX: 100,
                    targetY: 100,
                    modifiers: {},
                    button: 0
                });

                expect(editorService.currentEntity).not.toBeDefined();
                expect(contextualUiServiceDouble.lastFocusedEntity).toBeUndefined();
            });

            it('Should not focus on the entity when not left mouse button', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                objectPicking._result = gameObject;

                editorService.start(context, resolution);
                editorService.handleMouseClick({
                    targetX: 100,
                    targetY: 100,
                    modifiers: {},
                    button: 1
                });

                expect(editorService.currentEntity).not.toBeDefined();
                expect(contextualUiServiceDouble.lastFocusedEntity).toBeUndefined();
            });

            it('Should not focus on the entity when spacebar modifier is pressed', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                objectPicking._result = gameObject;

                editorService.start(context, resolution);
                editorService.handleMouseClick({
                    targetX: 100,
                    targetY: 100,
                    button: 0,
                    modifiers: { space: true }
                });

                expect(editorService.currentEntity).not.toBeDefined();
                expect(contextualUiServiceDouble.lastFocusedEntity).toBeUndefined();
            });
        });

        describe('right mouse button', () => {
            it('Should set the origin pivot position to the given coordinates', () => {
                const resolution = { width: 800, height: 600 };

                editorService.start(context, resolution);
                editorService.handleMouseClick({
                    targetX: 100,
                    targetY: 200,
                    modifiers: {},
                    button: 2
                });

                expect(contextualUiServiceDouble.currentSpawnPosition).toEqual(new Vec2(100, 200).toScreenSpace(resolution));
            });

            it('Should account for the editor camera position when setting the origin pivot position', () => {
                const resolution = { width: 800, height: 600 };
                editorService.start(context, resolution);
                editorService.editorCamera.getComponent<TransformComponent>('TransformComponent')!.position = new Vec2(50, 50);

                editorService.handleMouseClick({
                    targetX: 100,
                    targetY: 200,
                    modifiers: {},
                    button: 2
                });

                expect(contextualUiServiceDouble.currentSpawnPosition).toEqual(new Vec2(150, 250).toScreenSpace(resolution));
            });
        });
    });

    describe('.handleMouseDrag()', () => {
        describe('on left mouse button pressed', () => {
            it('Should update the position of the current entity', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                gameObject.transform.position = new Vec2(50, 50);

                editorService.start(context, resolution);
                editorService.selectEntity(gameObject);

                editorService.handleMouseDrag({
                    targetX: 100,
                    targetY: 100,
                    button: 0,
                    modifiers: {},
                    deltaX: 20,
                    deltaY: 20
                });

                expect(gameObject.transform.position).toEqual(new Vec2(70, 70));
            });

            it('Should not update the position when not using left mouse button', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                gameObject.transform.position = new Vec2(50, 50);

                editorService.start(context, resolution);
                editorService.selectEntity(gameObject);

                editorService.handleMouseDrag({
                    targetX: 100,
                    targetY: 100,
                    button: 1,
                    modifiers: {},
                    deltaX: 20,
                    deltaY: 20
                });

                expect(gameObject.transform.position).toEqual(new Vec2(50, 50));
            });
        });

        describe('on left mouse and spacebar modifier pressed', () => {
            it('Should update the position of the current camera based on the mouse drag', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                gameObject.transform.position = new Vec2(50, 50);

                editorService.start(context, resolution);
                editorService.selectEntity(gameObject);

                editorService.handleMouseDrag({
                    targetX: 100,
                    targetY: 100,
                    button: 0,
                    modifiers: { space: true },
                    deltaX: 20,
                    deltaY: 20
                });

                expect(editorService.editorCamera.getComponent<TransformComponent>('TransformComponent')?.position).toEqual(new Vec2(-20, -20));
            });

            it('Should not update the position of the current entity', () => {
                const resolution = { width: 800, height: 600 };
                const gameObject = new GameObject();
                gameObject.transform.position = new Vec2(50, 50);

                editorService.start(context, resolution);
                editorService.selectEntity(gameObject);

                editorService.handleMouseDrag({
                    targetX: 100,
                    targetY: 100,
                    button: 0,
                    modifiers: { space: true },
                    deltaX: 20,
                    deltaY: 20
                });

                expect(gameObject.transform.position).toEqual(new Vec2(50, 50));
            });
        })
    });

    describe('.handleMouseWheel()', () => {
        it('Should zoom the editor camera by the given factor', () => {
            const resolution = { width: 800, height: 600 };
            editorService.start(context, resolution);


            editorService.handleMouseWheel({
                scrollX: 0,
                scrollY: 100
            });

            expect(editorService.editorCamera.camera.transform.scale).toEqual(2);
        });
    });

    describe('.selectEntity()', () => {
        it('Should set the given entity as the current entity', () => {
            const entity = { uuid: 'test-uuid' } as IEntity;

            editorService.selectEntity(entity);

            expect(editorService.currentEntity).toEqual(entity);
        });

        it('Should draw the editor scene if the engine is already set', () => {
            const resolution = { width: 800, height: 600 };
            editorService.start(context, resolution);

            const entity = new GameObject();
            editorService.selectEntity(entity);

            expect(editorService.editorScene?.shouldDraw).toBe(true);
        })

        it('Should trigger an update on the given subscriber with the current entity', () => {
            const subscriber = jest.fn();
            appState.subscribe(subscriber)

            const resolution = { width: 800, height: 600 };

            editorService.start(context, resolution);

            const entity = new GameObject();
            editorService.selectEntity(entity);

            expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
                currentEntity: entity
            }));
        });

        it.todo('Should match the editor entities to the new entity');
    });

    describe('.addNewEntity()', () => {
        it('Should register the entity into the current scene', () => {
            const resolution = { width: 800, height: 600 };
            const entity = new GameObject();

            editorService.start(context, resolution);
            editorService.addEntity(entity);

            expect(editorService.currentScene?.entities).toContain(entity);
        });

        it('Should focus on the new entity', () => {
            const resolution = { width: 800, height: 600 };
            const entity = new GameObject();

            editorService.start(context, resolution);
            editorService.addEntity(entity);

            expect(editorService.currentEntity).toEqual(entity);
        });

        it('Should trigger an update on the given subscriber with the new entity', () => {
            const subscriber = jest.fn();
            appState.subscribe(subscriber);

            const resolution = { width: 800, height: 600 };
            const entity = new GameObject();

            editorService.start(context, resolution);
            editorService.addEntity(entity);

            expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
                currentEntity: entity,
                entities: expect.arrayContaining([entity]),
            }));
        });
    });

    describe('.removeEntity()', () => {
        it('Should remove the entity from the current scene', () => {
            const resolution = { width: 800, height: 600 };
            const entity = new GameObject();

            editorService.start(context, resolution);
            editorService.addEntity(entity);
            editorService.removeEntity(entity.uuid);

            expect(editorService.currentScene?.entities).not.toContain(entity);
        });

        it('Should deselect the currentEntity', () => {
            const resolution = { width: 800, height: 600 };
            const entity = new GameObject();

            editorService.start(context, resolution);
            editorService.addEntity(entity);
            editorService.removeEntity(entity.uuid);

            expect(editorService.currentEntity).not.toBeDefined();
        });

        it('Should trigger an update on the given subscriber with the new entity', () => {
            const subscriber = jest.fn();
            appState.subscribe(subscriber);

            const resolution = { width: 800, height: 600 };
            const entity = new GameObject();

            editorService.start(context, resolution);
            editorService.addEntity(entity);
            editorService.removeEntity(entity.uuid);

            expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
                currentEntity: undefined,
                entities: expect.not.arrayContaining([entity]),
            }));
        });
    })

    describe('.updateCurrentEntitySize()', () => {
        it('Should update the size of the current entity', () => {
            const entity = new GameObject();

            editorService.selectEntity(entity);
            editorService.updateCurrentEntitySize({ width: 200, height: 200 });

            expect((editorService.currentEntity as GameObject)?.transform.size).toEqual({ width: 200, height: 200 });
        });

        it('Should trigger an update on the given subscriber with the new size', () => {
            const subscriber = jest.fn();
            appState.subscribe(subscriber);

            const entity = new GameObject();

            editorService.selectEntity(entity);
            editorService.updateCurrentEntitySize({ width: 200, height: 200 });

            expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
                currentEntity: expect.objectContaining({
                    transform: expect.objectContaining({
                        size: { width: 200, height: 200 }
                    })
                })
            }));
        });

        it.todo('Should match the editor entities to the new size');
    });

    describe('.updateCurrentEntityPosition()', () => {
        it('Should update the position of the current entity', () => {
            const entity = new GameObject();

            editorService.selectEntity(entity);
            editorService.updateCurrentEntityPosition(new Vec2(200, 200));

            expect((editorService.currentEntity as GameObject)?.transform.position).toEqual({ x: 200, y: 200 });
        });

        it('Should trigger an update on the given subscriber with the new position', () => {
            const subscriber = jest.fn();
            appState.subscribe(subscriber);

            const entity = new GameObject();

            editorService.selectEntity(entity);
            editorService.updateCurrentEntityPosition(new Vec2(200, 200));

            expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
                currentEntity: expect.objectContaining({
                    transform: expect.objectContaining({
                        position: { x: 200, y: 200 }
                    })
                })
            }));
        })

        it.todo('Should match the editor entities to the new position');
    });

    describe('on ScriptingEditorReady event', () => {
        it('Should emit an OpenScriptingEditor command w/ the current entity script set', () => {
            const entity = new TriggerEntity();
            entity.onTriggerCB = SerializableCallback.fromFunction(() => { });

            const cb = jest.fn();
            eventBus.subscribe<OpenScriptingEditorCommand>('OpenScriptingEditorCommand', cb);

            editorService.selectEntity(entity);

            eventBus.publish<ScriptingEditorReady>('ScriptingEditorReady', {
                entityUuid: entity.uuid
            });

            expect(cb).toHaveBeenCalledWith({
                currentScript: `${entity.onTriggerCB.toString()}`,
                entityUuid: entity.uuid
            });
        });

        it('Should just skip if the currentEntity is not a TriggerEntity', () => {
            const entity = new GameObject();
            const cb = jest.fn();
            eventBus.subscribe<OpenScriptingEditorCommand>('OpenScriptingEditorCommand', cb);

            editorService.selectEntity(entity);

            eventBus.publish<ScriptingEditorReady>('ScriptingEditorReady', {
                entityUuid: entity.uuid
            });

            expect(cb).not.toHaveBeenCalled();
        });

        it('Should skip if currentEntity is not set', () => {
            const cb = jest.fn();
            eventBus.subscribe<OpenScriptingEditorCommand>('OpenScriptingEditorCommand', cb);

            eventBus.publish<ScriptingEditorReady>('ScriptingEditorReady', {
                entityUuid: 'test-entity-uuid'
            });

            expect(cb).not.toHaveBeenCalled();
        });

        it('Should skip if the currentEntity id does not match event entityUuid', () => {
            const entity = new TriggerEntity();
            const cb = jest.fn();
            eventBus.subscribe<OpenScriptingEditorCommand>('OpenScriptingEditorCommand', cb);

            editorService.selectEntity(entity);

            eventBus.publish<ScriptingEditorReady>('ScriptingEditorReady', {
                entityUuid: 'test-entity-uuid'
            });

            expect(cb).not.toHaveBeenCalled();
        });

        it('Should sent through a default script if the script is not defined', () => {
            const entity = new TriggerEntity();
            const cb = jest.fn();
            eventBus.subscribe<OpenScriptingEditorCommand>('OpenScriptingEditorCommand', cb);

            editorService.selectEntity(entity);

            eventBus.publish<ScriptingEditorReady>('ScriptingEditorReady', {
                entityUuid: entity.uuid
            });

            expect(cb).toHaveBeenCalledWith({
                currentScript: 'function () {\n    \n}',
                entityUuid: entity.uuid
            });
        });
    });

    describe('on ScriptSaved event', () => {
        it('Should update the given entity script', async () => {
            const entity = new TriggerEntity();
            entity.onTriggerCB = SerializableCallback.fromFunction(function () {
            });

            editorService.start(context, { width: 800, height: 600 });
            editorService.currentScene?.registerEntity(entity);

            const script = 'function () {\n    return 1;\n}';

            eventBus.publish<ScriptSaved>('ScriptSaved', {
                entityUuid: entity.uuid,
                script
            });


            expect(entity.onTriggerCB.call(this)).toEqual(1);
        })
    });
});