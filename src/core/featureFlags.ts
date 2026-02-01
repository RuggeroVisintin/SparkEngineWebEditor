/**
 * Feature Flags System
 * 
 * Provides compile-time feature flags that are eliminated from production builds.
 * Flags are defined in environment variables (prefixed with FEATURE_)
 * and replaced at build time by Vite's define plugin.
 * 
 * Usage:
 * ```typescript
 * import { isFeatureEnabled } from './core/featureFlags';
 * 
 * if (isFeatureEnabled('EXPERIMENTAL_SCRIPTING')) {
 *   // This code will be completely removed in production if flag is false
 * }
 * ```
 */

// Define available feature flags as a const object for type safety
// These will be replaced by Vite define plugin at build time
declare const __FEATURE_FLAGS__: Record<string, boolean>;

export type FeatureFlag =
    | 'ADD_COMPONENTS';

/**
 * Check if a feature flag is enabled
 * This function call will be optimized away by webpack when used with constants
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    if (typeof __FEATURE_FLAGS__ !== 'undefined' && flag in __FEATURE_FLAGS__) {
        return __FEATURE_FLAGS__[flag];
    }

    // Fallback for development without Vite define plugin (e.g., tests)
    const envKey = `FEATURE_${flag}`;
    return import.meta.env[envKey] === 'true';
}

/**
 * Execute a callback only if a feature is enabled
 * Useful for side effects or dynamic imports
 */
export function withFeature<T>(
    flag: FeatureFlag,
    callback: () => T,
    fallback?: () => T
): T | undefined {
    if (isFeatureEnabled(flag)) {
        return callback();
    }
    return fallback ? fallback() : undefined;
}

/**
 * Get all enabled feature flags (useful for debugging)
 */
export function getEnabledFeatures(): FeatureFlag[] {
    const flags: FeatureFlag[] = ['ADD_COMPONENTS'];

    return flags.filter(flag => isFeatureEnabled(flag));
}

/**
 * This is a no-op in production, but can be used in tests to enable features
 */
export function enableFeature(Feature: FeatureFlag): void {
    process.env[`FEATURE_${Feature}`] = 'true';
}

/**
 * This is a no-op in production, but can be used in tests to enable features
 */
export function disableFeature(Feature: FeatureFlag): void {
    process.env[`FEATURE_${Feature}`] = 'false';
}
