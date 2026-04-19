import { useState } from "react";
import { PreviewService } from "../core/preview/application/PreviewService";
import { EventBusWithBrowserBroadcast } from "../core/scripting/infrastructure";

export const usePreviewService = () => {
    const [service] = useState(() => {
        return new PreviewService(
            new EventBusWithBrowserBroadcast('preview')
        );
    });

    return [
        service
    ];
}