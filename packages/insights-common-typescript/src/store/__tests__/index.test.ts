import { getStore, initStore, restoreStore } from '../..';

describe('src/store', () => {

    beforeEach(() => {
        restoreStore();
    });

    it('Inits the registry with initStore', () => {
        expect(initStore()).toBeTruthy();
    });

    it('getStore returns the initialized store', () => {
        const registry = initStore();
        expect(registry.getStore()).toBe(getStore());
    });

    it('restoreStore resets the registry', () => {
        const registry = initStore();
        restoreStore();
        expect(registry).not.toBe(initStore());
    });

    it('initStore throws if store is already initialized', () => {
        initStore();
        expect(() => initStore()).toThrowError();
    });
});
