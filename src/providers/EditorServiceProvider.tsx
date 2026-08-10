import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { ColorObjectPicker, ObjectPickingService, ReactStateRepository } from "../core/editor";
import { EditorService } from "../core/editor/application";
import { EditorState } from "../core/editor/application/EditorState";
import { FileSystemImageRepository } from "../core/assets";
import { Renderer } from "sparkengineweb";
import { Project } from "../core/project/domain";
import { FileSystemProjectRepository } from "../core/project/infrastructure/adapters";
import { FileSystemSceneRepository } from "../core/scene";
import { ContextualUiService } from "../core/editor/domain/ContextualUiService";
import { EventBusWithBrowserBroadcast, WeakRef } from "../core/common";
import { InMemoryImageSerializer } from "../core/assets/image/adapters";
import { useAppState } from "../hooks/useAppState";

interface EditorServiceContextValue {
    service: EditorService;
    state: EditorState;
}

const EditorServiceContext = createContext<EditorServiceContextValue | null>(null);

const createEditorService = (stateRepo: ReactStateRepository<EditorState>): EditorService => {
    console.log('Creating new EditorService instance');

    const project = new Project({ name: 'my-project', scenes: [] });
    const projectRepo = new FileSystemProjectRepository();
    const sceneRepo = new FileSystemSceneRepository();
    const imageRepository = new FileSystemImageRepository(project.scopeRef as WeakRef<FileSystemDirectoryHandle>);
    const imageSerializer = new InMemoryImageSerializer(imageRepository, imageRepository);
    const objectPikcer = new ColorObjectPicker((...params) => new Renderer(...params), { width: 1920, height: 1080 }, imageRepository);
    const objectPickingService = new ObjectPickingService(objectPikcer);
    const contextualUiService = new ContextualUiService();
    const scriptingEventBus = new EventBusWithBrowserBroadcast('scripting');
    const previewEventBus = new EventBusWithBrowserBroadcast('preview');

    return new EditorService(
        imageSerializer,
        imageSerializer,
        imageSerializer,
        projectRepo,
        sceneRepo,
        objectPickingService,
        stateRepo,
        contextualUiService,
        scriptingEventBus,
        previewEventBus
    );
};

export const EditorServiceProvider = ({ children }: { children: ReactNode }) => {
    const [stateRepo] = useState(() => new ReactStateRepository<EditorState>());
    const [state] = useAppState(stateRepo);
    const service = useMemo(() => createEditorService(stateRepo), [stateRepo]);

    useEffect(() => {
        return () => service.dispose?.();
    }, [service]);

    return (
        <EditorServiceContext.Provider value={{ service, state }}>
            {children}
        </EditorServiceContext.Provider>
    );
};

export const useEditorServiceContext = (): [EditorService, EditorState] => {
    const value = useContext(EditorServiceContext);

    if (!value) {
        throw new Error("useEditorService must be used within EditorServiceProvider");
    }

    return [
        value.service,
        value.state
    ];
};