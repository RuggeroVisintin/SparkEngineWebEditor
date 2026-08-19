import { SoundAsset, SoundLoader } from "@sparkengine";

export class SoundLoaderTestDouble implements SoundLoader {
    public sounds = new Map<string, SoundAsset>();

    load(src: string): Promise<SoundAsset> {
        const sound = this.sounds.get(src);

        if (!sound) {
            return Promise.reject(new Error(`Sound with src ${src} not found`));
        }

        return Promise.resolve(sound);
    }

}