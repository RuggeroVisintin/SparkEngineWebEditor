import { FakeBitmap } from "../bitmap.mock";

jest.mock("../../core/common/utils/image", () => ({
    bitmapToBlob: (bitmap: ImageBitmap): Blob => {
        if (bitmap instanceof FakeBitmap) {
            return bitmap.toBlob();
        }

        return new Blob(['fake blob'], { type: 'image/png' });
    }
}));