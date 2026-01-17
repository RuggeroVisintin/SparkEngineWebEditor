import { GameObject, Rgb, StaticObject, TriggerEntity, Vec2 } from '@sparkengine';
import { ListItem } from '../../components';
import { Box, Spacing } from '../../primitives';

interface EntityFactoryPanelProps {
    onAddEntity: Function,
    spawnPoint?: Vec2
}

const defaultTransformProps = (spawnPoint = new Vec2(55, 55)) => ({
    transform: {
        size: { width: 30, height: 30 },
        position: spawnPoint,
    }
});

const defaultMaterialProps = {
    material: {
        diffuseColor: new Rgb(255, 0, 0)
    }
}

const newEntity = <T extends GameObject>(constructor: new (...args: any) => T) => (spawnPoint?: Vec2) => new constructor({
    ...defaultTransformProps(spawnPoint),
    ...defaultMaterialProps
});

interface EntityDictEntry {
    factory: CallableFunction,
    icon: string
}

const entityDict: Record<string, EntityDictEntry> = {
    'GameObject': {
        factory: newEntity<GameObject>(GameObject),
        icon: 'game_object_icon.jpeg'
    },
    'StaticObject': {
        factory: newEntity<StaticObject>(StaticObject),
        icon: 'static_object_icon.jpeg'
    },
    'TriggerObject': {
        factory: newEntity<TriggerEntity>(TriggerEntity),
        icon: 'trigger_icon.jpeg'
    }
    // TODO: implement optional target in @sparkengine
    // 'TriggerEntity': newTriggerEntity
}

export const EntityFactoryPanel = ({ onAddEntity, spawnPoint }: EntityFactoryPanelProps) => {
    return (
        <Box
            $size={0.25}
            $spacing={Spacing.sm}
            data-testid="EntityFactoryPanel"
        >
            {Object.entries(entityDict).map(([entityType, { factory, icon }]) => (
                <ListItem
                    key={entityType}
                    text={`Add ${entityType}`}
                    onClick={() => onAddEntity(factory(spawnPoint))}
                    imgSrc={icon}
                    data-testid={`Add${entityType}Button`} />
            ))}
        </Box>
    )
}