import { SchemaOrType } from './Schemas';
import { Type } from '../Types';

export enum Verb {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

export enum ParamType {
    QUERY =  'query',
    COOKIE = 'cookie',
    HEADER = 'header',
    PATH = 'path'
}

export interface Path {
    path: string;
    operations: Array<Operation>;
}

export interface Operation {
    id: string;
    path: string;
    verb: Verb;
    description?: string;
    parameters: Array<Parameter>;
    requestBody?: RequestBody;
    responses: Array<Response>;

}

export interface Parameter {
    type: ParamType;
    name: string;
    schema: SchemaOrType;
}

export type ParameterOrType = Parameter | Type<Parameter>;

export interface RequestBody {
    schema: SchemaOrType;
}

export interface Response {
    status: string;
    schema: SchemaOrType;
}
