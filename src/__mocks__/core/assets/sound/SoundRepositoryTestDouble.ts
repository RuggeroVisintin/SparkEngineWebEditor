import { SoundAsset } from "@sparkengine";
import { SoundRepository } from "../../../../core/assets/sound/ports";
import { LocationParameters, WeakRef } from "../../../../core/common";

export class SoundRepositoryTestDouble implements SoundRepository {
    public sounds: Map<string, SoundAsset> = new Map();
    public scopeRef?: WeakRef;

    async save(sound: SoundAsset, location: LocationParameters): Promise<void> {
        this.sounds.set(location.path, sound);
    }

    changeScope(scopeRef: WeakRef): void {
        this.scopeRef = scopeRef;
    }
}