import { useState } from "react";
import { PreviewService } from "../core/preview/application/PreviewService";
import { EventBusWithBrowserBroadcast } from "../core/scripting/infrastructure";

export const usePreviewService = () => {
    const [service] = useState(() => {
        console.log('[POC] usePreviewService - Creating PreviewService with shared event channel');
        return new PreviewService(
            new EventBusWithBrowserBroadcast('spark-engine')
        );
    });

    return [
        service
    ];
}