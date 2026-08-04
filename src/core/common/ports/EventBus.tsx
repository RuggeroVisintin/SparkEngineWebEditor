export interface EventBus {
    subscribe<T>(eventName: string, callback: (event: T) => void): () => void;
    publish<T>(eventName: string, event: T): void;
    dispose?(): void;
}