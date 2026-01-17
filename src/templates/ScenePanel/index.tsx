import { IEntity } from '@sparkengine';
import { ListItem } from '../../components';
import { Box, Spacing } from '../../primitives';

interface ScenePanelProps {
    entities?: IEntity[];
    currentEntity?: IEntity;
    onRemoveEntity: CallableFunction;
    onFocusEntity: CallableFunction
}

export const ScenePanel = ({ entities = [], currentEntity, onRemoveEntity, onFocusEntity }: ScenePanelProps) => {
    return (
        <Box $size={1} $spacing={Spacing.sm} $scroll data-testid="ScenePanel">
            {entities.map((entity) =>
                <ListItem
                    isAcitve={currentEntity?.uuid === entity.uuid}
                    key={entity.uuid}
                    text={entity.name}
                    data-testid={`ScenePanel.EntityEntry.${entity.uuid}`}
                    onClick={() => onFocusEntity(entity)}
                    button={{
                        "data-testid": `RemoveEntityButton.${entity.uuid}`,
                        text: 'X',
                        onClick: (e) => {
                            e.stopPropagation();
                            onRemoveEntity(entity);
                        }
                    }}
                ></ListItem>
            )}
        </Box>
    );
}