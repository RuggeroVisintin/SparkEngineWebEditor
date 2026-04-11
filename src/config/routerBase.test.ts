import { toRouterBasename } from './routerBase';

describe('toRouterBasename', () => {
    it('returns undefined for root base', () => {
        expect(toRouterBasename('/')).toBeUndefined();
    });

    it('returns path without trailing slash for repository subpath', () => {
        expect(toRouterBasename('/SparkEngineWebEditor/')).toBe('/SparkEngineWebEditor');
    });

    it('normalizes missing leading slash', () => {
        expect(toRouterBasename('SparkEngineWebEditor/')).toBe('/SparkEngineWebEditor');
    });
});
