import { ImageAsset, ImageLoader } from "sparkengineweb";
import { FakeBitmap } from "../../../bitmap.mock";

export class ImageLoaderTestDouble implements ImageLoader {
    public images = new Map<string, ImageAsset>();

    load(src: string): Promise<ImageAsset> {
        const image = this.images.get(src);

        if (!image) {
            return Promise.reject(new Error(`Image with src ${src} not found`));
        }

        return Promise.resolve(image);
    }
}