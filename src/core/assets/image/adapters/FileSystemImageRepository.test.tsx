import { ImageAsset } from "@sparkengine";
import { WeakRef } from "../../../../common";
import { FileSystemImageRepository } from "./FileSystemImageRepository";
import { createDirectoryHandleMock, FileSystemWritableFileStreamMock, setMockedFile } from "../../../../__mocks__/fs-api.mock";
import { FakeBitmap } from "../../../../__mocks__/bitmap.mock";

describe('core/assets/image/adapters/FileSystemImageLoader', () => {
    let fileSystemImageRepository: FileSystemImageRepository;

    beforeEach(() => {
        fileSystemImageRepository = new FileSystemImageRepository(
            new WeakRef(createDirectoryHandleMock())
        );
    });

    describe('.load()', () => {
        it('Should load an image within the given project scope from the file system from the source path when given', async () => {
            const result = await fileSystemImageRepository.load('assets/test.png');

            expect(result).toBeInstanceOf(ImageAsset);
        });

        it('Should open a file picker when no source path is given', async () => {
            setMockedFile('assets/test.png');

            const result = await fileSystemImageRepository.load();

            expect(result).toBeInstanceOf(ImageAsset);
        });

        it('Should throw an error when trying to open an image without a project scope', async () => {
            const fileSystemImageRepository = new FileSystemImageRepository();

            await expect(async () => { await fileSystemImageRepository.load('assets/test.png') })
                .rejects
                .toThrow('No project scope provided');
        })
    });

    describe('.save()', () => {
        it('Shoudld save a given ImageAsset to the given path within the project scope', async () => {
            const asset = new ImageAsset(new FakeBitmap(), 'png');

            await fileSystemImageRepository.save(asset, 'assets/test.png');

            expect(FileSystemWritableFileStreamMock.write).toHaveBeenCalledWith({
                type: 'write',
                data: new Blob([asset.media.toString()], { type: 'image/png' })
            });
        });

        it.todo('Should throw an error when trying to save an image without a project scope');
    });

    describe('.changeScope()', () => {
        it('Should change the project scope', async () => {
            fileSystemImageRepository.changeScope(new WeakRef(createDirectoryHandleMock({
                getFileHandle: jest.fn(() => { throw new Error('File not found') })
            })));

            await expect(async () => { await fileSystemImageRepository.load('assets/test.png') })
                .rejects
                .toThrow('File not found');
        })
    })
});