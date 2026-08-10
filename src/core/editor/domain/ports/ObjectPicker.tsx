import { IEntity, RenderSystem } from "@sparkengine";
import { Optional } from "../../../common";

export interface ObjectPicker extends RenderSystem {
    pick(x: number, y: number): Optional<IEntity>;
}