import { ImageRepository } from "./ImageRepository";

export interface SerializedImageAsset {
    type: string;
    media: Uint8Array;
}

export type SerializedImageAssetSnapshot = Record<string, SerializedImageAsset>;

export interface ImageSerializer extends ImageRepository {
    importSnapshot(snapshot: SerliazedImageAssetSnapshot): Promise<void>;
    toSnapshot(): Promise<SerializedImageAssetSnapshot>;
}