import { ImageAsset } from "@sparkengine";
import { ImageRepository } from "../../../../core/assets";
import { LocationParameters, WeakRef } from "../../../../core/common";

export class ImageRepositoryTestDouble implements ImageRepository {
    public images: Map<string, ImageAsset> = new Map();

    async save(image: ImageAsset, location: LocationParameters): Promise<void> {
        this.images.set(location.path, image);
    }

    changeScope(scopeRef: WeakRef): void {
    }
}