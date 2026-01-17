import { FC, useRef, useState, useEffect } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { BackgroundColor, FlexBox, TextColor } from '../../primitives';
import { Linter } from "eslint-linter-browserify";
import eslint from "@eslint/js";
import globals from "globals/globals.json";
// Import only basic TypeScript syntax highlighting
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import { PopupMenu } from '../../components/PopupMenu';
import { useScriptEditorService } from '../../hooks';
import { useParams } from 'react-router';

const loadESLintConfig = async (editor: monaco.editor.IStandaloneCodeEditor) => {
    const linter = new Linter({
        configType: 'flat'
    });

    const results = linter.verify(editor.getValue(), [eslint.configs.recommended, {
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
        rules: {
            camelcase: "error",
            "default-case-last": "error",
            curly: ["error", "multi-line"],
            "default-param-last": "error",
            eqeqeq: "error",
            "no-eval": "error",
            "no-implied-eval": "error",
        },
    }]);
    const markers: monaco.editor.IMarkerData[] = results.map(result => ({
        severity: result.severity === 2 ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        startLineNumber: result.line,
        startColumn: result.column,
        endLineNumber: result.endLine || result.line,
        endColumn: result.endColumn || result.column,
        message: result.message,
        source: 'ESLint',
    }));

    // Set markers for the current model
    const model = editor.getModel();

    if (model) {
        monaco.editor.setModelMarkers(model, 'eslint', markers);
    }
};

export const Scripting: FC = () => {
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoEl = useRef(null);
    const { currentEntityId } = useParams<{ currentEntityId: string }>();

    const [service, state] = useScriptEditorService(currentEntityId!);

    useEffect(() => {
        if (monacoEl.current) {
            const defaultValue = '// Write your code here';

            const newEditor = monaco.editor.create(monacoEl.current, {
                value: state.currentScript ?? defaultValue,
                language: 'javascript',
                minimap: { enabled: false },
                automaticLayout: true,
                theme: 'vs-dark',
                renderValidationDecorations: 'on',
            });

            // Load ESLint config and apply syntax highlighting
            loadESLintConfig(newEditor);

            // Update highlighting when content changes
            const model = newEditor.getModel();
            if (model) {
                let lastTimeout: NodeJS.Timeout | null = null;

                model.onDidChangeContent(() => {
                    // Debounce the linting to avoid performance issues
                    lastTimeout && clearTimeout(lastTimeout);

                    lastTimeout = setTimeout(() => {
                        loadESLintConfig(newEditor);
                        service.edit(newEditor.getValue());
                    }, 300);
                });
            }

            setEditor(newEditor);
            service.onEditorReady();

            return () => newEditor.dispose();
        }
        return undefined;
    }, [monacoEl]);

    useEffect(() => {
        if (state.currentScript !== editor?.getValue()) {
            const editor = monaco.editor.getModels()[0];
            if (editor) {
                editor.setValue(state.currentScript || '');
            }
        }
    }, [state.currentScript, editor]);

    return <FlexBox $fill={true} data-testid="ScriptingPage">
        <FlexBox style={{ height: '40px', background: BackgroundColor.Primary, borderBottom: `1px solid ${TextColor.Primary}` }}
            $direction='row'>
            <PopupMenu
                data-testid="action-menu.file"
                label="Save"
                action={() => {
                    console.log('Save');
                    service.save();
                }}
            />
        </FlexBox>
        <FlexBox $fill={true} ref={monacoEl} />
    </FlexBox>;
};