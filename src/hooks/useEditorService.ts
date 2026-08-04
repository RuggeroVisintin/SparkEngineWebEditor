import { useState } from "react";
import { ColorObjectPicker, ObjectPickingService, ReactStateRepository } from "../core/editor"
import { useAppState } from "./useAppState";
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

export const useEditorService = (): [EditorService, EditorState] => {
    const [stateRepo] = useState(() => new ReactStateRepository<EditorState>());
    const [appState] = useAppState(stateRepo);

    const [service] = useState(() => {
        const project = new Project({ name: 'my-project', scenes: [] });
        const projectRepo = new FileSystemProjectRepository();
        const sceneRepo = new FileSystemSceneRepository();
        const imageRepository = new FileSystemImageRepository(project.scopeRef as WeakRef<FileSystemDirectoryHandle>);
        const imageSerializer = new InMemoryImageSerializer();
        const objectPikcer = new ColorObjectPicker((...params) => new Renderer(...params), { width: 1920, height: 1080 }, imageRepository);
        const objectPickingService = new ObjectPickingService(objectPikcer);
        const contextualUiService = new ContextualUiService();
        const scriptingEventBus = new EventBusWithBrowserBroadcast('scripting');
        const previewEventBus = new EventBusWithBrowserBroadcast('preview');

        return new EditorService(
            imageRepository,
            imageRepository,
            imageSerializer,
            projectRepo,
            sceneRepo,
            objectPickingService,
            stateRepo,
            contextualUiService,
            scriptingEventBus,
            previewEventBus
        );
    });

    return [
        service,
        appState
    ];
}