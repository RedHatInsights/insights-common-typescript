import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { EmailOptIn, InsightsEmailOptIn } from '../EmailOptIn';

describe('src/components/EmailOptIn', () => {
    it('Builds link for beta', () => {
        render(<EmailOptIn content="foobar" isBeta={ true } bundle="mybundle"/>);
        expect(
            screen.getByText('Open user preferences', {
                selector: 'a'
            })).toHaveAttribute('href', '/beta/user-preferences/notification/mybundle'
        );
    });

    it('Builds link for stable', () => {
        render(<EmailOptIn content="foobar" isBeta={ false } bundle="mybundle"/>);
        expect(screen.getByText('Open user preferences', {
            selector: 'a'
        })).toHaveAttribute('href', '/user-preferences/notification/mybundle');
    });

    it('Builds link using the bundle', () => {
        render(<EmailOptIn content="foobar" isBeta={ false } bundle="abc"/>);
        expect(screen.getByText('Open user preferences', {
            selector: 'a'
        })).toHaveAttribute('href', '/user-preferences/notification/abc');
    });

    describe('Insights component', () => {
        it('Builds link for beta', () => {
            const insights: any = {
                chrome: {
                    isBeta: () => true,
                    getBundle: () => 'mybundle'
                }
            };
            render(<InsightsEmailOptIn content="foobar" chromeAPI={ insights } />);
            expect(
                screen.getByText('Open user preferences', {
                    selector: 'a'
                })).toHaveAttribute('href', '/beta/user-preferences/notification/mybundle'
            );
        });

        it('Builds link for stable', () => {
            const insights: any = {
                chrome: {
                    isBeta: () => false,
                    getBundle: () => 'mybundle'
                }
            };
            render(<InsightsEmailOptIn content="foobar" chromeAPI={ insights } />);
            expect(screen.getByText('Open user preferences', {
                selector: 'a'
            })).toHaveAttribute('href', '/user-preferences/notification/mybundle');
        });

        it('Builds link using the bundle', () => {
            const insights: any = {
                chrome: {
                    isBeta: () => false,
                    getBundle: () => 'abc'
                }
            };
            render(<InsightsEmailOptIn content="foobar" chromeAPI={ insights } />);
            expect(screen.getByText('Open user preferences', {
                selector: 'a'
            })).toHaveAttribute('href', '/user-preferences/notification/abc');
        });
    });
});
