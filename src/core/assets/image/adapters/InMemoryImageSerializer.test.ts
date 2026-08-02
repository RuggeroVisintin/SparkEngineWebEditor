import { ImageAsset } from "sparkengineweb";
import { InMemoryImageSerializer } from "./InMemoryImageSerializer";
import { FakeBitmap } from "../../../../__mocks__/bitmap.mock";
import { bitmapToBlob, WeakRef } from "../../../common";
import { ImageRepositoryTestDouble } from "../../../../__mocks__/core/assets/image/ImageRepositoryTestDouble";
import { ImageLoaderTestDouble } from "../../../../__mocks__/core/assets/image/ImageLoaderTestDouble";

const IMAGE_PATH = 'test/path/to/image.png';

describeClass(InMemoryImageSerializer, ({ describeMethod }) => {
    describeMethod('save', () => {
        it('Should save the given image asset in memory', async () => {
            const imageSerializer = new InMemoryImageSerializer();
            const testImageAsset = new ImageAsset(new FakeBitmap(), 'image/png');

            await imageSerializer.save(testImageAsset, {
                accessScope: new WeakRef(),
                path: IMAGE_PATH
            });

            expect(await imageSerializer.load(IMAGE_PATH)).toEqual(testImageAsset);
        });

        it('Should store the image asset as a blob', async () => {
            const imageSerializer = new InMemoryImageSerializer();
            const testImageAsset = new ImageAsset(new FakeBitmap(), 'image/png');

            await imageSerializer.save(testImageAsset, {
                accessScope: new WeakRef(),
                path: IMAGE_PATH
            });

            const loaded = await imageSerializer.load(IMAGE_PATH);

            expect(loaded.media).not.toBe(testImageAsset.media);
        });

        it('Should also store the image asset in the image repoisitory if provided', async () => {
            const imageRepository = new ImageRepositoryTestDouble();
            const imageSerializer = new InMemoryImageSerializer(imageRepository);
            const testImageAsset = new ImageAsset(new FakeBitmap(), 'image/png');

            await imageSerializer.save(testImageAsset, {
                accessScope: new WeakRef(),
                path: IMAGE_PATH
            });

            expect(imageRepository.images.get(IMAGE_PATH)).toEqual(testImageAsset);
        });
    });

    describeMethod('load', () => {
        it('Should throw an error if the image asset is not found in memory', async () => {
            const imageSerializer = new InMemoryImageSerializer();

            await expect(imageSerializer.load('non/existent/image.png'))
                .rejects.toThrow('Image with src non/existent/image.png not found');

        });

        it('Should load images from in memory if no image loader is provided', async () => {
            const imageSerializer = new InMemoryImageSerializer();
            const testImageAsset = new ImageAsset(new FakeBitmap(), 'image/png');

            await imageSerializer.save(testImageAsset, {
                accessScope: new WeakRef(),
                path: IMAGE_PATH
            });

            return expect(imageSerializer.load(IMAGE_PATH)).resolves.toEqual(testImageAsset);
        });

        it('Should load images from the image loader if given', () => {
            const imageLoader = new ImageLoaderTestDouble();
            const imageSerializer = new InMemoryImageSerializer(undefined, imageLoader);

            const testImageAsset = new ImageAsset(new FakeBitmap(), 'image/png');
            imageLoader.images.set(IMAGE_PATH, testImageAsset);

            return expect(imageSerializer.load(IMAGE_PATH)).resolves.toEqual(testImageAsset);
        });

        it('Should store the loaded image in memory if the image loader is provided', async () => {
            const imageLoader = new ImageLoaderTestDouble();
            const imageSerializer = new InMemoryImageSerializer(undefined, imageLoader);

            const testImageAsset = new ImageAsset(new FakeBitmap(), 'image/png');
            imageLoader.images.set(IMAGE_PATH, testImageAsset);

            const loaded = await imageSerializer.load(IMAGE_PATH);

            expect(await imageSerializer.toSnapshot()).toEqual({
                [IMAGE_PATH]: {
                    type: 'image/png',
                    media: new Uint8Array(await (await bitmapToBlob(loaded.media)).arrayBuffer())
                }
            });
        });
    });

    describeMethod('toSnapshot', () => {
        it('Should return a snapshot of the stored images using the stored blob bytes', async () => {
            const imageSerializer = new InMemoryImageSerializer();
            const expectedMedia = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
            const testImageAsset = new ImageAsset(
                new FakeBitmap(new Blob([expectedMedia], { type: 'image/png' })),
                'image/png'
            );

            await imageSerializer.save(testImageAsset, {
                accessScope: new WeakRef(),
                path: IMAGE_PATH
            });

            expect(await imageSerializer.toSnapshot()).toEqual({
                [IMAGE_PATH]: {
                    type: 'image/png',
                    media: expectedMedia
                }
            });
        });
    });

    describeMethod('importSnapshot', () => {
        it('Should import a snapshot of images into memory', async () => {
            const imageSerializer = new InMemoryImageSerializer();
            const expectedMedia = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
            const snapshot = {
                [IMAGE_PATH]: {
                    type: 'image/png',
                    media: expectedMedia
                }
            };

            await imageSerializer.importSnapshot(snapshot);

            const loaded = await imageSerializer.load(IMAGE_PATH);
            expect(loaded.type).toEqual('image/png');
            expect(new Uint8Array(await (await bitmapToBlob(loaded.media)).arrayBuffer())).toEqual(expectedMedia);
        });
    });
});