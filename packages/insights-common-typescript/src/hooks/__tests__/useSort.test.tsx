import { act, renderHook } from '@testing-library/react-hooks';
import { useSort, Direction, Sort } from '../..';

describe('src/hooks/useSort', () => {
    it('Default Sort is undefined', () => {
        const { result } = renderHook(() => useSort());

        expect(result.current.sortBy).toEqual(undefined);
    });

    it('Creates a Sort object when onSort is called', () => {
        const { result } = renderHook(() => useSort());
        act(() => {
            result.current.onSort(5, 'foo', Direction.DESCENDING);
        });

        expect(result.current.sortBy).toEqual(Sort.by('foo', Direction.DESCENDING));
    });
});
