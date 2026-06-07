import { Scene } from "@sparkengine";
import { FileSystemSceneRepository } from "../../scene"
import { Project } from "./Project"
import { parseJsonString, WeakRef } from "../../common";
import { createDirectoryHandleMock, setMockedFile } from "../../../__mocks__/fs-api.mock";
import testSceneJson from '../../../__mocks__/assets/test-scene.json';

describeClass(Project, () => {
    const sceneRepo = new FileSystemSceneRepository();

    describe('.constructor()', () => {
        it('should create a new instance of Project with the given props', () => {
            expect(new Project({
                name: 'test-project',
                scenes: ['scenes/test.scene.spark.json']
            })).toEqual({
                name: 'test-project',
                scenePaths: ['scenes/test.scene.spark.json'],
                scenes: [],
                scopeRef: expect.any(WeakRef)
            })
        })
    });

    describe('.fromProject()', () => {
        it('Should copy the source project scenes in the new project instance', () => {
            const sourceProject = new Project({
                name: 'test-project',
                scenes: ['scenes/test.scene.spark.json']
            });

            sourceProject.scenes = [new Scene()];
            const newProject = Project.fromProject(sourceProject);

            expect(newProject.scenes).toEqual(sourceProject.scenes);
        });

        it('Should override the scopeRef of the new project instance with the given one', () => {
            const sourceProject = new Project({
                name: 'test-project',
                scenes: ['scenes/test.scene.spark.json']
            });

            const newScopeRef = new WeakRef<FileSystemDirectoryHandle>(createDirectoryHandleMock() as unknown as FileSystemDirectoryHandle);

            const newProject = Project.fromProject(sourceProject, newScopeRef);

            expect(newProject.scopeRef).toEqual(newScopeRef);
        })
    });


    describe('.loadScenes()', () => {
        const jsonString = JSON.stringify(testSceneJson);

        beforeEach(() => {
            setMockedFile(jsonString);
        })

        it('Should load the scene files based on the given paths', async () => {
            const project = new Project({
                name: 'test-project',
                scenes: ['test.scene.spark.json'],
            }, new WeakRef<FileSystemDirectoryHandle>(createDirectoryHandleMock() as unknown as FileSystemDirectoryHandle));

            await project.loadScenes(sceneRepo);

            expect(JSON.stringify(project.scenes[0].toJson())).toEqual(JSON.stringify(parseJsonString(jsonString)));
        })

        it('Should load the scene files when they are located in a subdirectory', async () => {
            const project = new Project({
                name: 'test-project',
                scenes: ['scenes/test.scene.spark.json'],
            }, new WeakRef<FileSystemDirectoryHandle>(createDirectoryHandleMock() as unknown as FileSystemDirectoryHandle));

            await project.loadScenes(sceneRepo);

            expect(JSON.stringify(project.scenes[0].toJson())).toEqual(JSON.stringify(parseJsonString(jsonString)));
        })
    })

    describe('.toJson()', () => {
        it('Should return a Json representation of the project', () => {
            const projectJson = {
                name: 'test-project',
                scenes: ['scenes/test.scene.spark.json']
            };

            expect(new Project(projectJson).toJson()).toEqual(projectJson);
        });
    })

    describe('.addScene()', () => {
        it('Should add the scene to the list of scenes in the project', () => {
            const project = new Project({
                name: 'test-project',
                scenes: []
            });

            const newScene = new Scene();

            project.addScene(newScene);

            expect(project.scenes).toEqual([newScene]);
        });

        it('Should register the scene path in the list of scene paths for the project', () => {
            const project = new Project({
                name: 'test-project',
                scenes: []
            });

            const newScene = new Scene();

            project.addScene(newScene);

            expect(project.scenePaths).toEqual(['scenes/test-scene.spark.json']);
        });
    })
})