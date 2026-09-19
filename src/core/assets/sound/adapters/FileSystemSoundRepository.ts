import { SoundAsset, SoundLoader } from "@sparkengine";
import { FileSystemRepository, FileSystemLocationParameters, WeakRef } from "../../../common";
import { SoundRepository } from "../ports";

export class FileSystemSoundRepository extends FileSystemRepository implements SoundLoader, SoundRepository {
    private filesCache: Map<string, SoundAsset> = new Map();

    constructor(private projectScope?: WeakRef<FileSystemDirectoryHandle>) {
        super();
    }

    public async load(src?: string): Promise<SoundAsset> {
        let fileHandle: FileSystemFileHandle;

        if (!src) {
            [fileHandle] = await window.showOpenFilePicker({
                multiple: false,
                types: [{
                    accept: {
                        'audio/*': ['.mp3', '.wav', '.ogg']
                    }
                }]
            });
        } else {
            if (!this.projectScope) {
                throw new Error('No project scope provided');
            }

            if (this.filesCache.has(src)) {
                return this.filesCache.get(src)!;
            }

            fileHandle = await this.getTargetFileHandle({
                path: src,
                accessScope: this.projectScope
            });
        }

        const file = await fileHandle.getFile();
        const result = new SoundAsset(new Audio(URL.createObjectURL(file)));

        if (src) {
            this.filesCache.set(src, result);
        }

        this.filesCache.set(`assets/${result.id}.mp3`, result);

        return result;
    }

    public async save(sound: SoundAsset, location: FileSystemLocationParameters): Promise<void> {
        const fileHandle = await this.getTargetFileHandle({
            path: location.path,
            accessScope: location.accessScope
        }, true);

        await fetch(sound.media.src)
            .then(response => response.blob())
            .then(async (blob) => {
                const writable = await fileHandle.createWritable();
                await writable.write({
                    type: 'write',
                    data: blob,
                });
                await writable.close();
            });
    }

    changeScope(scopeRef: WeakRef<FileSystemDirectoryHandle>): void {
        if (this.projectScope && this.projectScope.get() !== scopeRef.get()) {
            this.filesCache.clear();
        }

        this.projectScope = scopeRef;
    }

}