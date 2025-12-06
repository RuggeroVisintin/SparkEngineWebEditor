# Feature Flags System

## Overview

The SparkEngineWeb Editor uses a build-time feature flag system that **completely excludes disabled code** from production builds. This is achieved through webpack's DefinePlugin and dead code elimination.

## How It Works

1. **Environment Variables**: Define flags in `.env.development` or `.env.production` (prefixed with `FEATURE_`)
2. **Compile-Time Replacement**: Webpack's DefinePlugin replaces `__FEATURE_FLAGS__` with actual values
3. **Dead Code Elimination**: Webpack removes unreachable code during minification
4. **Type Safety**: TypeScript ensures only valid feature flags are used

## Usage

### Basic Check

```typescript
import { isFeatureEnabled } from './core/featureFlags';

if (isFeatureEnabled('EXPERIMENTAL_SCRIPTING')) {
  // This entire block is removed from production if flag is false
  console.log('Experimental scripting enabled!');
}
```

### With Callback

```typescript
import { withFeature } from './core/featureFlags';

withFeature('DEBUG_MODE', () => {
  console.log('Debug info:', data);
});
```

### Component Conditional Rendering

```typescript
import { isFeatureEnabled } from './core/featureFlags';

export const MyComponent = () => {
  return (
    <>
      <StandardFeature />
      {isFeatureEnabled('BETA_FEATURES') && <BetaFeature />}
    </>
  );
};
```
## Adding New Feature Flags

1. **Add to TypeScript types** in `src/core/featureFlags.ts`:
```typescript
export type FeatureFlag = 
  | 'EXPERIMENTAL_SCRIPTING'
  | 'YOUR_NEW_FEATURE'  // Add here
  | 'DEBUG_MODE';
```

2. **Update the flags array** in `getEnabledFeatures()`:
```typescript
const flags: FeatureFlag[] = [
  'EXPERIMENTAL_SCRIPTING',
  'YOUR_NEW_FEATURE',  // Add here
  'DEBUG_MODE',
];
```

3. **Add to environment files**:

Add feature flags to your local `.env` file, all feature flags must be prefixed with `FEATURE_`

```bash
FEATURE_YOUR_NEW_FEATURE=true
```

## Verification

To verify code is actually removed in production:

1. Build the app: `npm run build`
2. Check the bundle size in `build/static/js/`
3. Search for your feature-flagged code in the minified JS - it should not be present

## Best Practices

1. **Use constants**: Always use string literals, not variables:
   ```typescript
   // ✅ Good - can be optimized away
   if (isFeatureEnabled('DEBUG_MODE')) { }
   
   // ❌ Bad - cannot be optimized away
   const flag = 'DEBUG_MODE';
   if (isFeatureEnabled(flag)) { }
   ```

2. **Feature-flag entire branches**: Wrap complete logical blocks:
   ```typescript
   // ✅ Good
   if (isFeatureEnabled('FEATURE')) {
     // All code here is eliminated
     const data = expensiveOperation();
     doSomething(data);
   }
   
   // ❌ Bad - function still included in bundle
   const data = isFeatureEnabled('FEATURE') ? expensiveOperation() : null;
   ```

3. **Use for experimental features**: Flag risky or incomplete features
4. **Clean up old flags**: Remove flags and associated code once features are stable

## Changelog Integration

When committing code for features controlled by feature flags that are **not yet enabled in production**, use the `Feature-Flag:` footer in your commit message:

```bash
git commit -m "feat: add component palette UI

Feature-Flag: ADD_COMPONENTS"
```

### How it Works

1. **Automatic Processing**: A GitHub Action checks each commit for `Feature-Flag:` footers
2. **Production Check**: The workflow compares the flag against `.env.production`
3. **Changelog Exclusion**: If disabled in production, `Release-As: skip` is automatically added
4. **Automatic Inclusion**: When you enable the flag in `.env.production`, the next release will automatically include all previously skipped commits

### Example Workflow

```bash
# 1. Work on feature-flagged code
git commit -m "feat: implement drag-and-drop

Feature-Flag: ADD_COMPONENTS"

# GitHub Action adds: Release-As: skip (since flag is disabled)

# 2. Continue development
git commit -m "fix: adjust drop zone styling

Feature-Flag: ADD_COMPONENTS"

# Also excluded from changelog

# 3. Enable feature in production
# Edit .env.production: FEATURE_ADD_COMPONENTS=true

# 4. Next release automatically includes all commits
# Both commits now appear in CHANGELOG.md
```

### Compatibility with release-please

This approach is fully compatible with release-please's `OVERRIDE COMMIT MSG` feature. You can include the `Feature-Flag:` footer within override blocks:

```
BEGIN_COMMIT_OVERRIDE
feat: major component system refactor

Complete rewrite of the component architecture.

Feature-Flag: ADD_COMPONENTS
END_COMMIT_OVERRIDE
```

### Testing Locally

Test the feature flag processing before pushing:

```bash
# Process the last commit
./scripts/process-feature-flags.sh

# Process a range of commits
./scripts/process-feature-flags.sh HEAD~5..HEAD

# Process commits since main branch
./scripts/process-feature-flags.sh main..HEAD
```

The script will show you:
- Which flags are enabled/disabled in `.env.production`
- Which commits have `Feature-Flag:` footers
- Whether `Release-As: skip` needs to be added
- Color-coded output for easy verification

## Testing

Feature flags work in Jest tests by falling back to `process.env`:

```typescript
// In your test
process.env.FEATURE_DEBUG_MODE = 'true';

// Test your feature-flagged code
```Test your feature-flagged code
```
