import { Optional } from "../../common";
import { StateRepository } from "../../common/ports/StateRepository";
import { OpenScriptingEditorCommand } from "../domain/commands/OpenScriptingEditor";
import { ScriptingEditorReady, ScriptSaved } from "../domain/events";
import { EventBus } from "../../common/ports/EventBus";
import { ScriptEditorState } from "./ScriptEditorState";
export class ScriptEditorService {

    get currentScript(): Optional<string> {
        return this.state.get().currentScript;
    }

    set currentScript(value: Optional<string>) {
        this.state.update({
            currentScript: value
        });
    }

    constructor(
        private readonly eventBus: EventBus,
        private readonly entityUuid: string,
        private readonly componentUuid: string,
        private readonly callbackPropertyName: string,
        private readonly state: StateRepository<ScriptEditorState>
    ) {
        this.eventBus.subscribe<OpenScriptingEditorCommand>('OpenScriptingEditorCommand', this.handle.bind(this));
    }

    public onEditorReady(): void {
        this.eventBus.publish<ScriptingEditorReady>('ScriptingEditorReady', {
            entityUuid: this.entityUuid,
            componentUuid: this.componentUuid,
            callbackPropertyName: this.callbackPropertyName,
        });
    }

    public edit(script: string): void {
        this.currentScript = script;
    }

    public save(): void {
        console.log('Script Saved');

        this.eventBus.publish<ScriptSaved>('ScriptSaved', {
            entityUuid: this.entityUuid,
            componentUuid: this.componentUuid,
            callbackPropertyName: this.callbackPropertyName,
            script: this.currentScript || ''
        });
    }

    private handle(message: OpenScriptingEditorCommand): void {
        if (
            message.entityUuid !== this.entityUuid ||
            message.componentUuid !== this.componentUuid ||
            message.callbackPropertyName !== this.callbackPropertyName
        ) {
            return;
        }

        this.currentScript = message.currentScript;
    }
}