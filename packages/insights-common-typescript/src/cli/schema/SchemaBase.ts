import {
    APIDescriptor,
    Type,
    isType,
    Schema,
    SchemaArray,
    SchemaObject,
    SchemaOrType,
    SchemaType,
    SchemaWithTypeName
} from './types/ApiDescriptor';
import { assertNever } from '../../utils/Assert';

export type Buffer = Array<string>;

export class SchemaBase {
    protected readonly api: APIDescriptor;
    protected readonly buffer: Buffer;

    protected constructor(apiDescriptor: APIDescriptor, buffer: Buffer) {
        this.api = apiDescriptor;
        this.buffer = buffer;
    }

    protected properties(properties: Record<string, SchemaOrType>) {
        Object.entries(properties).forEach(([ key, schema ], index, array) => {
            this.append(`${key}: `);
            this.schema(schema);

            if (array.length !== index + 1) {
                this.append(',\n');
            }
        });
    }

    protected object(schema: SchemaObject) {
        if (schema.properties || schema.additionalProperties) {
            if (schema.properties && schema.additionalProperties) {
                this.append('z.union([\n');
            }

            if (schema.properties) {
                this.append('z.object({\n');
                this.properties(schema.properties);
                this.append('})\n');
            }

            if (schema.properties && schema.additionalProperties) {
                this.append(', \n');
            }

            if (schema.additionalProperties) {
                this.append('z.record(\n');
                this.schema(schema.additionalProperties);
                this.append(')\n');
            }

            if (schema.properties && schema.additionalProperties) {
                this.append('])\n');
            }
        } else {
            this.append('z.unknown()');
        }
    }

    protected array(schema: SchemaArray) {
        this.append('z.array(\n');
        this.schema(schema.items);
        this.append(')\n');
    }

    protected schema(schema: SchemaOrType, doNotUseModifiers?: boolean) {
        if (isType(schema)) {
            // Todo: Check if we can use the type instead of the function name
            this.append(`${this.functionName(schema)}()`);
        } else {
            switch (schema.type) {
                case SchemaType.ALL_OF:
                    let open = 0;
                    schema.allOf.filter(schema => !this.isUnknown(schema)).forEach((localSchema, index, array) => {
                        if (open > 0) {
                            this.append(',\n');
                        }

                        if (array.length !== index + 1) {
                            ++open;
                            this.append('z.intersection(\n');
                        }

                        this.schema(localSchema);
                    });
                    for (let i = 0;i < open; ++i) {
                        this.append(')');
                    }

                    break;
                case SchemaType.ONE_OF:
                    this.append('z.union([');
                    schema.oneOf.forEach((s, index, array) => {
                        this.schema(s);
                        if (array.length !== index + 1) {
                            this.append(', ');
                        }
                    });
                    this.append('])');
                    break;
                case SchemaType.ANY_OF:
                    // Todo: revisit this case, is more complex than just unions
                    // Any_of [A, B, C] => A & Optional(B & C) | B & Optional (A & C) | C & Optional (A & B)
                    // i.e. at least one, but can have everything
                    this.append('z.union([');
                    schema.anyOf.forEach((s, index, array) => {
                        this.schema(s);
                        if (array.length !== index + 1) {
                            this.append(', ');
                        }
                    });
                    this.append('])');
                    break;
                case SchemaType.ENUM:
                    this.append('z.enum([\n');
                    schema.enum.forEach((e, index, array) => {
                        this.append(`'${e}'`);
                        if (array.length !== index + 1) {
                            this.append(',\n');
                        }
                    });
                    this.append('])\n');
                    break;
                case SchemaType.ARRAY:
                    this.array(schema);
                    break;
                case SchemaType.NUMBER:
                    this.append('z.number()');
                    break;
                case SchemaType.INTEGER:
                    this.append('z.number().int()');
                    break;
                case SchemaType.STRING:
                    this.append('z.string()');
                    if (schema.maxLength !== undefined) {
                        this.append(`.max(${schema.maxLength})`);
                    }

                    break;
                case SchemaType.BOOLEAN:
                    this.append('z.boolean()');
                    break;
                case SchemaType.NULL:
                    this.append('z.null()');
                    break;
                case SchemaType.OBJECT:
                    this.object(schema);
                    break;
                case SchemaType.UNKNOWN:
                    this.append('z.unknown()');
                    break;
                default:
                    console.log(schema);
                    assertNever(schema);
            }
        }

        if (!doNotUseModifiers) {
            if (schema.isOptional) {
                this.append('.optional()');
            }

            if (schema.isNullable) {
                this.append('.nullable()');
            }
        }
    }

    protected deType<T>(type: T | Type<T>): T {
        if (isType(type)) {
            return type.referred as T;
        }

        return type;
    }

    protected append(...lines: Array<string>) {
        for (const line of lines) {
            this.buffer.push(line);
        }
    }

    protected functionName(type: Type<Schema> | SchemaWithTypeName) {
        return `zodSchema${type.typeName}`;
    }

    protected isUnknown(schemaOrType: SchemaOrType): boolean {
        if (isType(schemaOrType)) {
            return this.isUnknown(schemaOrType.referred);
        } else {
            return schemaOrType.type === SchemaType.UNKNOWN;
        }
    }
}
