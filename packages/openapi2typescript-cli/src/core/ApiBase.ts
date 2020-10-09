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
import { BufferType, Buffer } from './types/Buffer';

const assertNever = (val: never): never => {
    throw new Error(`Unexpected value ${val}`);
};

export interface Options {
    skipTypes: boolean;
}

export class ApiBase {
    protected readonly api: APIDescriptor;
    protected readonly buffer: Buffer;
    protected readonly options: Options;
    private localBuffer: Array<string>;

    protected constructor(apiDescriptor: APIDescriptor, buffer: Buffer, options?: Partial<Options>) {
        this.api = apiDescriptor;
        this.buffer = buffer;
        this.options = {
            skipTypes: false,
            ...options
        };
        this.localBuffer = [];
    }

    protected properties(properties: Record<string, SchemaOrType>) {
        Object.entries(properties).forEach(([ key, schema ], index, array) => {
            this.appendTemp(`${key}: `);
            this.schema(schema);

            if (array.length !== index + 1) {
                this.appendTemp(',\n');
            }
        });
    }

    protected object(schema: SchemaObject) {
        if (schema.properties || schema.additionalProperties) {
            if (schema.properties && schema.additionalProperties) {
                this.appendTemp('z.union([\n');
            }

            if (schema.properties) {
                this.appendTemp('z.object({\n');
                this.properties(schema.properties);
                this.appendTemp('})\n');
            }

            if (schema.properties && schema.additionalProperties) {
                this.appendTemp(', \n');
            }

            if (schema.additionalProperties) {
                this.appendTemp('z.record(\n');
                this.schema(schema.additionalProperties);
                this.appendTemp(')\n');
            }

            if (schema.properties && schema.additionalProperties) {
                this.appendTemp('])\n');
            }
        } else {
            this.appendTemp('z.unknown()');
        }
    }

    protected array(schema: SchemaArray) {
        this.appendTemp('z.array(\n');
        this.schema(schema.items);
        this.appendTemp(')\n');
    }

    protected schema(schema: SchemaOrType, doNotUseModifiers?: boolean) {
        if (isType(schema)) {
            // Todo: Check if we can use the type instead of the function name
            this.appendTemp(`${this.functionName(schema)}()`);
        } else {
            switch (schema.type) {
                case SchemaType.ALL_OF:
                    let open = 0;
                    schema.allOf.filter(schema => !this.isUnknown(schema)).forEach((localSchema, index, array) => {
                        if (open > 0) {
                            this.appendTemp(',\n');
                        }

                        if (array.length !== index + 1) {
                            ++open;
                            this.appendTemp('z.intersection(\n');
                        }

                        this.schema(localSchema);
                    });
                    for (let i = 0;i < open; ++i) {
                        this.appendTemp(')');
                    }

                    break;
                case SchemaType.ONE_OF:
                    this.appendTemp('z.union([');
                    schema.oneOf.forEach((s, index, array) => {
                        this.schema(s);
                        if (array.length !== index + 1) {
                            this.appendTemp(', ');
                        }
                    });
                    this.appendTemp('])');
                    break;
                case SchemaType.ANY_OF:
                    // Todo: revisit this case, is more complex than just unions
                    // Any_of [A, B, C] => A & Optional(B & C) | B & Optional (A & C) | C & Optional (A & B)
                    // i.e. at least one, but can have everything
                    this.appendTemp('z.union([');
                    schema.anyOf.forEach((s, index, array) => {
                        this.schema(s);
                        if (array.length !== index + 1) {
                            this.appendTemp(', ');
                        }
                    });
                    this.appendTemp('])');
                    break;
                case SchemaType.ENUM:
                    this.appendTemp('z.enum([\n');
                    schema.enum.forEach((e, index, array) => {
                        this.appendTemp(`'${e}'`);
                        if (array.length !== index + 1) {
                            this.appendTemp(',\n');
                        }
                    });
                    this.appendTemp('])\n');
                    break;
                case SchemaType.ARRAY:
                    this.array(schema);
                    break;
                case SchemaType.NUMBER:
                    this.appendTemp('z.number()');
                    break;
                case SchemaType.INTEGER:
                    this.appendTemp('z.number().int()');
                    break;
                case SchemaType.STRING:
                    this.appendTemp('z.string()');
                    if (schema.maxLength !== undefined) {
                        this.appendTemp(`.max(${schema.maxLength})`);
                    }

                    break;
                case SchemaType.BOOLEAN:
                    this.appendTemp('z.boolean()');
                    break;
                case SchemaType.NULL:
                    this.appendTemp('z.null()');
                    break;
                case SchemaType.OBJECT:
                    this.object(schema);
                    break;
                case SchemaType.UNKNOWN:
                    this.appendTemp('z.unknown()');
                    break;
                default:
                    console.log(schema);
                    assertNever(schema);
            }
        }

        if (!doNotUseModifiers) {
            if (schema.isOptional) {
                this.appendTemp('.optional()');
            }

            if (schema.isNullable) {
                this.appendTemp('.nullable()');
            }
        }
    }

    protected deType<T>(type: T | Type<T>): T {
        if (isType(type)) {
            return type.referred as T;
        }

        return type;
    }

    protected appendTemp(...lines: Array<string>) {
        for (const line of lines) {
            this.localBuffer.push(line);
        }
    }

    protected writeTempToBuffer(type: BufferType) {
        this.buffer.write(this.localBuffer.join(''), type);
        this.localBuffer = [];
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
