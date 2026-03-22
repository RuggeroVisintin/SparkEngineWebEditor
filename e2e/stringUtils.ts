export const normalizeComparableString = (value?: string | null): string => {
    return (value ?? '')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};
