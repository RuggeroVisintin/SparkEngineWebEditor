import { useRef } from 'react';
import { GameEngine, IComponent, IEntity } from '@sparkengine';
import { EngineView } from '../../components';
import { Box, FlexBox } from '../../primitives';
import { EntityFactoryPanel, ScenePanel } from '../../templates';
import { ActionMenu } from '../../templates/ActionMenu';
import { EntityPropsPanel } from '../../templates/EntityPropsPanel';
import { OnEngineViewReadyCBProps } from '../../components/EngineView';
import { useEditorService } from '../../hooks/useEditorService';
import { ComponentsPanel } from './ComponentsPanel';
import { getAllAvailableComponents } from '../../core/common';

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
                            onSelectComponent={(componentName) => editorService.addComponent(componentName + 'Component')}
                            components={Object.keys(getAllAvailableComponents()).map(component => component.split('Component')[0]) ?? []}
                            onClose={() => editorService.closeComponentSelection()}
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
                                onAddComponent={() => editorService.openComponentsSelection()}
                                onComponentUpdate={(component: IComponent, propName: string, newValue: any) => editorService.updateCurrentEntityComponentProperty(component, propName, newValue)}
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