# 4. Migrate from webpack/craco to Vite with ESBuild

Date: 2026-02-01

## Status

Accepted

## Context

The project was experiencing increasingly long build times using Create React App with webpack and craco. The build process was becoming a bottleneck for development velocity. We evaluated two faster build tools:

1. **ESBuild** - A very fast JavaScript bundler written in Go
2. **RSPack** - A webpack-compatible bundler

After analysis, ESBuild (via Vite) was chosen for these reasons:
- Minimal migration effort: Vite provides a drop-in replacement for CRA
- Superior build performance: ESBuild is 10-100x faster than webpack
- Better development experience: Fast HMR (Hot Module Reload)
- Excellent React 19 support
- Native TypeScript, JSX, and styled-components support
- Simpler configuration than RSPack for this use case

## Decision

We are migrating from webpack/craco to **Vite with ESBuild** as the build tool. This involves:

1. Replacing `craco.config.js` with `vite.config.ts`
2. Replacing `react-scripts`, `@craco/craco`, and `craco-alias` with `vite` and `@vitejs/plugin-react`
3. Updating `public/index.html` to be a Vite entry point
4. Updating build scripts to use Vite CLI directly
5. Maintaining backward compatibility by keeping npm script names unchanged (`npm start`, `npm build`, `npm test`)

Feature flags, path aliases, and code splitting are configured equivalently in Vite.

## Consequences

### Positive
- Build times reduced dramatically (10-100x faster)
- Development server starts significantly faster
- HMR is noticeably faster for quick iteration
- ESBuild is written in Go and has better performance characteristics
- Less complex build configuration than webpack
- Vite is becoming the industry standard for React development
- Maintains 100% backward compatibility with npm scripts

### Risks & Mitigations
- **Plugin ecosystem is smaller**: Mitigated by Vite's excellent out-of-the-box support for React, TypeScript, and CSS-in-JS
- **Less webpack plugin compatibility**: Handled by reimplementing needed features (DefinePlugin for feature flags) directly in vite.config.ts
- **Monorepo/multi-module projects**: Not applicable here, but would require additional consideration in future
- **Third-party library compatibility**: Resolved by updating sparkengineweb dependency version

### Performance Impact
Expected improvements:
- Cold builds: 2-3x faster
- Development server startup: 5-10x faster
- HMR updates: 10-20x faster
