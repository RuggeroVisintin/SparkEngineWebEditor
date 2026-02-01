import { GameObject } from 'sparkengineweb';
import { ReactStateRepository } from './ReactStateRepository';

interface TestState {
  currentEntity?: GameObject
}

describe('ReactStateRepository', () => {
    it('Should trigger the subscribers on a state update', () => {
        const stateRepo = new ReactStateRepository<TestState>();
        const subscriber = jest.fn();
        const subscriber2 = jest.fn();

        stateRepo.subscribe(subscriber);
        stateRepo.subscribe(subscriber2);
        stateRepo.update({ currentEntity: new GameObject() });

        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber2).toHaveBeenCalledTimes(1);
    });

    it('Should unsubscribe the subscriber', () => {
        const stateRepo = new ReactStateRepository();
        const subscriber = jest.fn();

        const unsubscribe = stateRepo.subscribe(subscriber);
        unsubscribe();
        stateRepo.update({ currentEntity: new GameObject() });

        expect(subscriber).toHaveBeenCalledTimes(0);
    });

    it('Should propagate the state update to the subscribers', () => {
        const stateRepo = new ReactStateRepository();
        const subscriber = jest.fn();

        stateRepo.subscribe(subscriber);
        const newState = { currentEntity: new GameObject() };
        stateRepo.update(newState);

        expect(subscriber).toHaveBeenCalledWith(newState);
    });

    describe('.get()', () => {
        it('Should return the current state', () => {
            const newEntity = new GameObject();
            const stateRepo = new ReactStateRepository<TestState>({ currentEntity: newEntity });

            expect(stateRepo.get()).toEqual({ currentEntity: newEntity });
        })
    })
});