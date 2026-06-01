import { useRef } from 'react';
import { GameEngine } from '@sparkengine';
import { EngineView } from '../../components';
import { FlexBox } from '../../primitives';
import { OnEngineViewReadyCBProps } from '../../components/EngineView';
import { useEditorService } from '../../hooks/useEditorService';
import { usePreviewService } from '../../hooks';
import { useParams } from 'react-router';

export const Preview = () => {
    const { sceneId } = useParams<{
        sceneId: string;
    }>();

    const [previewService] = usePreviewService();

    const onEngineViewReady = async ({ context, resolution }: OnEngineViewReadyCBProps) => {
        previewService.onPreviewStart(sceneId!, context, resolution);
    };

    return (
        <FlexBox $fill={true} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <EngineView onEngineViewReady={onEngineViewReady} />
        </FlexBox>
    )
}