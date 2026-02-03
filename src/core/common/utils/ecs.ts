import { allOf, IComponent, IEntity, typeOf, create } from "sparkengineweb";

function isComponentUnavaibleFromType(componentType: string): boolean {
    return componentType === 'AnimationComponent';
}

export function isComponentUnavaible(component: IComponent): boolean {
    return isComponentUnavaibleFromType(typeOf(component));
}

export function getAllAvailableComponents() {
    return Object.fromEntries(Object.entries(allOf('Component')).filter(([componentType, _]) => {
        return !isComponentUnavaibleFromType(componentType);
    }));
}

// Cache for required components to avoid repeated instantiation
const requiredComponentsCache = new Map<string, string[]>();

/**
 * Determines which components are required for an entity type by analyzing its constructor.
 * Creates a temporary instance and inspects which components it initializes by default.
 * 
 * @param entityType - The type string of the entity (e.g., 'GameObject', 'StaticObject')
 * @returns Array of required component type strings
 */
export function getRequiredComponents(entityType: string): string[] {
    // Check cache first
    if (requiredComponentsCache.has(entityType)) {
        return requiredComponentsCache.get(entityType)!;
    }

    // Create a temporary instance to see what components it has by default
    const instance = create<IEntity>(entityType);
    const requiredComponents = instance.components.map(c => typeOf(c));

    // Cache the result
    requiredComponentsCache.set(entityType, requiredComponents);

    return requiredComponents;
}

/**
 * Checks if a specific component type is required for the given entity instance.
 * A component is considered required if the entity's constructor adds it by default.
 * 
 * @param entity - The entity instance to check
 * @param componentType - The component type string to check (e.g., 'TransformComponent')
 * @returns true if the component is part of the entity's minimal setup
 */
export function isComponentRequired(entity: IEntity, componentType: string): boolean {
    const entityType = typeOf(entity);
    const requiredComponents = getRequiredComponents(entityType);
    return requiredComponents.includes(componentType);
}