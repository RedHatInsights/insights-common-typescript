import { useTransformQueryResponse } from '../..';
import { Action, useMutation, UseQueryResponse } from 'react-fetching-library';
import { renderHook } from '@testing-library/react-hooks';

describe('src/utils/ApiUtils', () => {
    it('transforms a queryResponse payload on status 200', () => {
        const response: UseQueryResponse<string> = {
            payload: '5',
            status: 200,
            error: false,
            loading: false,
            reset: jest.fn(),
            abort: jest.fn(),
            query: jest.fn()
        };

        const { result } = renderHook(() => useTransformQueryResponse(response, (val: string) => +val));
        expect(result.current.payload).toBe(5);
    });

    it('transforms a useMutation return on status 200', () => {
        const useDummyWrapper = () => useMutation<string, string>((() => '' as unknown as Action));

        const response: ReturnType<typeof useDummyWrapper> = {
            payload: '5',
            status: 200,
            error: false,
            loading: false,
            reset: jest.fn(),
            abort: jest.fn(),
            mutate: jest.fn()
        };

        const { result } = renderHook(() => useTransformQueryResponse(response, (val: string) => +val));
        expect(result.current.payload).toBe(5);
    });

    it('Throws error if not using query or mutate', () => {
        const useDummyWrapper = () => useMutation<string, string>((() => '' as unknown as Action));

        const response = {
            payload: '5',
            status: 200,
            error: false,
            loading: false,
            reset: jest.fn(),
            abort: jest.fn(),
            mutatexx: jest.fn()
        } as unknown as ReturnType<typeof useDummyWrapper>;

        const { result } = renderHook(() => useTransformQueryResponse(response, (val: string) => +val));
        expect(() => result.current).toThrowError();
    });

    it('keeps payload if status is not 200', () => {
        const response: UseQueryResponse<string> = {
            payload: 'error response',
            status: 404,
            error: false,
            loading: false,
            reset: jest.fn(),
            abort: jest.fn(),
            query: jest.fn()
        };

        const { result } = renderHook(() => useTransformQueryResponse(response, (val: string) => +val));
        expect(result.current.payload).toBe('error response');
    });

    it('transforms query promises to use the adapters in case of status 200', async () => {
        const response: UseQueryResponse<string> = {
            payload: undefined,
            status: 200,
            error: false,
            loading: false,
            reset: jest.fn(),
            abort: jest.fn(),
            query: jest.fn(() => Promise.resolve({
                payload: '33',
                status: 200,
                error: false
            }))
        };

        const { result } = renderHook(() => useTransformQueryResponse(response, (val: string) => +val));
        const queryResponse = await result.current.query();

        return expect(queryResponse.payload).toBe(33);
    });

    it('keeps query promises to return the payload if status is not 200', async () => {
        const response: UseQueryResponse<string> = {
            payload: undefined,
            status: undefined,
            error: false,
            loading: false,
            reset: jest.fn(),
            abort: jest.fn(),
            query: jest.fn(() => Promise.resolve({
                payload: '33',
                status: 404,
                error: false
            }))
        };

        const { result } = renderHook(() => useTransformQueryResponse(response, (val: string) => +val));
        const queryResponse = await result.current.query();

        return expect(queryResponse.payload).toBe('33');
    });

});
