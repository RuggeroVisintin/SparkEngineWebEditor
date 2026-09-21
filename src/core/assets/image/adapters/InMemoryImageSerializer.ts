import { ImageAsset, ImageLoader } from "@sparkengine";
import { bitmapToBlob, FileSystemLocationParameters, WeakRef } from "../../../common";
import { ImageRepository } from "../ports";
import { AssetSerializer, SerializedAsset, SerializedAssetSnapshot } from "../../common/ports";

class InMemoryImageAsset {
    constructor(
        private readonly media: Blob,
        private readonly type: string) {

    }

    static async fromImageAsset(image: ImageAsset): Promise<InMemoryImageAsset> {
        const blob = await bitmapToBlob(image.media);
        return new InMemoryImageAsset(blob, image.type);
    }

    static fromSerializedImageAsset(image: SerializedAsset): InMemoryImageAsset {
        const mediaBytes = Uint8Array.from(image.media);

        return new InMemoryImageAsset(new Blob([mediaBytes], { type: image.type }), image.type);
    }

    public async toImageAsset(): Promise<ImageAsset> {
        const bitmap = await createImageBitmap(this.media);
        return new ImageAsset(bitmap, this.type);
    }

    public async toSerializedImageAsset(): Promise<SerializedAsset> {
        return {
            type: this.type,
            media: new Uint8Array(await this.media.arrayBuffer())
        }
    }
}

export class InMemoryImageSerializer implements ImageLoader, AssetSerializer, ImageRepository {
    private readonly images: Map<string, InMemoryImageAsset> = new Map();

    public constructor(
        private readonly imageRepository?: ImageRepository,
        private readonly imageLoader?: ImageLoader
    ) {

    }

    public async importSnapshot(snapshot: SerializedAssetSnapshot): Promise<void> {
        Object.entries(snapshot).forEach(([path, image]) => {
            this.images.set(path, InMemoryImageAsset.fromSerializedImageAsset(image));
        });
    }

    public async exportSnapshot(): Promise<SerializedAssetSnapshot> {
        const entries = await Promise.all(
            Array.from(this.images.entries()).map(async ([path, image]) => {
                return [path, await image.toSerializedImageAsset()] as const;
            })
        );

        return Object.fromEntries(entries);
    }

    public async save(image: ImageAsset, location: FileSystemLocationParameters): Promise<void> {
        this.images.set(location.path, await InMemoryImageAsset.fromImageAsset(image));

        if (this.imageRepository) {
            await this.imageRepository.save(image, location);
        }
    }

    public async load(src: string): Promise<ImageAsset> {
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