---
name: Feature Flagging
description: Use this skill when introducing, rolling out, or retiring feature-gated functionality that must be safely controlled at build time and validated in both enabled and disabled states.
---

# Feature Flagging - MANDATORY FOR NEW RISKY OR INCOMPLETE FEATURES

Use this skill when adding functionality that should be hidden, incrementally released, or excluded from production until ready.

## When to Use This Skill

Use feature flags for:
- New user-facing features still in development
- Experimental or high-risk behavior changes
- Incremental rollouts where fallback is required
- Large refactors needing safe release boundaries

Avoid feature flags for:
- Tiny internal refactors with no behavior change
- Permanent code paths that are already production-ready

## Core Rules

1. Use string literals for flag names in checks (`isFeatureEnabled('FLAG_NAME')`)
2. Guard full logical branches, not individual expressions
3. Test both enabled and disabled states
4. Use `Feature-Flag:` commit footer for not-yet-production features
5. Remove stale flags and dead branches after full rollout

## Implementation Workflow

### 1) Define the Flag

Add the new flag to `src/core/featureFlags.ts` type definitions and flag list.

```typescript
export type FeatureFlag =
    | 'EXPERIMENTAL_SCRIPTING'
    | 'ENTITY_DUPLICATION';
```

### 2) Configure Environment

Set environment variables with `FEATURE_` prefix:

```bash
FEATURE_ENTITY_DUPLICATION=true
```

### 3) Guard the Feature

```typescript
import { isFeatureEnabled } from './core/featureFlags';

if (isFeatureEnabled('ENTITY_DUPLICATION')) {
    enableDuplicationFlow();
}
```

### 4) Add Test Coverage

- Unit tests for enabled behavior
- Unit tests for disabled behavior
- E2E tests for flagged flows (when applicable)

Example test setup:

```typescript
process.env.FEATURE_ENTITY_DUPLICATION = 'true';
```

### 5) Commit with Footer

```bash
git commit -m "feat: add entity duplication flow

Feature-Flag: ENTITY_DUPLICATION"
```

### 6) Retire the Flag

Once stable in production:
- Remove checks
- Remove env/config entries
- Remove flag type entry
- Keep only final behavior

## Good vs Bad Patterns

```typescript
// ✅ Good: full branch can be eliminated
if (isFeatureEnabled('DEBUG_MODE')) {
    const data = expensiveOperation();
    logDebugData(data);
}

// ❌ Bad: keeps extra paths alive
const data = isFeatureEnabled('DEBUG_MODE') ? expensiveOperation() : null;
```

```typescript
// ✅ Good: string literal
if (isFeatureEnabled('DEBUG_MODE')) {
    renderDebugPanel();
}

// ❌ Bad: dynamic variable blocks optimization
const flag = 'DEBUG_MODE';
if (isFeatureEnabled(flag)) {
    renderDebugPanel();
}
```

## Definition of Done (Feature-Flagged Work)

- [ ] Flag is declared in `src/core/featureFlags.ts`
- [ ] Environment config uses `FEATURE_` prefix
- [ ] Feature code is fully gated
- [ ] Tests cover enabled + disabled states
- [ ] Commit uses `Feature-Flag:` footer (if not yet in prod)

## Related Skills

- [Acceptance Test Driven Development](acceptance-test-driven-development.md)
- [Test Driven Development](test-driven-development.md)

## References

- [Feature Flags System](../docs/feature-flags.md)
- [Git Conventions](../docs/git-conventions.md)
