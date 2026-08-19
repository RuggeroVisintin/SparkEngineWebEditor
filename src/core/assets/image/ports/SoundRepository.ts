import { SoundAsset } from "@sparkengine";
import { LocationParameters, WeakRef } from "../../../common";

export interface SoundRepository { 
    save(sound: SoundAsset, location: LocationParameters): Promise<void>;
    changeScope(scopeRef: WeakRef): void;
}