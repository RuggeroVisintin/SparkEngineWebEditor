import { GameObject, Rgb, Vec2 } from "sparkengineweb";
import { describeClass } from "../../../../test-utils/describeClass";
import Pivot from "./Pivot";

describeClass(Pivot, () => {
    describe('.match()', () => {
        it('Should match the pivot position to the one of the target', () => {
            const target = new GameObject({
                transform: {
                    position: new Vec2(15, 25),
                    size: { width: 10, height: 30 }
                }
            });

            const pivot = new Pivot({ diffuseColor: new Rgb(255, 0, 0) });
            pivot.match(target);

            expect(pivot.transform.position).toEqual(target.transform.position);
        });
    })
});