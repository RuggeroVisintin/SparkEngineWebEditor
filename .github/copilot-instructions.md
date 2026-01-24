# SparkEngineWeb Editor AI Coding Guidelines

## Project Overview

SparkEngineWeb Editor is a browser-based visual editor for the SparkEngine game engine, built with React 19, TypeScript, and styled-components. It provides a comprehensive UI for creating and editing game scenes, entities, and components without requiring installation.

### Core Architecture
- **`src/pages/`** - Main application pages (Editor, Scripting)
- **`src/components/`** - Reusable React components (EngineView, FormInput, PopupMenu, etc.)
- **`src/templates/`** - Complex template components (EntityPropsPanel, ScenePanel, ActionMenu, etc.)
- **`src/primitives/`** - Basic styled-component primitives (Button, Box, FlexBox, Inputs)
- **`src/core/`** - Business logic and state management (assets, editor, project, scene, scripting, featureFlags)
- **`src/hooks/`** - React custom hooks (useAppState, useEditorService, useScriptEditorService)
- **`src/__mocks__/`** - Jest mocks for external dependencies

## Test-Driven Development (TDD) - MANDATORY

**ALL code changes MUST follow strict TDD practices:**

**New behaviours MUST be covered by new failing tests FIRST.**

### The Red-Green-Refactor Cycle

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


### Testing Guidelines

**Test Structure:**
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

**What to Test:**
- Component rendering with different props
- User interactions (clicks, form inputs, keyboard events)
- Callback invocations with correct arguments
- Conditional rendering based on feature flags or state
- Integration with SparkEngine entities and components
- Error handling and edge cases

**Testing Tools:**
- Jest for test runner and assertions
- React Testing Library for component testing
- Playwright for E2E tests
- `npm test` - Unit tests in watch mode
- `npm run test:ci` - Full test suite for CI/CD
- `npm run test:e2e` - End-to-end tests (requires dev server running)

## Architecture Decision Records (ADRs)

**MANDATORY**: All significant architectural decisions MUST be documented using ADRs.

### When to Create an ADR

Create an ADR when making decisions about:
- Technology choices (libraries, frameworks, tools)
- Architectural patterns (state management, data flow, component structure)
- API design and interfaces
- Build and deployment strategies
- Testing approaches
- Security and performance trade-offs
- Breaking changes or major refactorings

### Creating ADRs

Use the vendored ADR tools:
```bash
npm run adr new "Title of Decision"
```

ADRs are stored in `docs/architecture/decisions/` and follow this structure:
```markdown
# N. Decision Title

Date: YYYY-MM-DD

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

**Examples:**
- ADR 0001: Record architecture decisions
- ADR 0002: Assets access management
- ADR 0003: Script serialization

## Code Style and Conventions

### ESLint Configuration

The project enforces strict linting rules (`.eslintrc.json`):

**Key Rules:**
- `camelCase` - REQUIRED for all identifiers
- `curly` (multi-line) - Braces required for multi-line blocks
- `eqeqeq` - Always use `===` and `!==` (no `==` or `!=`)
- `indent: 4` - Use 4 spaces for indentation
- `no-eval` - Never use eval()
- `no-implied-eval` - Avoid implicit eval
- `default-case-last` - Switch default case must be last
- `default-param-last` - Default parameters must come last

**Linting Commands:**
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Auto-fix linting issues

### TypeScript Conventions

- Use TypeScript strict mode features
- Enable experimental decorators (`experimentalDecorators: true`)
- Prefer explicit typing over `any`
- Use type imports for type-only dependencies
- Leverage React 19 types for components

### Component Patterns

**React Components:**
```typescript
// Functional components with typed props
interface ComponentProps {
    value: string;
    onChange: (newValue: string) => void;
}

export const Component: React.FC<ComponentProps> = ({ value, onChange }) => {
    return <div>{value}</div>;
};
```

**Styled Components:**
```typescript
import styled from 'styled-components';

const StyledButton = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
`;
```

**Custom Hooks:**
```typescript
export const useCustomHook = (initialValue: string) => {
    const [state, setState] = useState(initialValue);
    
    const updateState = useCallback((newValue: string) => {
        setState(newValue);
    }, []);
    
    return { state, updateState };
};
```

### File Organization

**Component Structure:**
```
ComponentName/
  index.tsx          # Main component implementation
  ComponentName.test.tsx  # Unit tests
  styles.tsx         # Styled components (if complex)
```

**Module Exports:**
- Use named exports for components: `export const Component`
- Use default exports sparingly
- Re-export from index files for cleaner imports

### Naming Conventions

- **Components**: PascalCase (`EntityPropsPanel`, `ScenePanel`)
- **Files**: Match component name (`EntityPropsPanel.tsx`)
- **Functions/Variables**: camelCase (`handleClick`, `editorService`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ENTITIES`, `DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`EntityProps`, `SceneData`)
- **Styled Components**: PascalCase with Styled prefix (`StyledButton`)

## Feature Flags System

**CRITICAL**: The editor uses compile-time feature flags that completely exclude disabled code from production builds.

**Complete documentation**: See [docs/feature-flags.md](../docs/feature-flags.md)

**Key Points for AI:**
- Always use string literals for flag names (enables dead code elimination)
- Test both enabled AND disabled states for every feature flag
- Use `Feature-Flag:` footer in commits for features not yet in production

## Git Conventions

**Complete documentation**: See [docs/git-conventions.md](../docs/git-conventions.md)

**Key Points for AI:**
- Follow Conventional Commits specification
- Use `Feature-Flag:` footer for features not yet in production
- Commit messages are spell-checked (add exceptions to `.git-dictionary.txt`)
- All code is linted pre-commit (auto-fixed when possible)

## Integration with SparkEngine

**SparkEngine Documentation**: See SparkEngineWeb `.github/copilot-instructions.md` for ECS architecture details

**Local Development**: See [README.md](../README.md#local-development-enhancements) for linking local SparkEngine

**Quick Reference:**
```typescript
import { GameObject, Transform, Material } from 'sparkengineweb';

const entity = new GameObject('PlayerEntity');
entity.addComponent(new Transform(0, 0));
const transform = entity.getComponent<Transform>('Transform');
```

## Build and Deployment

**Complete documentation**: See [README.md](../README.md#testing) for all commands

**Essential Commands:**
- `npm test` - Unit tests in watch mode (use during TDD)
- `npm run test:ci` - Full test suite (must pass before PR)
- `npm run test:e2e` - E2E tests (requires `npm start` running)
- `npm run lint:fix` - Auto-fix linting issues
- `npm run build` - Production build with dead code elimination

## Common Patterns and Best Practices

### State Management

- Use React hooks (`useState`, `useReducer`) for local state
- Use custom hooks for shared logic (`useEditorService`, `useAppState`)
- Pass callbacks down for state updates (unidirectional data flow)

### Component Communication

```typescript
// Parent component manages state
const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

// Pass state and callbacks to children
<EntityList 
    entities={entities}
    onSelectEntity={setSelectedEntity}
/>
<EntityPropsPanel 
    entity={selectedEntity}
    onUpdateEntity={handleUpdateEntity}
/>
```

### Error Handling

- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors to console for debugging
- Consider error boundaries for component errors

### Performance Considerations

- Use `React.memo()` for expensive components
- Use `useMemo()` and `useCallback()` to prevent unnecessary re-renders
- Lazy load heavy components with `React.lazy()`
- Optimize large lists with virtualization if needed

### Accessibility

- Use semantic HTML elements
- Provide `aria-label` for interactive elements
- Ensure keyboard navigation works
- Test with screen readers when possible

## Common Pitfalls

1. **Forgetting TDD** - Always write the test FIRST, then implement
2. **Testing implementation details** - Test behavior, not internal structure
3. **Skipping ADRs** - Document architectural decisions as you make them
4. **Ignoring lint errors** - Fix linting issues immediately, don't accumulate technical debt
5. **Feature flag variables** - Always use string literals for flag checks
6. **Missing test coverage** - Test both success and error paths
7. **Hardcoded values** - Use constants or configuration for magic numbers
8. **Direct DOM manipulation** - Use React state and refs instead

## Example Workflow

### Adding a New Feature (TDD + ADR)

1. **Document Decision** (if architectural):
```bash
npm run adr new "Add entity duplication feature"
# Edit the ADR with context, decision, and consequences
```

2. **Write Failing Test**:
```typescript
it('Should duplicate the selected entity', () => {
    const entity = new GameObject('Original');
    const onDuplicate = jest.fn();
    
    render(<EntityList entities={[entity]} onDuplicate={onDuplicate} />);
    fireEvent.click(screen.getByTestId('duplicate-button'));
    
    expect(onDuplicate).toHaveBeenCalledWith(entity);
});
```

3. **Run Test** (confirm it fails):
```bash
npm test
```

4. **Implement Simplest Solution**:
```typescript
const handleDuplicate = () => {
    onDuplicate(entity);
};

return <button data-testid="duplicate-button" onClick={handleDuplicate}>Duplicate</button>;
```

5. **Run Test** (confirm it passes):
```bash
npm test
```

6. **Refactor** (if needed):
```typescript
const handleDuplicate = useCallback(() => {
    onDuplicate(entity);
}, [entity, onDuplicate]);
```

7. **Commit**:
```bash
git add .
git commit -m "feat: add entity duplication

Implements duplication feature for game entities in the editor.
Refs: #123"
```

## Resources

**Project Documentation:**
- [Feature Flags](../docs/feature-flags.md)
- [Git Conventions](../docs/git-conventions.md)
- [Architecture Decisions](../docs/architecture/decisions/)
- [SparkEngine Copilot Instructions](../../SparkEngineWeb/.github/copilot-instructions.md)

**External References:**
- [React Documentation](https://react.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Conventional Commits](https://www.conventionalcommits.org/)

**Tools:**
- `npm run adr help` - ADR tools documentation

## Questions or Issues?

Refer to existing tests and components for patterns. When in doubt, follow TDD principles and document decisions with ADRs.
