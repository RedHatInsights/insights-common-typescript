import { isReference, OpenAPI3, StringMap, Buffer } from './Types';

export class SchemaBase {
    protected readonly openapi: OpenAPI3;
    protected readonly buffer: Buffer;

    protected constructor(openapi: OpenAPI3, buffer: Buffer) {
        this.openapi = openapi;
        this.buffer = buffer;
    }

    protected properties(properties: StringMap<OpenAPI3.Schema | OpenAPI3.Reference>, required: Array<string>) {
        Object.entries(properties).forEach(([ key, schema ], index, array) => {
            this.append(`${key}: `);
            this.schema(schema);

            if (!required.includes(key)) {
                this.append('.optional()');
                const realSchema = this.deRef(schema);
                if (realSchema.nullable === undefined) {
                    this.append('.nullable()');
                }
            }

            if (array.length !== index + 1) {
                this.append(',\n');
            }
        });
    }

    protected object(schema: OpenAPI3.Schema & { type: 'object' }) {
        if (schema.properties || schema.additionalProperties) {
            if (schema.properties && schema.additionalProperties) {
                this.append('z.union([\n');
            }

            if (schema.properties) {
                this.append('z.object({\n');
                this.properties(schema.properties, (schema.required ?? []) as Array<string>);
                this.append('})\n');
            }

            if (schema.properties && schema.additionalProperties) {
                this.append(', \n');
            }

            if (schema.additionalProperties) {
                this.append('z.record(\n');
                if (schema.additionalProperties === true) {
                    this.append('z.any()\n');
                } else {
                    this.schema(schema.additionalProperties);
                }

                this.append(')\n');
            }

            if (schema.properties && schema.additionalProperties) {
                this.append('])\n');
            }
        } else {
            this.append('z.unknown()');
        }
    }

    protected array(schema: OpenAPI3.Schema & { type: 'array' }) {
        this.append('z.array(\n');
        if (schema.items) {
            this.schema(schema.items);
        } else {
            this.append('z.any()');
        }

        this.append(')\n');
    }

    protected schema(schema: OpenAPI3.Schema | OpenAPI3.Reference) {
        if (isReference(schema)) {
            this.append(`${this.functionName(this.refToName(schema))}()`);
        } else {
            if (schema.allOf) {
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
            } else if (schema.oneOf) {
                this.append('z.union([');
                schema.oneOf.forEach((s, index, array) => {
                    this.schema(s);
                    if (array.length !== index + 1) {
                        this.append(', ');
                    }
                });
                this.append('])');
            } else if (schema.anyOf) {
                this.append('z.union([');
                schema.anyOf.forEach((s, index, array) => {
                    this.schema(s);
                    if (array.length !== index + 1) {
                        this.append(', ');
                    }
                });
                this.append('])');
            } else if (schema.enum) {
                this.append('z.enum([\n');
                schema.enum.forEach((e, index, array) => {
                    if (schema.type === 'string' || isNaN(e as any)) {
                        this.append(`'${e}'`);
                    } else {
                        this.append(`${e}`);
                    }

                    if (array.length !== index + 1) {
                        this.append(',\n');
                    }
                });
                this.append('])\n');
            } else {
                switch (schema.type) {
                    case 'array':
                        this.array({ ...schema, type: 'array' });
                        break;
                    case 'number':
                        this.append('z.number()');
                        break;
                    case 'integer':
                        this.append('z.number().int()');
                        break;
                    case 'string':
                        this.append('z.string()');
                        break;
                    case 'boolean':
                        this.append('z.boolean()');
                        break;
                    case 'null':
                        this.append('z.null()');
                        break;
                    case undefined:
                        this.append('z.unknown()');
                        break;
                    case 'object':
                        this.object({ ...schema, type: 'object' });
                        break;
                }
            }
        }

        const realSchema = this.deRef(schema);

        if (realSchema.nullable === true) {
            this.append('.nullable()');
        }
    }

    protected append(...lines: Array<string>) {
        for (const line of lines) {
            this.buffer.push(line);
        }
    }

    protected refToName(reference: OpenAPI3.Reference) {
        const [ last ] = reference.$ref.split('/').reverse();
        return last;
    }

    protected deRef<T>(ref: T | OpenAPI3.Reference): T {
        if (isReference(ref)) {
            const path = ref.$ref.split('/');
            if (path.length < 2 && path[0] !== '#') {
                throw new Error(`Invalid reference found ${ref.$ref}`);
            }

            path.shift();
            let current = this.openapi;
            for (const segment of path) {
                const next = current[segment];
                if (!current) {
                    throw new Error(`Invalid reference found ${ref.$ref} when processing ${segment} in context: ${current}`);
                }

                current = next;
            }

            return current as unknown as T;
        }

        return ref;
    }

    protected functionName(name: string) {
        return `zodSchema${name}`;
    }

    protected typeName(name: string) {
        return `${name}`;
    }

    // This function could be easy to break if we introduce any other unknown
    protected isUnknown(schema: OpenAPI3.Schema | OpenAPI3.Reference): boolean {
        if (isReference(schema)) {
            return this.isUnknown(this.deRef(schema));
        } else {
            if (schema.type === 'object') {
                return !(schema.properties || schema.additionalProperties);
            }

            return !schema.allOf && !schema.oneOf && !schema.oneOf && !schema.enum && schema.type === undefined;
        }
    }
}
