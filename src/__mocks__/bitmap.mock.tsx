export class FakeBitmap implements ImageBitmap {
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
        return new FakeBitmap();
    });
});