interface HasToString {
    toString: () => string;
}

type HasToStringOrUndefined = HasToString | undefined;
export type QueryParamsType = Record<string, HasToStringOrUndefined>;

export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export abstract class ActionBuilder<T> {
    protected readonly _method: Method;
    protected readonly _url: string;
    protected _queryParams?: QueryParamsType;
    protected _data?: unknown;
    protected _config: any;

    public constructor(method: Method, url: string) {
        this._method = method;
        this._url = url;
    }

    public abstract build(): T;

    public queryParams(queryParams?: QueryParamsType) {
        this._queryParams = queryParams;
        return this;
    }

    public data(data?: unknown) {
        this._data = data;
        return this;
    }

    public config(config: any) {
        this._config = config;
        return this;
    }

    protected getMethod() {
        return this._method;
    }

    protected getUrl() {
        return this._url;
    }

    protected getQueryParams() {
        return this._queryParams;
    }

    protected getData() {
        return this._data;
    }

    protected buildQueryString() {
        const parsedURL = new URL(this.getUrl(), 'http://dummybase');
        const querySeparator = parsedURL.searchParams.toString() === '' ? '?' : '&';
        const queryParams = this.getQueryParams();

        if (queryParams) {
            const stringParams = this.stringParams(queryParams);
            const queryString = new URLSearchParams(stringParams).toString();
            if (queryString !== '') {
                return querySeparator + queryString;
            }
        }

        return '';
    }

    protected stringParams(params: QueryParamsType): Record<string, string> {
        return Object.keys(params).reduce((prev, key) => {
            const value = params[key];
            if (value !== undefined) {
                prev[key] = value.toString();
            }

            return prev;
        }, {} as Record<string, string>);
    }
}
