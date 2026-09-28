import { SoundAsset, SoundLoader } from "@sparkengine";
import { AssetSerializer, SerializedAssetSnapshot } from "../../common/ports";
import { SoundRepository } from "../ports";
import { LocationParameters, WeakRef } from "../../../common";

function readBlob(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
    });
}

export class InMemorySoundAssetSerializer implements SoundLoader, AssetSerializer, SoundRepository {
    private readonly sounds = new Map<string, Blob>();

    public constructor(
        private readonly soundRepository?: SoundRepository,
        private readonly soundLoader?: SoundLoader
    ) {
    }

    public async save(sound: SoundAsset, location: LocationParameters): Promise<void> {
        const blob = await fetch(sound.media.src).then(response => response.blob());
        this.sounds.set(location.path, blob);

        if (this.soundRepository) {
            await this.soundRepository.save(sound, location);
        }
    }

    public changeScope(scopeRef: WeakRef): void {
        if (this.soundRepository) {
            this.soundRepository.changeScope(scopeRef);
        }
    }

    public async load(src: string): Promise<SoundAsset> {
        if (this.soundLoader) {
            const loaded = await this.soundLoader.load(src);
            const blob = await fetch(loaded.media.src).then(response => response.blob());
            this.sounds.set(src, blob);
        }

        const blob = this.sounds.get(src);

        if (!blob) {
            return Promise.reject(new Error(`Sound with src ${src} not found`));
        }

        return new SoundAsset(new Audio(URL.createObjectURL(blob)));
    }


    public async importSnapshot(snapshot: SerializedAssetSnapshot): Promise<void> {
        Object.entries(snapshot).forEach(([path, sound]) => {
            const mediaBytes = Uint8Array.from(sound.media);
            this.sounds.set(path, new Blob([mediaBytes], { type: sound.type }));
        });
    }
    public async exportSnapshot(): Promise<SerializedAssetSnapshot> {
        const entries = await Promise.all(
            Array.from(this.sounds.entries()).map(async ([path, blob]) => [path, {
                type: blob.type,
                media: new Uint8Array(await readBlob(blob))
            }] as const)
        );

        return Object.fromEntries(entries);
    }
}