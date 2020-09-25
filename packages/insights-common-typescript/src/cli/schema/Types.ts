import { StringMap } from './types/Helpers';
import { SchemaWithTypeName } from './types/Schemas';

export type Buffer = Array<string>;

export interface APIDescriptor {
    path: string;
    components: Components;
}

export interface Components {
    schemas?: StringMap<SchemaWithTypeName>;
}
