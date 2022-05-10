import * as z from 'zod';

interface HasToString {
    toString: () => string;
}
declare type HasToStringOrUndefined = HasToString | Array<HasToString> | undefined;
declare type QueryParamsType = Record<string, HasToStringOrUndefined>;
declare type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
declare abstract class ActionBuilder<T> {
    protected readonly _method: Method;
    protected readonly _url: string;
    protected _queryParams?: QueryParamsType;
    protected _data?: unknown;
    protected _config: any;
    constructor(method: Method, url: string);
    abstract build(): T;
    queryParams(queryParams?: QueryParamsType): this;
    data(data?: unknown): this;
    config(config: any): this;
    protected getMethod(): Method;
    protected getUrl(): string;
    protected getQueryParams(): QueryParamsType | undefined;
    protected getData(): unknown;
    protected buildQueryString(): string;
    protected urlSearchParams(params: QueryParamsType): URLSearchParams;
}

interface ValidatedResponse<Type extends string, Status extends number | undefined, ValueType> {
    type: Type;
    status: Status;
    value: ValueType;
    errors: Record<number, Array<z.ZodError>>;
}
declare class ValidateRule {
    readonly zod: z.ZodTypeAny;
    readonly type: string;
    readonly status: number;
    constructor(zod: z.ZodTypeAny, type: string, status: number);
    toJSON(): {
        type: string;
        status: number;
    };
}
declare const validatedResponse: <Name extends string, Status extends number | undefined, Value>(name: Name, status: Status, value: Value, errors: Record<number, Array<z.ZodError>>) => ValidatedResponse<Name, Status, Value>;
declare const validationResponseTransformer: <I extends unknown, M extends ValidatedResponse<string, number | undefined, unknown>>(x: (response: I) => M) => (response: I) => M;

export { ActionBuilder, Method, QueryParamsType, ValidateRule, ValidatedResponse, validatedResponse, validationResponseTransformer };
