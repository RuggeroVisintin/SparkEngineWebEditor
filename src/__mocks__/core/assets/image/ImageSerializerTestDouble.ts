import { ImageAsset } from "sparkengineweb";
import { ImageSerializer, SerializedImageAssetSnapshot } from "../../../../core/assets";
import { LocationParameters } from "../../../../core/common";

export class ImageSerializerTestDouble implements ImageSerializer {
    importSnapshot(snapshot: SerializedImageAssetSnapshot): Promise<void> {
        throw new Error("Method not implemented.");
    }
    toSnapshot(): Promise<SerializedImageAssetSnapshot> {
        throw new Error("Method not implemented.");
    }
    save(image: ImageAsset, location: LocationParameters): Promise<void> {
        throw new Error("Method not implemented.");
    }

}