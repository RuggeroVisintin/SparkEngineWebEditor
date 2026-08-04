import { ImageAsset, ImageLoader } from "sparkengineweb";
import { bitmapToBlob, LocationParameters, WeakRef } from "../../../common";
import { ImageSerializer, SerializedImageAsset, SerializedImageAssetSnapshot } from "../ports/ImageSerializer";
import { ImageRepository } from "../ports";

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

export class InMemoryImageSerializer implements ImageLoader, ImageSerializer, ImageRepository {
    private readonly images: Map<string, InMemoryImageAsset> = new Map();

    public constructor(
        private readonly imageRepository?: ImageRepository,
        private readonly imageLoader?: ImageLoader
    ) {

    }

    public async importSnapshot(snapshot: SerializedImageAssetSnapshot): Promise<void> {
        console.log('Importing snapshot into InMemoryImageSerializer:', snapshot);

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

        if (this.imageRepository) {
            await this.imageRepository.save(image, location);
        }
    }

    public async load(src: string): Promise<ImageAsset> {
        console.log(`Loading image from src: ${src}`);
        console.log('Current images in memory:', this.images);
        console.log('image Loader:', this.imageLoader);

        if (this.imageLoader) {
            const loaded = await this.imageLoader.load(src);
            this.images.set(src, await InMemoryImageAsset.fromImageAsset(loaded));
        }

        const image = this.images.get(src);

        if (!image) {
            return Promise.reject(new Error(`Image with src ${src} not found`));
        }

        return image.toImageAsset();
    }

    public changeScope(scopeRef: WeakRef<FileSystemDirectoryHandle>): void {
        if (this.imageRepository) {
            this.imageRepository.changeScope?.(scopeRef);
        }
    }
}