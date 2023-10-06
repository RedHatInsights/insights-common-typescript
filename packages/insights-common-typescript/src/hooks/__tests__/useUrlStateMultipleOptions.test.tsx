import { act, renderHook } from '@testing-library/react-hooks';
import { useUrlStateMultipleOptions } from '../..';
import * as React from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { waitForAsyncEventsHooks } from '../../../test/TestUtils';

const getWrapper = (path?: string): React.FunctionComponent => {
    const Wrapper = (props) => (
        // eslint-disable-next-line testing-library/no-node-access
        <MemoryRouter initialEntries={ path ? [ path ] : undefined } > { props.children } </MemoryRouter>
    );
    return Wrapper;
};

describe('src/hooks/useUrlStateExclusiveOptions', () => {
    it('Uses the default value', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper()
        });

        expect(result.current.state[0]).toEqual([ 'foo' ]);
        expect(result.current.location.search).toEqual('?varname=foo');
    });

    it('Uses the default value with multiple options', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo', 'bar' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper()
        });

        expect(result.current.state[0]).toEqual([ 'foo', 'bar' ]);
        expect(result.current.location.search).toEqual('?varname=foo%2Cbar');
    });

    it('Sets value', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper()
        });

        act(() => {
            result.current.state[1]([ 'baz' ]);
        });

        expect(result.current.state[0]).toEqual([ 'baz' ]);
        expect(result.current.location.search).toEqual('?varname=baz');
    });

    it('Loads from url', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=bar')
        });

        expect(result.current.state[0]).toEqual([ 'bar' ]);
        expect(result.current.location.search).toEqual('?varname=bar');
    });

    it('Loads multiple values from url', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=bar%2Cbaz')
        });

        expect(result.current.state[0]).toEqual([ 'bar', 'baz' ]);
        expect(result.current.location.search).toEqual('?varname=bar%2Cbaz');
    });

    it('Loading from url uses [] if value is not any option', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=captain')
        });

        expect(result.current.state[0]).toEqual([]);
        expect(result.current.location.search).toEqual('');
    });

    it('Ignores case when watching, but preserves case option', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'BAR', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=BaR')
        });

        expect(result.current.state[0]).toEqual([ 'BAR' ]);
        expect(result.current.location.search).toEqual('?varname=BAR');
    });

    it('Loads from url when it changes (and still only accepts initialOptions)', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation(),
                navigate: useNavigate()
            };
        }, {
            wrapper: getWrapper('?varname=bar')
        });

        act(() => {
            result.current.navigate({
                search: '?varname=baz'
            });
        });

        expect(result.current.state[0]).toEqual([ 'baz' ]);
        expect(result.current.location.search).toEqual('?varname=baz');
    });

    it('Works if the url is unset', () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation(),
                navigate: useNavigate()
            };
        }, {
            wrapper: getWrapper('?varname=bar')
        });

        act(() => {
            result.current.navigate({});
        });

        expect(result.current.state[0]).toEqual([]);
        expect(result.current.location.search).toEqual('');
    });

    it('Values not in the options are []', async () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', [ 'foo', 'bar', 'baz' ], [ 'foo' ]),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=box')
        });

        await waitForAsyncEventsHooks();

        expect(result.current.state[0]).toEqual([]);
        expect(result.current.location.search).toEqual('');
    });

    it('If options are undefined, uses what is received', async () => {
        const { result } = renderHook(() => {
            return {
                state: useUrlStateMultipleOptions('varname', undefined),
                location: useLocation()
            };
        }, {
            wrapper: getWrapper('?varname=bOx')
        });

        await waitForAsyncEventsHooks();

        expect(result.current.state[0]).toEqual([ 'bOx' ]);
        expect(result.current.location.search).toEqual('?varname=bOx');
    });
});
