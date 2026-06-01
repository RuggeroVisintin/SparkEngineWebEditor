type PublishedEvent = { name: string; payload?: any };

declare namespace jest {
    interface Matchers<R> {
        toHavePublished(expected: PublishedEvent): R;
    }
}
