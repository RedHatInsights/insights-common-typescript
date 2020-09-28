import { StringMap } from './types/Helpers';
import { SchemaWithTypeName, TypeModifiers } from './types/Schemas';
import { Path } from './types/Operation';

export type Buffer = Array<string>;

export interface APIDescriptor {
    basePath: string;
    components: Components;
    paths: Array<Path>;
}

export interface Components {
    schemas?: StringMap<SchemaWithTypeName>;
}

export interface Type<T> extends TypeModifiers {
    typeName: string;
    referred: T;
}
