import { EventBus } from "../../core/common/ports";

export class InMemoryEventBusDouble implements EventBus {
    private subscribers: { [key: string]: ((event: any) => void)[] } = {};

    public publishedEvents: Record<string, any> = {};

    subscribe<T>(eventName: string, callback: (event: T) => void): () => void {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }

        this.subscribers[eventName].push(callback);

        return () => {
            this.subscribers[eventName] = this.subscribers[eventName].filter(subscriber => subscriber !== callback);
        };
    }

    publish<T>(eventName: string, event: T): void {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach(callback => callback(event));
        }

        this.publishedEvents[eventName] = event;
    }
}