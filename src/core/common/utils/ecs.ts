import { allOf, IComponent, typeOf } from "sparkengineweb";

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