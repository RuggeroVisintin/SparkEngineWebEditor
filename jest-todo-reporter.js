class TodoReporter {
    constructor(globalConfig, options) {
        this._options = options || {};
    }

    onRunComplete(contexts, results) {
        const todoCount = results.numTodoTests;
        const MAX_TODOS = this._options.maxTodos;

        if (isNaN(MAX_TODOS)) {
            throw new Error('TodoReporter requires a maxTodos option');
        }

        if (todoCount > MAX_TODOS) {
            console.error(
                `\n❌ Too many TODO tests: ${todoCount} (max allowed: ${MAX_TODOS})`
            );
            process.exitCode = 1; // Fail the test run without throwing
        }
    }
}

module.exports = TodoReporter;
