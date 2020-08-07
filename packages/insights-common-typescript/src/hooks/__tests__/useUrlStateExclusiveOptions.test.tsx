import { act, renderHook } from '@testing-library/react-hooks';
import { useUrlStateExclusiveOptions } from '../..';
import * as React from 'react';
import { MemoryRouter, useLocation, useHistory } from 'react-router';
import { waitForAsyncEventsHooks } from '../../../test/TestUtils';

const getWrapper = (path?: string): React.FunctionComponent => {
    const Wrapper = (props) => (
        <MemoryRouter initialEntries={ path ? [ path ] : undefined } > { props.children } </MemoryRouter>
    );
    return Wrapper;
};

describe('src/hooks/useUrlStateExclusiveOptions', () => {
    it('Uses the default value', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper()
        });

        expect(result.current.state[0]).toEqual('foo');
        expect(result.current.location.search).toEqual('?varname=foo');
    });

    it('Sets value', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper()
        });

        act(() => {
            result.current.state[1]('baz');
        });

        expect(result.current.state[0]).toEqual('baz');
        expect(result.current.location.search).toEqual('?varname=baz');
    });

    it('Loads from url', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=bar')
        });

        expect(result.current.state[0]).toEqual('bar');
        expect(result.current.location.search).toEqual('?varname=bar');
    });

    it('Loading from url uses undefined if value is not any option', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=captain')
        });

        expect(result.current.state[0]).toEqual(undefined);
        expect(result.current.location.search).toEqual('?');
    });

    it('Ignores case when watching, but preserves case option', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'BAR', 'baz' ], 'foo'),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=BaR')
        });

        expect(result.current.state[0]).toEqual('BAR');
        expect(result.current.location.search).toEqual('?varname=BAR');
    });

    it('Loads from url when it changes (and still only accepts initialOptions)', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation(),
                history: useHistory()
            };
        }, {
            wrapper: getWrapper('?varname=bar')
        });

        act(() => {
            result.current.history.replace({
                search: '?varname=baz'
            });
        });

        expect(result.current.state[0]).toEqual('baz');
        expect(result.current.location.search).toEqual('?varname=baz');
    });

    it('Works if the url is unset', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation(),
                history: useHistory()
            };
        }, {
            wrapper: getWrapper('?varname=bar')
        });

        act(() => {
            result.current.history.replace({});
        });

        expect(result.current.state[0]).toEqual(undefined);
        expect(result.current.location.search).toEqual('');
    });

    it('Values not in the options are undefined', async () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateExclusiveOptions('varname', [ 'foo', 'bar', 'baz' ], 'foo'),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=box')
        });

        await waitForAsyncEventsHooks();

        expect(result.current.state[0]).toEqual(undefined);
        expect(result.current.location.search).toEqual('?');
    });
});
