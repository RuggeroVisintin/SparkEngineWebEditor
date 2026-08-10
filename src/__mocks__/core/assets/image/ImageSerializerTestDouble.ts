import { ImageAsset } from "@sparkengine";
import { ImageSerializer, SerializedImageAssetSnapshot } from "../../../../core/assets";
import { LocationParameters } from "../../../../core/common";

export class ImageSerializerTestDouble implements ImageSerializer {
    private snapshot: SerializedImageAssetSnapshot = {};

    importSnapshot(snapshot: SerializedImageAssetSnapshot): Promise<void> {
        this.snapshot = snapshot;
        return Promise.resolve();
    }
    toSnapshot(): Promise<SerializedImageAssetSnapshot> {
        return Promise.resolve(this.snapshot);
    }
}