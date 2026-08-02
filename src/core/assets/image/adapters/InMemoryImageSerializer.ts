import { ImageAsset, ImageLoader } from "sparkengineweb";
import { bitmapToBlob, LocationParameters } from "../../../common";
import { ImageSerializer, SerializedImageAsset, SerializedImageAssetSnapshot } from "../ports/ImageSerializer";

class InMemoryImageAsset {
    constructor(
        private readonly media: Blob,
        private readonly type: string) {

    }

    static async fromImageAsset(image: ImageAsset): Promise<InMemoryImageAsset> {
        const blob = await bitmapToBlob(image.media);
        return new InMemoryImageAsset(blob, image.type);
    }

    static fromSerializedImageAsset(image: SerializedImageAsset): InMemoryImageAsset {
        const mediaBytes = Uint8Array.from(image.media);

        return new InMemoryImageAsset(new Blob([mediaBytes], { type: image.type }), image.type);
    }

    public async toImageAsset(): Promise<ImageAsset> {
        const bitmap = await createImageBitmap(this.media);
        return new ImageAsset(bitmap, this.type);
    }

    public async toSerializedImageAsset(): Promise<SerializedImageAsset> {
        return {
            type: this.type,
            media: new Uint8Array(await this.media.arrayBuffer())
        }
    }
}

export class InMemoryImageSerializer implements ImageLoader, ImageSerializer {
    private readonly images: Map<string, InMemoryImageAsset> = new Map();

    public async importSnapshot(snapshot: SerializedImageAssetSnapshot): Promise<void> {
        Object.entries(snapshot).forEach(([path, image]) => {
            this.images.set(path, InMemoryImageAsset.fromSerializedImageAsset(image));
        });
    }

    public async toSnapshot(): Promise<SerializedImageAssetSnapshot> {
        const entries = await Promise.all(
            Array.from(this.images.entries()).map(async ([path, image]) => {
                return [path, await image.toSerializedImageAsset()] as const;
            })
        );

        return Object.fromEntries(entries);
    }

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