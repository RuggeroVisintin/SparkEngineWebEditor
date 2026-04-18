import { useRef } from 'react';
import { GameEngine } from '@sparkengine';
import { EngineView } from '../../components';
import { FlexBox } from '../../primitives';
import { OnEngineViewReadyCBProps } from '../../components/EngineView';
import { useEditorService } from '../../hooks/useEditorService';

export const Preview = () => {
    const engine = useRef<GameEngine | undefined>(undefined);
    const [editorService] = useEditorService();

    const onEngineViewReady = async ({ context, resolution }: OnEngineViewReadyCBProps) => {
        editorService.start(context, resolution);
        const newEngine = editorService.engine;

        engine.current = newEngine;
    };

    return (
        <FlexBox $fill={true} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <EngineView onEngineViewReady={onEngineViewReady} />
        </FlexBox>
    )
}