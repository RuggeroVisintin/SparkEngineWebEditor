import { BaseEntity, GameObject, StaticObject, TriggerEntity, TransformComponent, ShapeComponent, MaterialComponent, BoundingBoxComponent, IEntity, typeOf } from "sparkengineweb";
import { getRequiredComponents, isComponentRequired } from "./ecs";

describe('core/common/utils/ecs', () => {
    describe('getRequiredComponents()', () => {
        it('Should return empty array for BaseEntity', () => {
            const requiredComponents = getRequiredComponents('BaseEntity');

            expect(requiredComponents).toEqual([]);
        });

        it('Should return Transform, Shape, and Material for GameObject', () => {
            const requiredComponents = getRequiredComponents('GameObject');

            expect(requiredComponents).toEqual(
                expect.arrayContaining([
                    'TransformComponent',
                    'ShapeComponent',
                    'MaterialComponent'
                ])
            );
            expect(requiredComponents.length).toBe(3);
        });

        it('Should return Transform, Shape, Material, and BoundingBox for StaticObject', () => {
            const requiredComponents = getRequiredComponents('StaticObject');

            expect(requiredComponents).toEqual(
                expect.arrayContaining([
                    'TransformComponent',
                    'ShapeComponent',
                    'MaterialComponent',
                    'BoundingBoxComponent'
                ])
            );
            expect(requiredComponents.length).toBe(4);
        });

        it('Should return all inherited required components for TriggerEntity', () => {
            const requiredComponents = getRequiredComponents('TriggerEntity');

            expect(requiredComponents).toEqual(
                expect.arrayContaining([
                    'TransformComponent',
                    'ShapeComponent',
                    'MaterialComponent',
                    'BoundingBoxComponent'
                ])
            );
            expect(requiredComponents.length).toBe(4);
        });

        it('Should cache results for repeated calls', () => {
            const firstCall = getRequiredComponents('GameObject');
            const secondCall = getRequiredComponents('GameObject');

            // Should return the same array reference (cached)
            expect(firstCall).toBe(secondCall);
        });
    });

    describe('isComponentRequired()', () => {
        it('Should return true for required components', () => {
            const entity = new GameObject();

            expect(isComponentRequired(entity, 'TransformComponent')).toBe(true);
            expect(isComponentRequired(entity, 'ShapeComponent')).toBe(true);
            expect(isComponentRequired(entity, 'MaterialComponent')).toBe(true);
        });

        it('Should return false for non-required components', () => {
            const entity = new GameObject();

            expect(isComponentRequired(entity, 'BoundingBoxComponent')).toBe(false);
            expect(isComponentRequired(entity, 'AnimationComponent')).toBe(false);
        });

        it('Should work correctly with StaticObject', () => {
            const entity = new StaticObject();

            expect(isComponentRequired(entity, 'TransformComponent')).toBe(true);
            expect(isComponentRequired(entity, 'BoundingBoxComponent')).toBe(true);
            expect(isComponentRequired(entity, 'AnimationComponent')).toBe(false);
        });

        it('Should work correctly with TriggerEntity', () => {
            const entity = new TriggerEntity();

            expect(isComponentRequired(entity, 'TransformComponent')).toBe(true);
            expect(isComponentRequired(entity, 'BoundingBoxComponent')).toBe(true);
        });

        it('Should work correctly with BaseEntity (no requirements)', () => {
            const entity = new BaseEntity();

            expect(isComponentRequired(entity, 'TransformComponent')).toBe(false);
            expect(isComponentRequired(entity, 'BoundingBoxComponent')).toBe(false);
        });

        it('Should handle manually added components correctly', () => {
            const entity = new BaseEntity();
            entity.addComponent(new TransformComponent());

            // Transform is not required for BaseEntity, even if present
            expect(isComponentRequired(entity, 'TransformComponent')).toBe(false);
        });
    });
});
