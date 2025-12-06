# Feature Flag Filter Plugin Tests

This directory contains test scripts to verify the plugin's behavior locally before using it with release-please.

## Test Files

### `test-plugin.js`
Tests the plugin with feature flags **disabled** in `.env.production`.

**Expected behavior:**
- Commits with `Feature-Flag: ADD_COMPONENTS` footer are excluded from the changelog
- Commits without feature flag footers are included

**Run:**
```bash
node test-plugin.js
```

### `test-plugin-enabled.js`
Tests the plugin with feature flags **enabled** in `.env.production`.

**Expected behavior:**
- All commits are included in the changelog, even those with feature flag footers
- Temporarily modifies `.env.production` and restores it after the test

**Run:**
```bash
node test-plugin-enabled.js
```

## Running Tests

From the tests directory:
```bash
cd release-please-plugin-feature-flags/tests
node test-plugin.js
node test-plugin-enabled.js
```

Or from the workspace root:
```bash
node release-please-plugin-feature-flags/tests/test-plugin.js
node release-please-plugin-feature-flags/tests/test-plugin-enabled.js
```

## What Gets Tested

Both tests simulate:
1. Loading `.env.production` to read feature flag status
2. Processing a list of conventional commits
3. Filtering commits based on `Feature-Flag:` footers
4. Displaying which commits would appear in the changelog

The tests verify the complete workflow that release-please will use during actual releases.
