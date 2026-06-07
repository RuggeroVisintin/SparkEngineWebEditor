import { GameObject, Vec2 } from "sparkengineweb";
import { EntityOutline } from "./EntityOtuline";

describeClass(EntityOutline, () => {
    describe('.match()', () => {
        it('Should match the outline position to the one of the target', () => {
            const target = new GameObject({
                transform: {
                    position: new Vec2(15, 25),
                    size: { width: 10, height: 30 }
                }
            });

            const outline = new EntityOutline();
            outline.match(target);

            expect(outline.transform.position).toEqual(target.transform.position);
        });

        it('Should match the outline size to the one of the target', () => {
            const target = new GameObject({
                transform: {
                    position: new Vec2(15, 25),
                    size: { width: 10, height: 30 }
                }
            });

            const outline = new EntityOutline();
            outline.match(target);

            expect(outline.transform.size).toEqual(target.transform.size);
        });
    });
});