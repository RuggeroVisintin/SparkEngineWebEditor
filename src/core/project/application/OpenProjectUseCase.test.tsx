import testProjectJson from "../../../__mocks__/assets/test-project.json";
import { describeClass } from "../../../test-utils/describeClass";
import { OpenProjectUseCase } from "./OpenProjectUseCase";
import { SceneRepository } from "../../scene";
import { ProjectRepository, Project } from "../domain";
import testSceneJson from '../../../__mocks__/assets/test-scene.json';
import { Scene } from "@sparkengine";
import { parseJsonString } from "../../common";

class MockProjectRepository implements ProjectRepository {
    read = jest.fn().mockResolvedValue(new Project(testProjectJson));
    save = jest.fn();
    update = jest.fn();
}

class MockSceneRepository implements SceneRepository {
    read = jest.fn().mockImplementation(async (): Promise<Scene> => {
        return new Promise((resolve) => {
            const scene = new Scene();
            scene.loadFromJson(parseJsonString(JSON.stringify(testSceneJson)));
            resolve(scene);
        });
    });
    save = jest.fn();
}

describeClass(OpenProjectUseCase, () => {
    it('Should load the project from the chosen filesystem directory', async () => {
        const result = await new OpenProjectUseCase(new MockProjectRepository(), new MockSceneRepository()).execute();

        expect(result).toBeInstanceOf(Project);

        result.scenes.forEach(scene => {
            expect(JSON.stringify(scene.toJson())).toEqual(JSON.stringify(parseJsonString(JSON.stringify(testSceneJson))))
        });
    });
})