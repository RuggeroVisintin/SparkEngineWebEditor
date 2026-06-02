import { ImageAsset, ImageLoader } from "@sparkengine";

/**
 * Loads images from buffer data instead of file system.
 * Used in preview tab to load assets without file access.
 */
export class BufferImageRepository implements ImageLoader {
    private buffers: Map<string, Blob> = new Map();

    /**
     * Register an asset buffer with an ID
     */
    public registerBuffer(assetId: string, blob: Blob): void {
        this.buffers.set(assetId, blob);
    }

    /**
     * Register multiple buffers at once
     */
    public registerBuffers(buffers: Record<string, Blob>): void {
        for (const [id, blob] of Object.entries(buffers)) {
            this.buffers.set(id, blob);
        }
    }

    /**
     * Load an image from registered buffer
     */
    public async load(src?: string): Promise<ImageAsset> {
        if (!src) {
            throw new Error('src is required for BufferImageRepository');
        }

        const blob = this.buffers.get(src);
        if (!blob) {
            throw new Error(`Asset buffer '${src}' not found in repository`);
        }

        const file = new File([blob], src, { type: blob.type });
        const bitmap = await createImageBitmap(file);
        const format = this.getFormatFromMimeType(blob.type);

        return new ImageAsset(bitmap, format);
    }

    /**
     * Clear all registered buffers
     */
    public clear(): void {
        this.buffers.clear();
    }

    /**
     * Get number of registered buffers
     */
    public getBufferCount(): number {
        return this.buffers.size;
    }

    private getFormatFromMimeType(mimeType: string): string {
        const formats: Record<string, string> = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/gif': 'gif',
            'image/webp': 'webp'
        };
        return formats[mimeType] || 'png';
    }
}
