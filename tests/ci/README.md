# Release-Please Changelog Verification

## Overview

This directory contains scripts to verify that the release-please changelog only includes commits that should be present based on feature flag filtering rules.

## How It Works

1. **Feature Flag Filtering** (`scripts/release-please-with-feature-flags.sh`)
   - Rewrites git history to filter commits with disabled feature flags
   - Commits without feature flags always appear
   - Commits with enabled feature flags appear
   - Commits with disabled feature flags are rewritten to `[skip-release]` format

2. **Test Commit Creation** (`tests/ci/create-test-commits.sh`)
   - Creates three test commits:
     - `feat: test with disabled flag` (Feature-Flag: FEATURE_DISABLED_TEST)
     - `feat: test with enabled flag` (Feature-Flag: FEATURE_ADD_COMPONENTS)
     - `feat: test without flag` (no feature flag)

3. **Changelog Verification** (`tests/ci/verify-changelog.sh`)
   - Analyzes git commits and their feature flags
   - Compares against feature flags in `.env.production`
   - Verifies release-please output contains only expected commits
   - Fails if:
     - An expected commit is missing from changelog
     - A filtered commit appears in changelog

## Usage

### Run Verification Manually

```bash
# Run verification on existing release-please output
release-please release-pr --dry-run | bash tests/ci/verify-changelog.sh

# Or verify without input to see expectations
bash tests/ci/verify-changelog.sh
```

### Run Integration Test

```bash
# Full end-to-end test
bash tests/ci/test-changelog-verification.sh
```

### In CI (GitHub Actions)

The workflow `.github/workflows/test-release-please.yml` automatically:
1. Creates test commits
2. Filters git history based on feature flags
3. Runs release-please dry-run
4. Verifies the changelog output
5. Reports results

## Expected Behavior

Given `.env.production`:
```bash
FEATURE_ADD_COMPONENTS=true
FEATURE_DISABLED_TEST=false  # or omitted
```

### Should Appear in Changelog
- ✅ `feat: test with enabled flag` (FEATURE_ADD_COMPONENTS=true)
- ✅ `feat: test without flag` (no feature flag)

### Should NOT Appear
- ❌ `feat: test with disabled flag` (FEATURE_DISABLED_TEST not enabled)

## Verification Output

Success example:
```
[INFO] Verification Results:
[INFO] ====================
[SUCCESS] ✓ Found expected: feat: test with enabled flag
[SUCCESS] ✓ Found expected: feat: test without flag
[SUCCESS] ✓ Correctly filtered: feat: test with disabled flag
[INFO]
[SUCCESS] ====================
[SUCCESS] All checks passed! ✓
[SUCCESS] ====================
```

Failure example:
```
[ERROR] ✗ Missing expected: feat: test without flag
[ERROR] ✗ Unexpected commit found: feat: test with disabled flag
[ERROR] ====================
[ERROR] Verification failed ✗
[ERROR] ====================
```

## Troubleshooting

### "enabled_flags[@]: unbound variable"
Fixed in current version - arrays now properly handle empty cases

### Empty commit subjects
Fixed - script now skips empty commit messages

### "No release-please output provided"
This is expected when running without stdin input - the script shows expectations instead

## Files

- `verify-changelog.sh` - Main verification script
- `create-test-commits.sh` - Creates test commits for CI
- `test-changelog-verification.sh` - Integration test
- `README.md` - This file
