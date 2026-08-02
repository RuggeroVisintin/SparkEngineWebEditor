function ensureBlobSupportsArrayBuffer(blob: Blob): Blob {
    if (typeof blob.arrayBuffer === 'function') {
        return blob;
    }

    return Object.assign(blob, {
        arrayBuffer: () => new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (!(reader.result instanceof ArrayBuffer)) {
                    reject(new Error('Failed to read blob as ArrayBuffer'));
                    return;
                }

                resolve(reader.result);
            };

            reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
            reader.readAsArrayBuffer(blob);
        })
    });
}

export class FakeBitmap implements ImageBitmap {
    private readonly blob: Blob;

    public constructor(
        blob: Blob = new Blob(['fake blob'], { type: 'image/png' })
    ) {
        this.blob = ensureBlobSupportsArrayBuffer(blob);
    }

    public static fromBlob(blob: Blob): FakeBitmap {
        return new FakeBitmap(ensureBlobSupportsArrayBuffer(blob));
    }

    public toBlob(): Blob {
        return this.blob;
    }

    close(): void {
        // No-op
    }

    get width(): number {
        return 0;
    }

    get height(): number {
        return 0;
    }
}

beforeEach(() => {
    global.createImageBitmap = jest.fn(async (image: ImageBitmapSource) => {
        if (image instanceof Blob) {
            return FakeBitmap.fromBlob(image);
        }

        return new FakeBitmap();
    });
});