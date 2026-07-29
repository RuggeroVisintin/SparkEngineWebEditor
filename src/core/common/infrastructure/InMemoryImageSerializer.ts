import { ImageAsset, ImageLoader } from "sparkengineweb";

export class InMemoryImageSerializer implements ImageLoader {

    load(src: string): Promise<ImageAsset> {
        throw new Error("Method not implemented.");
    }
}