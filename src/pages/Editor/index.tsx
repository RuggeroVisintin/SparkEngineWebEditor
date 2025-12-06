import React, { useRef } from 'react';
import { allOf, GameEngine, IEntity, Vec2 } from '@sparkengine';
import { EngineView } from '../../components';
import { Box, FlexBox } from '../../primitives';
import { EntityFactoryPanel, ScenePanel } from '../../templates';
import { ActionMenu } from '../../templates/ActionMenu';
import { EntityPropsPanel } from '../../templates/EntityPropsPanel';
import { OnEngineViewReadyCBProps } from '../../components/EngineView';
import { useEditorService } from '../../hooks/useEditorService';
import { ComponentsPanel } from './ComponentsPanel';

export const Editor = () => {
    const engine = useRef<GameEngine>();
    const [editorService, editorState] = useEditorService();

    const onEngineViewReady = async ({ context, resolution }: OnEngineViewReadyCBProps) => {
        editorService.start(context, resolution);
        const newEngine = editorService.engine;

        engine.current = newEngine;
    };

    return (
        <FlexBox $fill={true}>
            <ActionMenu
                onProjectFileOpen={() => editorService.openProject()}
                onProjectFileSave={() => editorService.saveProject()}
            />
            <FlexBox $direction='row' $fill style={{ overflow: 'hidden' }}>
                <EntityFactoryPanel
                    onAddEntity={(entity: IEntity) => editorService.addEntity(entity)}
                    spawnPoint={editorState.spawnPoint}
                />
                <EngineView
                    onEngineViewReady={onEngineViewReady}
                    onClick={(e) => editorService.handleMouseClick(e)}
                    onMouseDown={(e) => editorService.handleMouseClick(e)}
                    onMouseDragging={(e) => editorService.handleMouseDrag(e)}
                    onMouseWheel={(e) => editorService.handleMouseWheel(e)}
                />
                {
                    editorState.isComponentsPanelOpen &&
                    <Box $size={0.25}>
                        <ComponentsPanel
                            components={Object.keys(allOf('Component')).map(component => component.split('Component')[0]) ?? []}
                        />
                    </Box>
                }
                <Box $size={0.25}>
                    <FlexBox $fill={true}>
                        <ScenePanel
                            entities={editorState.entities}
                            onRemoveEntity={({ uuid }: IEntity) => editorService.removeEntity(uuid)}
                            onFocusEntity={(entity: IEntity) => editorService.selectEntity(entity)}
                            currentEntity={editorState.currentEntity}
                        ></ScenePanel>
                        {editorState.currentEntity &&
                            <EntityPropsPanel
                                currentEntity={editorState.currentEntity}
                                onUpdatePosition={({ newPosition }: { newPosition: Vec2 }) => editorService.updateCurrentEntityPosition(newPosition)}
                                onUpdateSize={({ newSize }: { newSize: { width: number, height: number } }) => editorService.updateCurrentEntitySize(newSize)}
                                onMaterialUpdate={(materialProps: any) => editorService.updateCurrentEntityMaterial(materialProps)}
                                onAddComponent={() => editorService.openComponentsSelection()}
                            ></EntityPropsPanel>}
                    </FlexBox>
                </Box>
            </FlexBox>
            <FlexBox style={{ height: '33%' }}>
                <Box style={{ backgroundColor: 'grey' }}></Box>
            </FlexBox>
        </FlexBox>
    )
}