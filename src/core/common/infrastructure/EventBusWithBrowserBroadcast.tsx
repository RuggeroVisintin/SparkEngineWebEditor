import { EventBus } from "../ports/EventBus";

export class EventBusWithBrowserBroadcast implements EventBus {
    private readonly channel: BroadcastChannel;

    constructor(private readonly topicName: string) {
        this.channel = new BroadcastChannel(topicName);
    }

    subscribe<T>(eventName: string, callback: (event: T) => void): void {
        this.channel.addEventListener("message", (message: MessageEvent) => {
            if (eventName !== message.data.eventName) return;
            callback(message.data as T);
        });
    }

    publish<T>(eventName: string, event: T): void {
        this.channel.postMessage({
            ...event,
            eventName
        });
    }

}