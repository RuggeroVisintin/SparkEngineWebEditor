import { useState } from "react";
import { PreviewService } from "../core/preview/application/PreviewService";
import { EventBusWithBrowserBroadcast } from "../core/common";
import { InMemoryImageSerializer } from "../core/assets";

export const usePreviewService = () => {
    const [service] = useState(() => {
        return new PreviewService(
            new EventBusWithBrowserBroadcast('preview'),
            new InMemoryImageSerializer()
        );
    });

    return [
        service
    ];
}