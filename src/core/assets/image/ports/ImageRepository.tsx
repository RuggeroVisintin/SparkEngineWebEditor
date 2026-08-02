import { ImageAsset } from "sparkengineweb";
import { LocationParameters, WeakRef } from "../../../common";

export interface ImageRepository {
    save(image: ImageAsset, location: LocationParameters): Promise<void>;
    changeScope(scopeRef: WeakRef): void;
}