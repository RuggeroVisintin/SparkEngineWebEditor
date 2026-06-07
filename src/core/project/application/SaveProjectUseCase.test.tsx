import { FakeBitmap } from "../../../__mocks__/bitmap.mock";
import { describeClass } from "../../../test-utils/describeClass";
import { WeakRef } from "../../common";
import { SceneRepository } from "../../scene";
import { Project, ProjectRepository } from "../domain";
import { SaveProjectUseCase } from "./SaveProjectUseCase";
import { GameObject, ImageAsset, Scene } from "@sparkengine";

class MockProjectReposioty implements ProjectRepository {
    read = jest.fn();
    save = jest.fn();
    update = jest.fn();
}

class MockSceneRepository implements SceneRepository {
    read = jest.fn(() => {
        return Promise.resolve(new Scene());
    });
    save = jest.fn();
}

class MockImageRepository {
    read = jest.fn();
    save = jest.fn();
}

describeClass(SaveProjectUseCase, () => {
    let projectRepository: MockProjectReposioty;
    let sceneRepository: MockSceneRepository;
    let imageRepository: MockImageRepository;

    let saveProjectUseCase: SaveProjectUseCase;

    beforeEach(() => {
        projectRepository = new MockProjectReposioty();
        sceneRepository = new MockSceneRepository();
        imageRepository = new MockImageRepository();

        saveProjectUseCase = new SaveProjectUseCase(projectRepository, sceneRepository, imageRepository);
    });

    it('Should save the project in the given filesystem directory', async () => {
        const project = new Project({
            name: 'Test Project',
            scenes: ['scenes/test-scene.json']
        }, new WeakRef<string>('path/to/project'))

        await saveProjectUseCase.execute(project);

        expect(projectRepository.update).toHaveBeenCalledWith(project);
    });

    it('Should save the project\'s scenes in the the given filesystem directory', async () => {
        const weakRef = new WeakRef<string>('path/to/project')

        const project = new Project({
            name: 'Test Project',
            scenes: ['scenes/test-scene.json']
        }, weakRef);

        await project.loadScenes(sceneRepository);
        await saveProjectUseCase.execute(project);

        expect(sceneRepository.save).toHaveBeenCalledWith(project.scenes[0], {
            accessScope: weakRef,
            path: 'scenes/test-scene.json'
        });
    });

    it('Should save the project before saving the scenes if the project was not loaded from a folder yet', async () => {
        projectRepository.save.mockImplementationOnce((project: Project) => {
            return new Promise<Project>((resolve) => {
                resolve(new Project(project.toJson(), new WeakRef('path/to/project')))
            });
        });

        const project = new Project({
            name: 'Test Project',
            scenes: ['scenes/test-scene.json']
        }, new WeakRef())

        const newProject = await saveProjectUseCase.execute(project) as Project;
        expect(newProject.scopeRef.get()).toBe('path/to/project');
    });

    it('Should save the project\'s assets in the "assets" directory when the project already exists', async () => {
        const project = new Project({
            name: 'Test Project',
            scenes: []
        }, new WeakRef<string>('path/to/project'))

        const scene = new Scene();
        const gameObject = new GameObject({});

        gameObject.material.diffuseTexturePath = 'assets/test-1.png';
        gameObject.material.diffuseTexture = new ImageAsset(new FakeBitmap(), 'png');

        scene.registerEntity(gameObject);
        project.addScene(scene);

        await saveProjectUseCase.execute(project);

        expect(imageRepository.save).toHaveBeenCalledWith(gameObject.material.diffuseTexture, { path: 'assets/test-1.png', accessScope: project.scopeRef });
    });

    it('Should save the project\'s assets in the "assets" directory when the project was not loaded from a folder yet', async () => {
        const newProjectRef = new WeakRef<string>('path/to/project');

        projectRepository.save.mockImplementationOnce((project: Project) => {
            return new Promise<Project>((resolve) => {
                resolve(Project.fromProject(project, newProjectRef));
            });
        });

        const project = new Project({
            name: 'Test Project',
            scenes: []
        }, new WeakRef())

        const scene = new Scene();
        const gameObject = new GameObject({});

        gameObject.material.diffuseTexturePath = 'assets/test-1.png';
        gameObject.material.diffuseTexture = new ImageAsset(new FakeBitmap(), 'png');

        scene.registerEntity(gameObject);
        project.addScene(scene);

        await saveProjectUseCase.execute(project);

        expect(imageRepository.save).toHaveBeenCalledWith(gameObject.material.diffuseTexture, { path: 'assets/test-1.png', accessScope: newProjectRef });
    })
})