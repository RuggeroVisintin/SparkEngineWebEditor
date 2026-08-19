import { SoundAsset, SoundLoader } from "@sparkengine";
import { SoundRepository } from "../ports";
import { FileSystemRepository, LocationParameters, WeakRef } from "../../../common";

export class FileSystemSoundRepository extends FileSystemRepository implements SoundLoader, SoundRepository {
    constructor(private scopeRef: WeakRef) {
        super();
    }

    load(src: string): Promise<SoundAsset> {
        throw new Error("Method not implemented.");
    }
    save(sound: SoundAsset, location: LocationParameters): Promise<void> {
        throw new Error("Method not implemented.");
    }
    changeScope(scopeRef: WeakRef): void {
        throw new Error("Method not implemented.");
    }

}