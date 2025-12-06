# Feature Flag Filter - Release Please Plugin

A TypeScript-based release-please plugin that filters commits based on feature flag status in production.

## Features

- ✅ **Type-safe** - Built with TypeScript for better maintainability
- 🚩 **Feature flag aware** - Automatically excludes commits for disabled features
- 🔄 **Auto-includes** - When flags are enabled, previously excluded commits automatically appear
- 🎯 **Standards compliant** - Extends `DefaultChangelogNotes` following release-please patterns

## Installation

```bash
npm install --save-dev ./release-please-plugin-feature-flags
```

## Configuration

In `release-please-config.json`:

```json
{
  "packages": {
    ".": {
      "changelog-notes-type": "release-please-plugin-feature-flag-filter"
    }
  }
}
```

## Usage

Add a `Feature-Flag:` footer to commits that should be excluded when the flag is disabled:

```bash
git commit -m "feat: add component palette

Feature-Flag: ADD_COMPONENTS"
```

The plugin reads `.env.production` to determine which flags are enabled:

```env
FEATURE_ADD_COMPONENTS=false  # Commit will be excluded
FEATURE_ADD_COMPONENTS=true   # Commit will be included
```

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run watch
```

### Testing

```bash
cd tests
node test-plugin.js              # Test with flag disabled
node test-plugin-enabled.js      # Test with flag enabled
```

## How It Works

The plugin extends `DefaultChangelogNotes` and overrides the `buildNotes()` method to:

1. Load production flags from `.env.production`
2. Filter commits based on `Feature-Flag:` footers
3. Pass filtered commits to the parent class for changelog generation

This approach follows release-please's recommended pattern for customizing changelog generation.

## TypeScript Benefits

- **Type safety**: Catches errors at compile time
- **IntelliSense**: Better IDE support and autocomplete
- **Maintainability**: Clear contracts and interfaces
- **Documentation**: Types serve as inline documentation
