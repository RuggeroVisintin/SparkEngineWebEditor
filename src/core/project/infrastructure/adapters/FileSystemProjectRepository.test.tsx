import { createDirectoryHandleMock, FileSystemWritableFileStreamMock, setMockedFile } from "../../../../__mocks__/fs-api.mock";
import testProjectJson from "../../../../__mocks__/assets/test-project.json";
import { describeClass } from "../../../../test-utils/describeClass";
import { FileSystemProjectRepository } from "./FileSystemProjectRepository";
import { Project } from "../../domain";
import { WeakRef } from "../../../common";

describeClass(FileSystemProjectRepository, () => {
    describe('read', () => {
        it('Should use FileSystem Web APIs to load a file at the given filePath', async () => {
            setMockedFile(JSON.stringify(testProjectJson));

            const expectedProject = new Project(testProjectJson, new WeakRef(createDirectoryHandleMock()));

            const projectRepo = new FileSystemProjectRepository();
            expect(JSON.stringify(await projectRepo.read())).toEqual(JSON.stringify(expectedProject));
        })
    });

    describe('update', () => {
        it('Should use FileSystem web APIs to save the project in its original location when the project as a valid directory handle', async () => {
            const directoryHandleRef = createDirectoryHandleMock();
            const projectToSave = new Project(testProjectJson, new WeakRef(directoryHandleRef));

            const projectRepo = new FileSystemProjectRepository();
            await projectRepo.update(projectToSave);

            expect(FileSystemWritableFileStreamMock.write).toHaveBeenCalledWith(JSON.stringify(projectToSave.toJson()));
        });
    })

    describe('save', () => {
        it('Should use FileSystem web APIs to save the project in a new location when the project does not have a valid directory handle', async () => {
            const projectToSave = new Project(testProjectJson);

            const projectRepo = new FileSystemProjectRepository();
            await projectRepo.save(projectToSave);

            expect(FileSystemWritableFileStreamMock.write).toHaveBeenCalledWith(JSON.stringify(projectToSave.toJson()));
        })

        it('Should return a new copy of the project with a new directory handle', async () => {
            const projectToSave = new Project(testProjectJson);

            const projectRepo = new FileSystemProjectRepository();
            const savedProject = await projectRepo.save(projectToSave);

            expect(savedProject.scopeRef).toBeDefined();
        })
    })

})