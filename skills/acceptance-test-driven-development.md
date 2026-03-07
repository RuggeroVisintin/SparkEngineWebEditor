---
name: Acceptance Test Driven Development
description: Use this skill for new user-facing features where acceptance criteria must drive E2E tests before implementation.
---

# Acceptance Test Driven Development (ATDD) - MANDATORY

**For new features, ATDD is MANDATORY before any implementation begins.**

ATDD is an outside-in development approach where acceptance criteria drive the development of features through end-to-end tests. It ensures that new features meet user requirements before release.

## When to Use ATDD

Use ATDD for:
- **New features** - Complete feature development from user perspective
- **User-facing functionality** - Features with visible behavior changes
- **Breaking changes** - Major refactorings affecting user experience

For small bug fixes or internal refactorings, [TDD](test-driven-development.md) alone may be sufficient.

## ATDD Development Workflow

### Step 1: Collect Acceptance Criteria

Before writing any code, gather acceptance criteria:

**From ticket/issue:**
```markdown
User Story: As a user, I want to duplicate entities in the editor

Acceptance Criteria:
- AC1: Given an entity is selected, when I click "Duplicate", then a copy is created
- AC2: The duplicated entity has the same properties as the original
- AC3: The duplicated entity has a unique name (e.g., "Entity (1)")
- AC4: The duplicated entity is automatically selected after creation
```

**If not provided:**
- Ask stakeholders for clarification
- Document them in the ticket/issue
- Get approval before proceeding

### Step 3: Write E2E Tests from Acceptance Criteria

Map each acceptance criterion to an E2E test:

```typescript
// e2e/entity-duplication.spec.ts
import { test, expect } from '@playwright/test';

// Only run if feature flag is enabled
test.describe('Entity Duplication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Setup test environment
    });

    // AC1: Click duplicate creates a copy
    test('Should duplicate entity when duplicate button clicked', async ({ page }) => {
        // Arrange
        await page.click('[data-testid="entity-1"]');
        const initialCount = await page.locator('[data-testid^="entity-"]').count();
        
        // Act
        await page.click('[data-testid="duplicate-button"]');
        
        // Assert
        const newCount = await page.locator('[data-testid^="entity-"]').count();
        expect(newCount).toBe(initialCount + 1);
    });

    // AC2: Duplicated entity has same properties
    test('Should copy all properties from original entity', async ({ page }) => {
        // Arrange
        await page.click('[data-testid="entity-player"]');
        const originalProps = await page.locator('[data-testid="props-panel"]').textContent();
        
        // Act
        await page.click('[data-testid="duplicate-button"]');
        await page.click('[data-testid="entity-player-1"]');
        
        // Assert
        const duplicatedProps = await page.locator('[data-testid="props-panel"]').textContent();
        expect(duplicatedProps).toContain('Position: (0, 0)'); // Same as original
    });

    // AC3: Duplicated entity has unique name
    test('Should assign unique name to duplicated entity', async ({ page }) => {
        // Act
        await page.click('[data-testid="entity-player"]');
        await page.click('[data-testid="duplicate-button"]');
        
        // Assert
        await expect(page.locator('[data-testid="entity-player-1"]')).toBeVisible();
    });

    // AC4: Duplicated entity is selected
    test('Should auto-select duplicated entity', async ({ page }) => {
        // Act
        await page.click('[data-testid="entity-player"]');
        await page.click('[data-testid="duplicate-button"]');
        
        // Assert
        await expect(page.locator('[data-testid="entity-player-1"]')).toHaveClass(/selected/);
    });
});
```

### Step 4: Run E2E Tests (Confirm Failure)

```bash
npm run test:e2e
# All tests should fail - feature not implemented yet
```

### Step 5: Implement Feature Using TDD

### Step 6: Run E2E Tests (Confirm Pass)

```bash
npm run test:e2e
# All acceptance tests should now pass
```

## ATDD Best Practices

### Writing Acceptance Criteria

**Good Acceptance Criteria:**
- Use Given-When-Then format
- One behavior per criterion
- Testable and measurable
- User-focused (not technical)

**Example:**
```
Given: User has an entity selected
When: User clicks "Duplicate" button
Then: New entity appears with same properties and unique name
```

### E2E Test Guidelines

1. **Test user behavior, not implementation**
   - ✅ Click button, verify result appears
   - ❌ Check internal state variables

2. **Accessibility selectors over data-testid**
   - Stable selectors that won't break with styling changes
   - Seleectors that are meaningful to the end user experience (text, roles, etc)

3. **Keep tests independent**
   - Each test should run in isolation
   - Don't rely on order of execution

4. **Use descriptive test names**
   - ✅ `Should duplicate entity when duplicate button clicked`
   - ❌ `Test duplication`

5. **Avoid over-testing**
   - One E2E test per acceptance criterion
   - Detailed testing belongs in unit tests

## Common ATDD Pitfalls

1. **Starting implementation before E2E tests** - Always write E2E tests first
2. **Missing acceptance criteria** - Document before coding
4. **Over-complicating E2E tests** - Keep them simple and user-focused

## ATDD vs TDD

**ATDD (Outside-In):**
- Validates feature meets user requirements
- E2E tests from user perspective
- Broad coverage, slower execution
- Used for new features

**TDD (Inside-Out):**
- Validates code correctness
- Unit tests for logic
- Narrow coverage, fast execution
- Used for all code changes

**Together:** ATDD ensures you're building the right thing, TDD ensures you're building it right.

## Resources

**Related Skills:**
- [Test-Driven Development](test-driven-development.md)
- [Feature Flagging](feature-flagging.md)

**Testing Tools:**
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)

**Example:**
See project's `e2e/` folder for complete E2E test examples.
