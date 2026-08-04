import { EventBus } from "../ports/EventBus";

export class EventBusWithBrowserBroadcast implements EventBus {
    private readonly channel: BroadcastChannel;

    constructor(private readonly topicName: string) {
        this.channel = new BroadcastChannel(topicName);
    }

    subscribe<T>(eventName: string, callback: (event: T) => void): () => void {
        const listener = (message: MessageEvent) => {
            if (eventName !== message.data.eventName) return;
            callback(message.data as T);
        };

        this.channel.addEventListener("message", listener);

        return () => this.channel.removeEventListener("message", listener);
    }

    publish<T>(eventName: string, event: T): void {
        this.channel.postMessage({
            ...event,
            eventName
        });
    }

    dispose(): void {
        this.channel.close();
    }

}