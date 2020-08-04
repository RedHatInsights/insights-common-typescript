import { useCallback, useMemo, useState } from 'react';
import { useUrlState } from './useUrlState';

type Unpacked<T> = T extends (infer U)[]  ? U : T;

export const useUrlStateExclusiveOptions = <T extends string, AT extends Array<T>>(name: string, initialOptions: AT, defaultValue?: Unpacked<AT>) => {
    const [ options ] = useState(initialOptions);
    const lowerCaseOptions = useMemo(() => options.map(o => o.trim().toLowerCase()), [ options ]);

    const serializer = useCallback((val: Unpacked<AT> | undefined) => {
        const value = val?.trim().toLowerCase();
        if (value && lowerCaseOptions.includes(value)) {
            return value;
        }

        return undefined;
    }, [ lowerCaseOptions ]);

    const deserializer = useCallback((val: string | undefined) => {
        const value = val?.trim().toLowerCase();
        return lowerCaseOptions.find(v => v === value) as Unpacked<AT> | undefined;
    }, [ lowerCaseOptions ]);

    return useUrlState<Unpacked<AT>>(name, serializer, deserializer, defaultValue);
};
