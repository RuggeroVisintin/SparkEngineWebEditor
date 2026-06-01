import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';

type PublishedEvent = { name: string; payload?: any };

export const eventBusMatchers = {
    toHavePublished(received: any, expected: PublishedEvent) {
        const { name, payload } = expected;

        if (!received || typeof received !== 'object') {
            return {
                pass: false,
                message: () =>
                    matcherHint('.toHavePublished') + '\n\n' +
                    `Received value is not an event bus instance:\n` +
                    printReceived(received),
            };
        }

        const published = received.publishedEvents ?? (received.published || {});

        const hasEvent = Object.prototype.hasOwnProperty.call(published, name);

        if (!hasEvent) {
            return {
                pass: false,
                message: () =>
                    matcherHint('.toHavePublished') + '\n\n' +
                    `Expected event bus to have published event with name:\n  ${printExpected(name)}\n\n` +
                    `Published events keys: ${printReceived(Object.keys(published))}`,
            };
        }

        const actualPayload = published[name];

        const pass = (this as any).equals(actualPayload, payload);

        if (pass) {
            return {
                pass: true,
                message: () =>
                    matcherHint('.not.toHavePublished') + '\n\n' +
                    `Expected event bus not to have published:\n  ${printExpected(name)} with payload ${printExpected(payload)}`,
            };
        }

        return {
            pass: false,
            message: () =>
                matcherHint('.toHavePublished') + '\n\n' +
                `Event published but payload did not match for event ${printExpected(name)}.\n\n` +
                `Expected payload:\n  ${printExpected(payload)}\n\n` +
                `Received payload:\n  ${printReceived(actualPayload)}`,
        };
    },
};

export default eventBusMatchers;
