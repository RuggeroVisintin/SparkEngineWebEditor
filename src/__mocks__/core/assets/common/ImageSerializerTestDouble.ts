import { AssetSerializer, SerializedAssetSnapshot } from "../../../../core/assets/common/ports";

export class AssetSerializerTestDouble implements AssetSerializer {
    private snapshot: SerializedAssetSnapshot = {};

    importSnapshot(snapshot: SerializedAssetSnapshot): Promise<void> {
        this.snapshot = snapshot;
        return Promise.resolve();
    }
    exportSnapshot(): Promise<SerializedAssetSnapshot> {
        return Promise.resolve(this.snapshot);
    }
}