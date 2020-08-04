import { useCallback, useMemo, useState } from 'react';
import { useUrlState } from './useUrlState';

type Unpacked<T> = T extends (infer U)[]  ? U : T;

export const useUrlStateExclusiveOptions = <T extends string, AT extends Array<T>>(name: string, initialOptions: AT, defaultValue?: Unpacked<AT>) => {
    const [ options ] = useState(initialOptions);
    const lowerCaseOptions = useMemo(() => options.map(o => o.trim().toLowerCase()), [ options ]);

    const serializer = useCallback((val: Unpacked<AT> | undefined) => {
        const value = val?.trim().toLowerCase();
        if (value) {
            const index = lowerCaseOptions.indexOf(value);
            if (index !== -1) {
                return options[index];
            }
        }

        return undefined;
    }, [ lowerCaseOptions, options ]);

    const deserializer = useCallback((val: string | undefined) => {
        const value = val?.trim().toLowerCase();
        if (value) {
            const index = lowerCaseOptions.indexOf(value);
            if (index !== -1) {
                return options[index] as Unpacked<AT>;
            }
        }

        return undefined;
    }, [ lowerCaseOptions, options ]);

    return useUrlState<Unpacked<AT>>(name, serializer, deserializer, defaultValue);
};
