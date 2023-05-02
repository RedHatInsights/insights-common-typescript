import { localUrl } from '../..';
import { Config } from '..';

describe('src/config/Config', () => {

    beforeEach(() => {
        (global as any).insights = undefined;
    });

    it('localUrl does prepend beta to path if running on beta', () => {
        expect(localUrl('/foo/bar', true)).toBe('/preview/foo/bar');
    });

    it('localUrl does not prepend beta to path when not in beta', () => {
        expect(localUrl('/baz/bar', false)).toBe('/baz/bar');
    });

    it('emailPreferences is /user-preferences/email on stable', () => {
        expect(Config.pages.emailPreferences(false, 'insights')).toBe('/user-preferences/notification/insights');
    });

    it('emailPreferences is /preview/user-preferences/email on beta', () => {
        expect(Config.pages.emailPreferences(false, 'insights')).toBe('/user-preferences/notification/insights');
    });
});
