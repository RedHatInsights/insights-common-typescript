import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { InsightsType, BetaDetector, BetaIf, BetaIfNot, InsightsBetaDetector } from '../../..';
import '@testing-library/jest-dom';

describe('src/components/Beta', () => {

    it('BetaIf renders in beta', () => {
        render(
            <BetaDetector isBeta={ true }>
                <BetaIf>
                    <div>hello</div>
                </BetaIf>
            </BetaDetector>
        );
        expect(screen.getByText('hello')).toBeInTheDocument();
    });

    it('BetaIf does not render in non-beta', () => {
        render(
            <BetaDetector isBeta={ false }>
                <BetaIf>
                    <div>hello</div>
                </BetaIf>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).not.toBeInTheDocument();
    });

    it('BetaIfNot does not render in beta', () => {
        render(
            <BetaDetector isBeta={ true }>
                <BetaIfNot>
                    <div>hello</div>
                </BetaIfNot>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).not.toBeInTheDocument();
    });

    it('BetaIfNot renders in non-beta', () => {
        render(
            <BetaDetector isBeta={ false }>
                <BetaIfNot>
                    <div>hello</div>
                </BetaIfNot>
            </BetaDetector>
        );
        expect(screen.queryByText('hello')).toBeInTheDocument();
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
        expect(screen.queryByText('foo')).toBeInTheDocument();
        expect(screen.queryByText('hello')).not.toBeInTheDocument();
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
        }).toThrowError();
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
        }).toThrowError();
        error.mockRestore();
    });

    describe('InsightsBetaDetector', () => {
        it('BetaIf renders in beta', () => {
            render(
                <InsightsBetaDetector insights={ {
                    chrome: {
                        isBeta: () => true,
                        getEnvironment: () => 'ci'
                    }
                } as InsightsType }>
                    <BetaIf>
                        <div>hello</div>
                    </BetaIf>
                </InsightsBetaDetector>
            );
            expect(screen.queryByText('hello')).toBeInTheDocument();
        });

        it('BetaIf does not render in non-beta', () => {
            render(
                <InsightsBetaDetector insights={ {
                    chrome: {
                        isBeta: () => false,
                        getEnvironment: () => 'ci'
                    }
                } as unknown as InsightsType }>
                    <BetaIf>
                        <div>hello</div>
                    </BetaIf>
                </InsightsBetaDetector>
            );
            expect(screen.queryByText('hello')).not.toBeInTheDocument();
        });
    });
});
