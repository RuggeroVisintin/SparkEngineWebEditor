---
name: Test Driven Development
description: Use this skill for implementing behavior changes and bug fixes through unit-level Red-Green-Refactor cycles after scope is defined; for net-new features, pair with ATDD first.
---

# Test-Driven Development (TDD) - MANDATORY

**ALL code changes MUST follow strict TDD practices:**
**New behaviours MUST be covered by new failing tests FIRST.**
**You MUST stop and let human review a test once implemented or changed before implementing the code**

> **For new features**, use [Acceptance Test Driven Development (ATDD)](acceptance-test-driven-development.md) first, then TDD for implementation.

## The Red-Green-Refactor Cycle

1. **RED** - Write a sinle failing test FIRST
   - Write ONE test that describes the desired behavior
   - The test MUST fail initially (proving it's testing the right thing)
   - Run the test to confirm it fails: `npm test`

2. **GREEN** - Write the simplest code to make the test pass
   - Implement ONLY enough code to pass the current test
   - Avoid over-engineering or premature optimization
   - Run the test to confirm it passes

3. **REFACTOR** - Improve the code without changing behavior
   - Clean up implementation while keeping tests green
   - Apply design patterns and best practices
   - Ensure all tests still pass after refactoring
   - Don't implement new behaviours!

4. **REPEAT** - Continue one test at a time
   - Move to the next test case
   - Never write multiple tests before implementation

## Testing Guidelines

### Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
describe('ComponentName', () => {
    describe('Feature/Scenario', () => {
        it('Should [expected behavior]', () => {
            // Arrange - Set up test data and dependencies
            const mockCallback = jest.fn();
            
            // Act - Execute the code under test
            render(<Component onCallback={mockCallback} />);
            fireEvent.click(screen.getByTestId('button'));
            
            // Assert - Verify expected outcomes
            expect(mockCallback).toHaveBeenCalledWith(expectedValue);
        });
    });
});
```

### What to Test

- Component rendering with different props
- User interactions (clicks, form inputs, keyboard events)
- Callback invocations with correct arguments
- Conditional rendering based on feature flags or state
- Integration with dependencies and libraries
- Error handling and edge cases
- Performance characteristics (when relevant)

### Common Testing Anti-Patterns

1. **Forgetting TDD** - Always write the test FIRST, then implement
2. **Testing implementation details** - Test behavior, not internal structure
3. **Missing test coverage** - Test both success and error paths
4. **Writing multiple tests before implementation** - Follow the cycle strictly
5. **Over-mocking** - Mock external dependencies, not internal logic
6. **Brittle tests** - Avoid tests that break with minor refactoring

## Example TDD Workflow

### 1. Write Failing Test

```typescript
it('Should duplicate the selected entity', () => {
    const entity = new GameObject('Original');
    const onDuplicate = jest.fn();
    
    render(<EntityList entities={[entity]} onDuplicate={onDuplicate} />);
    fireEvent.click(screen.getByTestId('duplicate-button'));
    
    expect(onDuplicate).toHaveBeenCalledWith(entity);
});
```

### 2. Run Test (Confirm Failure)

```bash
npm test
# Verify test fails with expected error
```

### 3. Implement Simplest Solution

```typescript
const handleDuplicate = () => {
    onDuplicate(entity);
};

return <button data-testid="duplicate-button" onClick={handleDuplicate}>Duplicate</button>;
```

### 4. Run Test (Confirm Pass)

```bash
npm test
# Verify test now passes
```

### 5. Refactor (If Needed)

```typescript
const handleDuplicate = useCallback(() => {
    onDuplicate(entity);
}, [entity, onDuplicate]);
```

### 6. Run Tests Again

```bash
npm test
# Verify all tests still pass after refactoring
```

## Testing Tools Reference

- **Jest** - Test runner and assertions
- **React Testing Library** - Component testing (for React projects)
- `npm test` - Unit tests in watch mode (use during TDD)

## Related Skills

- [Acceptance Test Driven Development (ATDD)](acceptance-test-driven-development.md) - For new feature development
- [Feature Flagging](feature-flagging.md) - For gated rollout and safe release control
