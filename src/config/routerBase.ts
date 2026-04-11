export function toRouterBasename(baseUrl: string): string | undefined {
    const trimmed = baseUrl.trim();
    if (!trimmed || trimmed === '/') {
        return undefined;
    }

    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

    return withoutTrailingSlash || undefined;
}
