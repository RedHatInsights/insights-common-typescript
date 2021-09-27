import { useCallback, useMemo, useState, ReactNode } from 'react';
import {
    ClearFilterElement,
    ClearFilters,
    EnumElement,
    FilterBase,
    FilterContent,
    Filters,
    SetFilters,
    StandardFilterEnum
} from '../types';

const getFilterItemType = <FilterColumn extends StandardFilterEnum<any>>(
    column: EnumElement<FilterColumn>,
    meta: ColumnsMetada<FilterColumn>
) => {
    const options = meta[column].options;
    if (options) {
        if (options.exclusive) {
            return 'radio';
        } else {
            return 'checkbox';
        }
    }

    return 'text';
};

const getFilterItemValue = <FilterColumn extends StandardFilterEnum<any>>(
    column: EnumElement<FilterColumn>,
    filters: Filters<FilterColumn>,
    meta: ColumnsMetada<FilterColumn>
) => {
    const options = meta[column].options;
    let value: FilterContent = filters[column];
    if (options) {
        if (options.exclude) {
            if (typeof value === 'string') {
                if (options.exclude.includes(value)) {
                    value = '';
                }
            } else {
                if (value) {
                    value = value.filter(v => !options?.exclude?.includes(v));
                }
            }
        }

        if (options.default) {
            if (value === undefined || value === '' || value === []) {
                value = options.default;
            }
        }

        if (value === undefined || value === '') {
            value = options.exclusive === false ? [] : '';
        }
    }

    return value;
};

const filterItem = <FilterColumn extends StandardFilterEnum<any>>(
    column: EnumElement<FilterColumn>,
    filters: Filters<FilterColumn>,
    setFilters: SetFilters<FilterColumn>,
    meta: ColumnsMetada<FilterColumn>
) => ({
        label: meta[column].label,
        type: getFilterItemType(column, meta),
        filterValues: {
            id: `filter-${column}`,
            value: getFilterItemValue(column, filters, meta),
            placeholder: meta[column].placeholder,
            onChange: (_event, value: string | Array<string>) => {
                const options = meta[column].options;
                if (options) {
                    if (options.exclusive) {
                        if (options.exclude?.includes(value as string)) {
                            setFilters[column]('');
                        } else if (options.items.find(i => i.value === value)) {
                            setFilters[column](value);
                        }
                    } else {
                        setFilters[column]((value as Array<string>).filter(v => options.items.find(i => i.value === v)));
                    }
                } else {
                    setFilters[column](value);
                }
            },
            items: meta[column].options?.items
        }
    });

const getChipValue = <FilterColumn extends StandardFilterEnum<any>>(
    value: string,
    items: FilterColumnMetadataOptionsBase<FilterColumn>['items']
) => {
    const found = items.find(i => i.value === value);
    return found?.chipValue ?? value;
};

const getActiveFilterConfigItem = <FilterColumn extends StandardFilterEnum<any>>(
    filters: Filters<FilterColumn>,
    column: EnumElement<FilterColumn>,
    meta: ColumnsMetada<FilterColumn>
) => {
    const value: FilterContent = filters[column];
    let chipsValues: Array<string> = [];
    const options = meta[column].options;
    if (value === undefined || value === '') {
        return undefined;
    }

    if (typeof value === 'string') {
        if (options?.exclude?.includes(value)) {
            return undefined;
        } else {
            chipsValues = [ value ];
        }
    } else {
        if (options?.exclude) {
            chipsValues = value.filter(v => !options?.exclude?.includes(v));
        } else {
            chipsValues = value;
        }
    }

    if (chipsValues.length === 0) {
        return undefined;
    }

    return {
        category: meta[column].label,
        chips: chipsValues.map(v => ({
            name: getChipValue(v, options?.items ?? []),
            value: v,
            isRead: true
        }))
    };
};

interface FilterColumnMetadataOptionsBase<T> {
    exclude?: Array<string>;
    default?: T;
    exclusive?: boolean;
    items: Array<{
        value: string;
        chipValue?: string;
        label: ReactNode
    }>
}

interface FilterColumnMetadataOptionsSingleValue extends FilterColumnMetadataOptionsBase<string> {
    exclusive?: true,
}

interface FilterColumnMetadataOptionsMultipleValue extends FilterColumnMetadataOptionsBase<Array<string>> {
    exclusive?: false,
}

export interface FilterColumnMetadata {
    label: string;
    placeholder: string;
    options?: FilterColumnMetadataOptionsSingleValue | FilterColumnMetadataOptionsMultipleValue;
}

export type ColumnsMetada<Enum extends StandardFilterEnum<any>> = FilterBase<Enum, FilterColumnMetadata>;

export const usePrimaryToolbarFilterConfig = <FilterColumn extends StandardFilterEnum<any>>(
    initEnum: FilterColumn,
    filters: Filters<FilterColumn>,
    setFilters: SetFilters<FilterColumn>,
    clearFilters: ClearFilters<FilterColumn>,
    meta: ColumnsMetada<FilterColumn>,
    deleteTitle?: 'Reset filters'
) => {

    const [ Enum ] = useState(initEnum);

    const filterConfig = useMemo(() => ({
        items: (Object.values(Enum) as unknown as Array<EnumElement<FilterColumn>>).map(
            column => filterItem(column, filters, setFilters, meta)
        )
    }), [ filters, setFilters, meta, Enum ]);

    const onFilterDelete = useCallback((_event, rawFilterConfigs: any[]) => {
        const toClear: ClearFilterElement<FilterColumn> = {};
        for (const element of rawFilterConfigs) {
            const key = Object.keys(
                meta
            ).find(
                key => meta[key].label === element.category
            ) as undefined | EnumElement<FilterColumn>;
            if (key && Object.values(Enum).includes(key)) {
                toClear[key] = element.chips.map(c => c.value);
            } else {
                throw new Error(`Unexpected filter column label found: ${element.category}`);
            }
        }

        clearFilters(toClear);
    }, [ clearFilters, Enum, meta ]);

    const activeFiltersConfig = useMemo(() => {
        const filterConfig: Array<ReturnType<typeof getActiveFilterConfigItem>> = [];
        for (const column of Object.values(Enum) as Array<EnumElement<FilterColumn>>) {
            const config = getActiveFilterConfigItem(filters, column, meta);
            if (config) {
                filterConfig.push(config);
            }
        }

        return {
            filters: filterConfig,
            onDelete: onFilterDelete
        };
    }, [ filters, onFilterDelete, Enum, meta ]);

    return {
        filterConfig,
        activeFiltersConfig,
        deleteTitle
    };
};
