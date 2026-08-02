import { ImageAsset, ImageLoader } from "sparkengineweb";
import { FakeBitmap } from "../../../bitmap.mock";

export class ImageLoaderTestDouble implements ImageLoader {
    load(src: string): Promise<ImageAsset> {
        return Promise.resolve({
            media: new FakeBitmap(),
            type: 'png',
        });
    }
}