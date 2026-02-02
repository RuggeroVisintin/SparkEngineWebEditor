/**
 * E2E Test Utilities for Feature Flags
 * 
 * Provides helpers to conditionally run e2e tests based on build-time feature flags
 */

// Define available feature flags - keep in sync with src/core/featureFlags.ts
export type FeatureFlag =
    | 'ADD_COMPONENTS';

// Read feature flags from environment at test time
function getFeatureFlags(): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('FEATURE_')) {
            const flagName = key.replace('FEATURE_', '');
            flags[flagName] = process.env[key] === 'true';
        }
    });
    return flags;
}

const FEATURE_FLAGS = getFeatureFlags();

/**
 * Check if a feature is enabled (for inline conditionals)
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    return FEATURE_FLAGS[flag] === true;
}

/**
 * Conditionally run a test suite based on a feature flag
 * If flag is disabled, the entire describe block is skipped
 */
export function describeWithFeature(
    flag: FeatureFlag,
    name: string,
    fn: () => void
): void {
    if (isFeatureEnabled(flag)) {
        describe(name, fn);
    } else {
        describe.skip(`${name} [SKIPPED: FEATURE_${flag} disabled]`, fn);
    }
}

/**
 * Conditionally run a test based on a feature flag
 */
export function testWithFeature(
    flag: FeatureFlag,
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
): void {
    if (isFeatureEnabled(flag)) {
        test(name, async () => {
            await fn();
        }, timeout);
    } else {
        test.skip(`${name} [SKIPPED: FEATURE_${flag} disabled]`, async () => {
            await fn();
        }, timeout);
    }
}

/**
 * Get all enabled features (for debugging)
 */
export function getEnabledFeatures(): FeatureFlag[] {
    const allFlags: FeatureFlag[] = ['ADD_COMPONENTS'];
    return allFlags.filter(flag => isFeatureEnabled(flag));
}
