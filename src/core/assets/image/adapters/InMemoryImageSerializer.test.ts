import { ImageAsset } from "sparkengineweb";
import { InMemoryImageSerializer } from "./InMemoryImageSerializer";
import { FakeBitmap } from "../../../../__mocks__/bitmap.mock";
import { bitmapToBlob, WeakRef } from "../../../common";

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
    });

    describeMethod('load', () => {
        it('Should throw an error if the image asset is not found in memory', async () => {
            const imageSerializer = new InMemoryImageSerializer();

            await expect(imageSerializer.load('non/existent/image.png'))
                .rejects.toThrow('Image with src non/existent/image.png not found');

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