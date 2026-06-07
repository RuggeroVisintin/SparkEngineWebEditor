import { Scene } from "@sparkengine";
import testSceneJson from '../../../__mocks__/assets/test-scene.json';
import { SceneRepository } from "../domain";
import { SaveSceneUseCase } from "./SaveSceneUseCase";

class MockSceneRepository implements SceneRepository {
    read = jest.fn().mockResolvedValue(testSceneJson);
    save = jest.fn();
}

describeClass(SaveSceneUseCase, () => {
    it('Should save the given scene json props in the scene repository', async () => {
        const sceneToSave = new Scene();
        const mockRepo = new MockSceneRepository();

        await new SaveSceneUseCase(mockRepo)
            .execute(sceneToSave);

        expect(mockRepo.save).toHaveBeenCalledWith(sceneToSave);
    })
})