import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { ReactStateRepository } from "../core/editor";
import { ScriptEditorService, ScriptEditorState } from "../core/scripting/application";
import { EventBusWithBrowserBroadcast } from "../core/common";
import { useAppState } from "../hooks/useAppState";

interface ScriptEditorServiceProviderProps {
    children: ReactNode;
    entityUuid: string;
    componentUuid: string;
    callbackPropertyName: string;
}

interface ScriptEditorServiceContextValue {
    service: ScriptEditorService;
    state: ScriptEditorState;
}

const ScriptEditorServiceContext = createContext<ScriptEditorServiceContextValue | null>(null);

const createScriptEditorService = (
    entityUuid: string,
    componentUuid: string,
    callbackPropertyName: string,
    stateRepo: ReactStateRepository<ScriptEditorState>
): ScriptEditorService => {
    return new ScriptEditorService(
        new EventBusWithBrowserBroadcast("scripting"),
        entityUuid,
        componentUuid,
        callbackPropertyName,
        stateRepo
    );
};

export const ScriptEditorServiceProvider = ({
    children,
    entityUuid,
    componentUuid,
    callbackPropertyName
}: ScriptEditorServiceProviderProps) => {
    const [stateRepo] = useState(() => new ReactStateRepository<ScriptEditorState>());
    const [state] = useAppState(stateRepo);

    const service = useMemo(() => createScriptEditorService(
        entityUuid,
        componentUuid,
        callbackPropertyName,
        stateRepo
    ), [entityUuid, componentUuid, callbackPropertyName, stateRepo]);

    useEffect(() => {
        return () => service.dispose?.();
    }, [service]);

    return (
        <ScriptEditorServiceContext.Provider value={{ service, state }}>
            {children}
        </ScriptEditorServiceContext.Provider>
    );
};

export const useScriptEditorServiceContext = (): [ScriptEditorService, ScriptEditorState] => {
    const value = useContext(ScriptEditorServiceContext);

    if (!value) {
        throw new Error("useScriptEditorService must be used within ScriptEditorServiceProvider");
    }

    return [
        value.service,
        value.state
    ];
};