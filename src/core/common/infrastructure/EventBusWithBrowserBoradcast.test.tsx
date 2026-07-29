import { getTestBroadcastChannel } from "../../../__mocks__/broadcast.mock";
import { EventBusWithBrowserBroadcast } from "./EventBusWithBrowserBroadcast";

describeClass(EventBusWithBrowserBroadcast, ({ describeMethod, describeConstructor }) => {
    describeConstructor(() => {
        it('should create a BroadcastChannel with the given topic name', () => {
            const topicName = 'test-channel';
            new EventBusWithBrowserBroadcast(topicName);
            const channel = getTestBroadcastChannel();

            expect(channel?.name).toBe(topicName);
        });
    });

    describeMethod('publish', () => {
        it('should subscribe to events and call the callback when an event is published', () => {
            const eventBus = new EventBusWithBrowserBroadcast('test-channel');
            const eventName = 'testEvent';

            eventBus.publish(eventName, { data: 'testData' });

            expect(getTestBroadcastChannel()?.postMessage).toHaveBeenCalledWith({
                eventName,
                data: 'testData',
            });
        });
    });

    describeMethod('subscribe', () => {
        it('Should invoke the given callback when matching subscribed event', () => {
            const eventBus = new EventBusWithBrowserBroadcast('test-channel');
            const eventName = 'testEvent';
            const callback = jest.fn();

            eventBus.subscribe(eventName, callback);

            eventBus.publish(eventName, { data: 'testData' });

            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: 'testData',
                })
            );
        });

        it('Should not invoke the given callback when not subsribed to the event', () => {
            const eventBus = new EventBusWithBrowserBroadcast('test-channel');
            const eventName = 'testEvent';
            const callback = jest.fn();

            eventBus.subscribe(eventName, callback);

            eventBus.publish('another-event', { data: 'testData' });

            expect(callback).not.toHaveBeenCalled();
        });
    });
});