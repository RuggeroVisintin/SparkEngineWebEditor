import { SoundAsset } from "@sparkengine";
import { SoundLoaderTestDouble } from "../../../../__mocks__/core/assets/image/SoundLoaderTestDouble";
import { SoundRepositoryTestDouble } from "../../../../__mocks__/core/assets/sound/SoundRepositoryTestDouble";
import { WeakRef } from "../../../common";
import { InMemorySoundAssetSerializer } from "./InMemoryAssetSerializer";

const SOUND_PATH = 'test/path/to/sound.mp3';

describeClass(InMemorySoundAssetSerializer, ({ describeMethod }) => {
    let audioBlob: Blob;

    beforeEach(() => {
        audioBlob = new Blob(['mock audio data'], { type: 'audio/mpeg' });
        global.fetch = async () => ({
            blob: async () => audioBlob
        } as Response);
    });

    describeMethod('save', () => {
        it('Should also save sounds to the provided repository', async () => {
            const sound = new SoundAsset(new Audio('test/sound.mp3'));
            const soundRepository = new SoundRepositoryTestDouble();
            const serializer = new InMemorySoundAssetSerializer(soundRepository);
            const location = { accessScope: new WeakRef(), path: SOUND_PATH };

            await serializer.save(sound, location);

            expect(soundRepository.sounds.get(SOUND_PATH)).toBe(sound);
        });
    });

    describeMethod('load', () => {
        it('Should throw an error if the sound asset is not found in memory', async () => {
            const serializer = new InMemorySoundAssetSerializer();

            await expect(serializer.load('missing/sound.mp3'))
                .rejects.toThrow('Sound with src missing/sound.mp3 not found');
        });

        it('Should load sounds from in memory if no sound loader is provided', async () => {
            const serializer = new InMemorySoundAssetSerializer();
            const testSoundAsset = new SoundAsset(new Audio('test/sound.mp3'));

            await serializer.save(testSoundAsset, {
                accessScope: new WeakRef(),
                path: SOUND_PATH
            });

            const loaded = await serializer.load(SOUND_PATH);

            expect(loaded).toBeInstanceOf(SoundAsset);
            expect(loaded.media).not.toBe(testSoundAsset.media);
        });

        it('Should load sounds from the sound loader if given', async () => {
            audioBlob = new Blob(['loaded audio'], { type: 'audio/ogg' });
            const soundLoader = new SoundLoaderTestDouble();
            soundLoader.sounds.set(SOUND_PATH, new SoundAsset(new Audio('loaded/sound.ogg')));
            const serializer = new InMemorySoundAssetSerializer(undefined, soundLoader);

            const loaded = await serializer.load(SOUND_PATH);

            expect(loaded).toBeInstanceOf(SoundAsset);
        });

        it('Should store the loaded sound in memory if the sound loader is provided', async () => {
            audioBlob = new Blob(['loaded audio'], { type: 'audio/ogg' });
            const soundLoader = new SoundLoaderTestDouble();
            soundLoader.sounds.set(SOUND_PATH, new SoundAsset(new Audio('loaded/sound.ogg')));
            const serializer = new InMemorySoundAssetSerializer(undefined, soundLoader);

            await serializer.load(SOUND_PATH);

            expect(await serializer.exportSnapshot()).toEqual({
                [SOUND_PATH]: {
                    type: 'audio/ogg',
                    media: new TextEncoder().encode('loaded audio')
                }
            });
        });
    });

    describeMethod('exportSnapshot', () => {
        it('Should return a snapshot of stored sounds using the stored blob bytes', async () => {
            const serializer = new InMemorySoundAssetSerializer();
            const testSoundAsset = new SoundAsset(new Audio('test/sound.mp3'));

            await serializer.save(testSoundAsset, {
                accessScope: new WeakRef(),
                path: SOUND_PATH
            });

            expect(await serializer.exportSnapshot()).toEqual({
                [SOUND_PATH]: {
                    type: 'audio/mpeg',
                    media: new TextEncoder().encode('mock audio data')
                }
            });
        });
    });

    describeMethod('importSnapshot', () => {
        it('Should import a snapshot of sounds into memory', async () => {
            const serializer = new InMemorySoundAssetSerializer();
            const snapshot = {
                [SOUND_PATH]: {
                    type: 'audio/ogg',
                    media: new TextEncoder().encode('imported audio')
                }
            };

            await serializer.importSnapshot(snapshot);

            expect(await serializer.exportSnapshot()).toEqual(snapshot);
        });
    });

    describeMethod('changeScope', () => {
        it('Should change the repository scope', () => {
            const soundRepository = new SoundRepositoryTestDouble();
            const serializer = new InMemorySoundAssetSerializer(soundRepository);
            const scopeRef = new WeakRef({});

            serializer.changeScope(scopeRef);

            expect(soundRepository.scopeRef).toBe(scopeRef);
        });
    });
});