class GlobalDescribeClassDouble {
    run(): void {
        // noop
    }
}

describeClass(GlobalDescribeClassDouble, ({ describeMethod }) => {
    describeMethod('run', () => {
        it('Should expose describeClass as a global test helper', () => {
            expect(true).toBe(true);
        });
    });
});