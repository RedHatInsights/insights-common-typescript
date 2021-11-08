type Setter<T> = (val: T | ((prev: T) => T)) => void;

export type StandardFilterEnum<T> = Record<keyof T, string>;
export type FilterContent = string | Array<string> | undefined;

export type EnumElement<Enum> = Enum[keyof Enum];

export type FilterBase<Enum extends StandardFilterEnum<any>, T> = Record<EnumElement<Enum>, T>;
export type OptionalFilterBase<Enum extends StandardFilterEnum<any>, T> = FilterBase<Enum, T | undefined>;

export type Filters<Enum extends StandardFilterEnum<any>> = FilterBase<Enum, FilterContent>;
export type SetFilters<Enum extends StandardFilterEnum<any>> = FilterBase<Enum, Setter<FilterContent>>;
export type ClearFilterElement<Enum extends StandardFilterEnum<any>> = {
    [P in EnumElement<Enum>]?: FilterContent;
};
export type ClearFilters<Enum extends StandardFilterEnum<any>> = (columns: ClearFilterElement<Enum>) => void;

export const stringValue = (val: string | Array<string> | undefined, separator = ','): string => {
    if (val) {
        if (typeof val === 'string') {
            return val;
        }

        return val.join(separator);
    }

    return '';
};

export const arrayValue = (val: string | Array<string> | undefined, separator = ','): Array<string> => {
    if (val) {
        if (typeof val === 'string') {
            return val.split(separator);
        }

        return val;
    }

    return [];
};
