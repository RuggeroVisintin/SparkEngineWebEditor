import { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { PreviewService } from "../core/preview/application/PreviewService";
import { EventBusWithBrowserBroadcast } from "../core/common";
import { InMemoryImageSerializer } from "../core/assets";

const PreviewServiceContext = createContext<PreviewService | null>(null);

const createPreviewService = (): PreviewService => {
    console.log('Creating new PreviewService instance');

    const imageSerializer = new InMemoryImageSerializer();

    return new PreviewService(
        new EventBusWithBrowserBroadcast('preview'),
        imageSerializer,
        imageSerializer
    );
};

export const PreviewServiceProvider = ({ children }: { children: ReactNode }) => {
    const serviceRef = useRef<PreviewService | null>(null);

    if (!serviceRef.current) {
        serviceRef.current = createPreviewService();
    }

    useEffect(() => {
        return () => {
            serviceRef.current?.dispose();
            serviceRef.current = null;
        };
    }, []);

    return (
        <PreviewServiceContext.Provider value={serviceRef.current}>
            {children}
        </PreviewServiceContext.Provider>
    );
};

export const usePreviewServiceContext = (): PreviewService => {
    const service = useContext(PreviewServiceContext);

    if (!service) {
        throw new Error("usePreviewService must be used within PreviewServiceProvider");
    }

    return service;
};