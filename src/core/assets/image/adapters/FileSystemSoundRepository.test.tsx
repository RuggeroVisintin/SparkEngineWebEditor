import { SoundAsset } from "@sparkengine";
import { createDirectoryHandleMock } from "../../../../__mocks__/fs-api.mock";
import { WeakRef } from "../../../common";
import { FileSystemSoundRepository } from "./FileSystemSoundRepository";

describeClass(FileSystemSoundRepository, ({ describeMethod }) => { 
    let fileSystemSoundRepository: FileSystemSoundRepository;
    
        beforeEach(() => {
            fileSystemSoundRepository = new FileSystemSoundRepository(
                new WeakRef(createDirectoryHandleMock())
            );
        });
    
    describeMethod('load', () => { 
        it('Should load a sound within the given project scope from the file system from the source path when given', async () => {
            const result = await fileSystemSoundRepository.load('assets/test.mp3');

            expect(result).toBeInstanceOf(SoundAsset);
        });
    });
});