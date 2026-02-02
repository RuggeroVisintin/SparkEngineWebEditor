import { StateRepository } from '../ports/StateRepository';

export class ReactStateRepository<T> implements StateRepository<T> {
    private subscribers = new Set<(currentState: T) => void>();
    private currentState: T = {} as T;

    constructor(initialState?: T) {
        if (initialState) {
            this.currentState = { ...initialState };
        }
    }

    subscribe(callback: (state: T) => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    update(state: T): void {
        this.currentState = { ...this.currentState, ...state };
        this.subscribers.forEach(callback => callback(this.currentState!));
    }

    get(): T {
        return this.currentState;
    }
}