import { ImageAsset, ImageLoader } from "sparkengineweb";
import { ImageRepository } from "../ports";
import { bitmapToBlob, LocationParameters } from "../../../common";

class InMemoryImageAsset {
    constructor(
        private readonly media: Blob,
        private readonly type: string) {

    }

    static async fromImageAsset(image: ImageAsset): Promise<InMemoryImageAsset> {
        const blob = await bitmapToBlob(image.media);
        return new InMemoryImageAsset(blob, image.type);
    }

    public async toImageAsset(): Promise<ImageAsset> {
        const bitmap = await createImageBitmap(this.media);
        return new ImageAsset(bitmap, this.type);
    }
}

export class InMemoryImageSerializer implements ImageLoader, ImageRepository {
    private readonly images: Map<string, InMemoryImageAsset> = new Map();

    public async save(image: ImageAsset, location: LocationParameters): Promise<void> {
        this.images.set(location.path, await InMemoryImageAsset.fromImageAsset(image));
    }

    public async load(src: string): Promise<ImageAsset> {
        const image = this.images.get(src);

        if (!image) {
            return Promise.reject(new Error(`Image with src ${src} not found`));
        }

        return image.toImageAsset();

    }
}