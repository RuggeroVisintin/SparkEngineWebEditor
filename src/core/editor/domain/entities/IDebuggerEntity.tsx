import { IEntity } from "@sparkengine";

export default interface IDebuggerEntity extends IEntity {
    match(target: IEntity): void;
}