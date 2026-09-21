import { SoundAsset } from "@sparkengine";
import { createDirectoryHandleMock, FileSystemWritableFileStreamMock, setMockedFile } from "../../../../__mocks__/fs-api.mock";
import { WeakRef } from "../../../common";
import { FileSystemSoundRepository } from "./FileSystemSoundRepository";

describeClass(FileSystemSoundRepository, ({ describeMethod }) => { 
    let fileSystemSoundRepository: FileSystemSoundRepository;
    let projectScope: WeakRef<FileSystemDirectoryHandle>;
    
    beforeEach(() => {
        projectScope = new WeakRef(createDirectoryHandleMock());

        fileSystemSoundRepository = new FileSystemSoundRepository(
            projectScope
        );
    });
    
    describeMethod('load', () => { 
        it('Should load a sound within the given project scope from the file system from the source path when given', async () => {
            const result = await fileSystemSoundRepository.load('assets/test.mp3');

            expect(result).toBeInstanceOf(SoundAsset);
        });

        it('Should open a file picker when no source path is given', async () => {
            setMockedFile('assets/test.mp3');
            
            const result = await fileSystemSoundRepository.load();

            expect(result).toBeInstanceOf(SoundAsset);
        });

        it('Should throw an error when trying to open a sound without a project scope', async () => {
            const fileSystemSoundRepository = new FileSystemSoundRepository();

            await expect(async () => { await fileSystemSoundRepository.load('assets/test.mp3') })
                .rejects
                .toThrow('No project scope provided');
        });

        describe('Caching', () => { 
            it('Should load the file from cache if it has been loaded before', async () => {
                const firstLoad = await fileSystemSoundRepository.load('test/test.mp3');
                const secondLoad = await fileSystemSoundRepository.load('test/test.mp3');

                expect(firstLoad).toBe(secondLoad);
            });

            it('Should also cache the file for future loads from project assets directory', async () => {
                const firstLoad = await fileSystemSoundRepository.load('test/test.mp3');
                const secondLoad = await fileSystemSoundRepository.load(`assets/${firstLoad.id}.mp3`);

                expect(firstLoad).toBe(secondLoad);
            })
        })
        
        
    });

    describeMethod('save', () => { 
        const audioBlob = new Blob(['mock audio data'], { type: 'audio/mp3' });

        beforeEach(() => { 
            global.fetch = jest.fn().mockResolvedValue({
                blob: async () => audioBlob
            } as Response);
        })

        it('Should save a given SoundAsset to the given path within the project scope', async () => {
            const asset = new SoundAsset(new Audio());

            await fileSystemSoundRepository.save(asset, { path: 'assets/test.mp3', accessScope: new WeakRef(createDirectoryHandleMock()) });

            expect(FileSystemWritableFileStreamMock.write).toHaveBeenCalledWith({
                type: 'write',
                data: audioBlob,
            });
        });
    });

    describeMethod('changeScope', () => { 
        it('Should change the project scope', async () => {
            fileSystemSoundRepository.changeScope(new WeakRef(createDirectoryHandleMock({
                getFileHandle: jest.fn(() => { throw new Error('File not found') })
            })));

            await expect(async () => { await fileSystemSoundRepository.load('assets/test.mp3') })
                .rejects
                .toThrow('File not found');
        });

        it('Should clear the cache when chaning the project scope', async () => { 
            const firstLoad = await fileSystemSoundRepository.load('test/test.mp3');

            fileSystemSoundRepository.changeScope(new WeakRef(createDirectoryHandleMock()));

            const secondLoad = await fileSystemSoundRepository.load('test/test.mp3');

            expect(firstLoad).not.toBe(secondLoad);
        });

        it('Should carry over cached files if no project scope was preivously set', async () => {
            const fileSystemSoundRepository = new FileSystemSoundRepository();

            setMockedFile('test/test.mp3');

            const firstLoad = await fileSystemSoundRepository.load();

            fileSystemSoundRepository.changeScope(new WeakRef(createDirectoryHandleMock()));

            const secondLoad = await fileSystemSoundRepository.load(`assets/${firstLoad.id}.mp3`);

            expect(firstLoad).toBe(secondLoad);
        });
    });
});