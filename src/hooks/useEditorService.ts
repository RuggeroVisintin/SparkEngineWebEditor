import { useState } from "react";
import { ColorObjectPicker, ObjectPickingService, ReactStateRepository } from "../core/editor"
import { useAppState } from "./useAppState";
import { EditorService } from "../core/editor/application";
import { EditorState } from "../core/editor/application/EditorState";
import { FileSystemImageRepository, InMemoryImageSerializer } from "../core/assets";
import { Renderer } from "sparkengineweb";
import { Project } from "../core/project/domain";
import { FileSystemProjectRepository } from "../core/project/infrastructure/adapters";
import { FileSystemSceneRepository } from "../core/scene";
import { ContextualUiService } from "../core/editor/domain/ContextualUiService";
import { WeakRef } from "../core/common";
import { EventBusWithBrowserBroadcast } from "../core/common";

export const useEditorService = (): [EditorService, EditorState] => {
    const [stateRepo] = useState(() => new ReactStateRepository<EditorState>());
    const [appState] = useAppState(stateRepo);

    const [service] = useState(() => {
        const project = new Project({ name: 'my-project', scenes: [] });
        const projectRepo = new FileSystemProjectRepository();
        const sceneRepo = new FileSystemSceneRepository();
        const imageRepository = new FileSystemImageRepository(project.scopeRef as WeakRef<FileSystemDirectoryHandle>);
        const imageSerializer = new InMemoryImageSerializer(imageRepository, imageRepository);
        const objectPikcer = new ColorObjectPicker((...params) => new Renderer(...params), { width: 1920, height: 1080 }, imageRepository);
        const objectPickingService = new ObjectPickingService(objectPikcer);
        const contextualUiService = new ContextualUiService();
        const eventBus = new EventBusWithBrowserBroadcast('scripting');

        return new EditorService(
            imageSerializer,
            imageSerializer,
            imageSerializer,
            projectRepo,
            sceneRepo,
            objectPickingService,
            stateRepo,
            contextualUiService,
            eventBus
        );
    });

    return [
        service,
        appState
    ];
}