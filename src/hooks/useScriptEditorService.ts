import { useState } from "react";
import { ReactStateRepository } from "../core/editor"
import { ScriptEditorService, ScriptEditorState } from "../core/scripting/application"
import { EventBusWithBrowserBroadcast } from "../core/scripting/infrastructure";
import { useAppState } from "./useAppState";

export const useScriptEditorService = (
    entityUuid: string,
    componentUuid: string,
    callbackPropertyName: string
): [ScriptEditorService, ScriptEditorState] => {
    const [stateRepo] = useState(() => new ReactStateRepository<ScriptEditorState>());
    const [appState] = useAppState(stateRepo);

    const [service] = useState(() =>
        new ScriptEditorService(
            new EventBusWithBrowserBroadcast("scripting"),
            entityUuid,
            componentUuid,
            callbackPropertyName,
            stateRepo
        )
    );

    return [
        service,
        appState
    ]
}