export interface SerializedAsset {
    type: string;
    media: Uint8Array;
}

export type SerializedAssetSnapshot = Record<string, SerializedAsset>;

export interface AssetSerializer<Asset> {
    serialize(asset: Asset, key: string): Promise<void>;
    importSnapshot(snapshot: SerializedAssetSnapshot): Promise<void>;
    exportSnapshot(): Promise<SerializedAssetSnapshot>;
}