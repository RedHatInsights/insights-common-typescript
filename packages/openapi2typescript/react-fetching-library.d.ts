import { Action, ResponseInterceptor } from 'react-fetching-library';
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

declare class ReactFetchingLibraryActionBuilder extends ActionBuilder<Action> {
    build(): Action;
}
declare const actionBuilder: (method: Method, url: string) => ReactFetchingLibraryActionBuilder;

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

interface ActionValidatableConfig {
    rules: Array<ValidateRule>;
}
/**
 * Used for knowingly suppress errors while testing.
 */
declare const suppressValidateError: (times?: number | undefined) => void;
declare const validateSchemaResponseInterceptor: ResponseInterceptor<any, any>;

export { ActionValidatableConfig, ReactFetchingLibraryActionBuilder, actionBuilder, suppressValidateError, validateSchemaResponseInterceptor };
