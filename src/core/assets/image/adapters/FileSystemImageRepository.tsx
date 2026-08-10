import { ImageAsset, ImageLoader } from "@sparkengine";
import { bitmapToBlob, WeakRef } from "../../../common";
import { FileSystemRepository, LocationParameters } from "../../../common";
import { ImageRepository } from "../ports";

export class FileSystemImageRepository extends FileSystemRepository implements ImageLoader, ImageRepository {
    constructor(
        private projectScope?: WeakRef<FileSystemDirectoryHandle>
    ) {
        super();
    }

    public async save(image: ImageAsset, location: LocationParameters): Promise<void> {
        const fileHandle = await this.getTargetFileHandle({
            path: location.path,
            accessScope: location.accessScope
        }, true);

        const writable = await fileHandle.createWritable();
        await writable.write({
            type: 'write',
            data: await bitmapToBlob(image.media),
        });
        await writable.close();
    }

    public async load(src?: string): Promise<ImageAsset> {
        let fileHandle: FileSystemFileHandle;

        if (!src) {
            [fileHandle] = await window.showOpenFilePicker({
                multiple: false,
                types: [{
                    accept: {
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                    }
                }]
            });
        } else {
            if (!this.projectScope) {
                throw new Error('No project scope provided');
            }

            fileHandle = await this.getTargetFileHandle({
                path: src,
                accessScope: this.projectScope
            });
        }

        return new ImageAsset(await createImageBitmap(await fileHandle.getFile()), fileHandle.name.split('.').pop() ?? '');
    }

    public changeScope(scope: WeakRef<FileSystemDirectoryHandle>): void {
        this.projectScope = scope;
    }
}