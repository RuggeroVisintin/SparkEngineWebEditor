import { Scene } from "@sparkengine";
import { describeClass } from "../../../test-utils/describeClass";
import { LoadSceneUseCase } from "./LoadSceneUseCase";
import testSceneJson from '../../../__mocks__/assets/test-scene.json';
import { SceneRepository } from "../domain";

class MockSceneRepository implements SceneRepository {
    read = jest.fn().mockImplementation(() => {
        const result = new Scene();
        result.loadFromJson(testSceneJson);

        return result;
    });
    save = jest.fn();
}

describeClass(LoadSceneUseCase, () => {
    it('Should return the loaded scene', async () => {
        const loadedScene = await new LoadSceneUseCase(new MockSceneRepository())
            .execute();

        const groundTruthScene = new Scene();
        groundTruthScene.loadFromJson(testSceneJson);

        expect(groundTruthScene.toJson()).toEqual(loadedScene.toJson());
    })
})