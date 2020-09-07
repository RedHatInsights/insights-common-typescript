import { getBaseName } from '../..';

describe('src/utils/getBaseName', () => {
    it('should find the right base name on Stable', () => {
        expect(getBaseName('/insights/foo/bar/baz')).toEqual('/insights/foo');
        expect(getBaseName('/rhcs/bar/bar/baz')).toEqual('/rhcs/bar');
    });

    it('should find the right base name on Beta', () => {
        expect(getBaseName('/beta/insights/foo/bar/baz')).toEqual('/beta/insights/foo');
        expect(getBaseName('/beta/test/fff/bar/baz')).toEqual('/beta/test/fff');
    });

    it('should get app root when only app root is provided', () => {
        expect(getBaseName('/policies')).toEqual('/policies/');
        expect(getBaseName('/beta/policies')).toEqual('/beta/policies/');
    });
});
