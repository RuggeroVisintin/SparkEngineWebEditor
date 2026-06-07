import { FileSystemSceneRepository } from "./FileSystemSceneRepository";
import testSceneJson from '../../../../__mocks__/assets/test-scene.json';
import { createDirectoryHandleMock, FileSystemWritableFileStreamMock, setMockedFile } from "../../../../__mocks__/fs-api.mock";
import { describeClass } from "../../../../test-utils/describeClass";
import { parseJsonString, WeakRef } from "../../../common";
import { Scene } from "sparkengineweb";

describeClass(FileSystemSceneRepository, () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('.read()', () => {
        it('Should use FileSystem Web APIs to prompt the user to pick a scene file', async () => {
            const stringifiedJson = JSON.stringify(testSceneJson);
            setMockedFile(stringifiedJson);

            const expectedScene = new Scene();
            expectedScene.loadFromJson(parseJsonString(stringifiedJson));

            const sceneRepo = new FileSystemSceneRepository();
            expect(JSON.stringify((await sceneRepo.read()).toJson())).toEqual(JSON.stringify(expectedScene.toJson()));
        });

        it('Should use FileSystem web APIs to read a file from the given folder scope withouth prompting the user when valid scopeRef is provided', async () => {
            const stringifiedJson = JSON.stringify(testSceneJson);
            setMockedFile(stringifiedJson);

            const expectedScene = new Scene();
            expectedScene.loadFromJson(parseJsonString(stringifiedJson));

            const sceneRepo = new FileSystemSceneRepository();
            const result = await sceneRepo.read({
                accessScope: new WeakRef<FileSystemDirectoryHandle>(createDirectoryHandleMock() as unknown as FileSystemDirectoryHandle),
                path: 'test-scene.json'
            })

            expect(global.showOpenFilePicker).not.toHaveBeenCalled();
            expect(JSON.stringify(result.toJson())).toEqual(JSON.stringify(expectedScene.toJson()));
        });
    });

    describe('.save()', () => {
        it('Should use FileSystem web APIs to save a scene file at given filePath', async () => {
            const stringifiedScene = JSON.stringify(testSceneJson);
            const writableSpy = jest.spyOn(FileSystemWritableFileStreamMock, 'write');

            const sceneRepo = new FileSystemSceneRepository();
            const testScene = new Scene();

            testScene.loadFromJson(parseJsonString(stringifiedScene));

            await sceneRepo.save(testScene);

            expect(writableSpy).toHaveBeenCalledWith(stringifiedScene);
        });

        it('Shouls use FileSystem web APIs to save a scene file at the specified location when provided', async () => {
            const stringifiedScene = JSON.stringify(testSceneJson);
            const writableSpy = jest.spyOn(FileSystemWritableFileStreamMock, 'write');

            const testScene = new Scene();
            testScene.loadFromJson(parseJsonString(stringifiedScene));

            const sceneRepo = new FileSystemSceneRepository();
            await sceneRepo.save(testScene, {
                accessScope: new WeakRef<FileSystemDirectoryHandle>(createDirectoryHandleMock() as unknown as FileSystemDirectoryHandle),
                path: 'test-scene.json'
            })

            expect(global.showSaveFilePicker).not.toHaveBeenCalled();
            expect(writableSpy).toHaveBeenCalledWith(stringifiedScene);
        });
    });
});