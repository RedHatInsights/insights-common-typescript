import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { InsightsType, BetaDetector, BetaIf, BetaIfNot, InsightsBetaDetector } from '../../..';

describe('src/components/Beta', () => {

    it('BetaIf renders in beta', () => {
        render(
            <BetaDetector isBeta={ true }>
                <BetaIf>
                    <div>hello</div>
                </BetaIf>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).toBeTruthy();
    });

    it('BetaIf does not render in non-beta', () => {
        render(
            <BetaDetector isBeta={ false }>
                <BetaIf>
                    <div>hello</div>
                </BetaIf>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).toBeFalsy();
    });

    it('BetaIfNot does not render in beta', () => {
        render(
            <BetaDetector isBeta={ true }>
                <BetaIfNot>
                    <div>hello</div>
                </BetaIfNot>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).toBeFalsy();
    });

    it('BetaIfNot renders in non-beta', () => {
        render(
            <BetaDetector isBeta={ false }>
                <BetaIfNot>
                    <div>hello</div>
                </BetaIfNot>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).toBeTruthy();
    });

    it('Mixing BetaIf and BetaIfNot', () => {
        render(
            <BetaDetector isBeta={ true }>
                <BetaIf>
                    <div>foo</div>
                </BetaIf>
                <BetaIfNot>
                    <div>hello</div>
                </BetaIfNot>
            </BetaDetector>
        );
        expect(screen.queryByText('foo')).toBeTruthy();
        expect(screen.queryByText('hello')).toBeFalsy();
    });

    it('Duplicating throws an error', () => {
        const error = jest.spyOn(console, 'error');
        error.mockImplementation(() => '');

        expect(() => {
            render(
                <BetaDetector isBeta={ true }>
                    <BetaIf>
                        <div>foo</div>
                    </BetaIf>
                    <BetaIf>
                        <div>hello</div>
                    </BetaIf>
                </BetaDetector>
            );
        }).toThrowError('Only one of each BetaIf and BetaIfNot is allowed on each BetaDetector');
        error.mockRestore();
    });

    it('Using BetaIf without BetaDetector throws error', () => {
        const error = jest.spyOn(console, 'error');
        error.mockImplementation(() => '');

        expect(() => {
            render(
                <BetaIf>
                    <div>foo</div>
                </BetaIf>
            );
        }).toThrowError('Invalid usage of BetaIf*, must be surrounded by a BetaDetector');
        error.mockRestore();
    });

    it('Other similar tags throw error', () => {
        const error = jest.spyOn(console, 'error');
        error.mockImplementation(() => '');

        expect(() => {
            render(
                <BetaDetector isBeta={ true }>
                    <div>hello</div>
                </BetaDetector>
            );
        }).toThrowError('Only BetaIf and BetaIfNot are accepted Elements in BetaDetector');
        error.mockRestore();
    });

    describe('InsightsBetaDetector', () => {
        it('BetaIf renders in beta', () => {
            render(
                <InsightsBetaDetector insights={ {
                    chrome: {
                        isBeta: () => true
                    }
                } as InsightsType }>
                    <BetaIf>
                        <div>hello</div>
                    </BetaIf>
                </InsightsBetaDetector>
            );
            expect(screen.queryByText('hello')).toBeTruthy();
        });

        it('BetaIf does not render in non-beta', () => {
            render(
                <InsightsBetaDetector insights={ {
                    chrome: {
                        isBeta: () => false
                    }
                } as InsightsType }>
                    <BetaIf>
                        <div>hello</div>
                    </BetaIf>
                </InsightsBetaDetector>
            );
            expect(screen.queryByText('hello')).toBeFalsy();
        });
    });
});
