import { usePreviewServiceContext } from "../providers";

export const usePreviewService = () => {
    const service = usePreviewServiceContext();

    return [
        service
    ];
}