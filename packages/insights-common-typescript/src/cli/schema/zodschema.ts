import { OpenAPI3, StringMap } from 'openapi3-typescript-codegen/dist/schema';
import camelcase from 'camelcase';
import RequestBody = OpenAPI3.RequestBody;

type Buffer = Array<string>;

const isReference = (schema: OpenAPI3.Schema | OpenAPI3.Reference): schema is OpenAPI3.Reference => {
    return schema.hasOwnProperty('$ref');
};

class SchemaBase {
    protected readonly openapi: OpenAPI3;
    protected readonly buffer: Buffer;

    protected constructor(openapi: OpenAPI3, buffer: Buffer) {
        this.openapi = openapi;
        this.buffer = buffer;
    }

    protected properties(properties: StringMap<OpenAPI3.Schema | OpenAPI3.Reference>) {
        Object.entries(properties).forEach(([ key, schema ], index, array) => {
            this.append(`${key}: `);
            this.schema(schema);
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
                this.properties(schema.properties);
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
            return this.append(`${this.functionName(this.refToName(schema.$ref))}()`);
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
                        return this.array({ ...schema, type: 'array' });
                    case 'number':
                        return this.append('z.number()');
                    case 'integer':
                        return this.append('z.number().int()');
                    case 'string':
                        return this.append('z.string()');
                    case 'boolean':
                        return this.append('z.boolean()');
                    case 'null':
                        return this.append('z.null()');
                    case undefined:
                        return this.append('z.unknown()');
                    case 'object':
                        return this.object({ ...schema, type: 'object' });
                }
            }
        }
    }

    protected append(...lines: Array<string>) {
        for (const line of lines) {
            this.buffer.push(line);
        }
    }

    protected refToName(ref: string) {
        const [ last ] = ref.split('/').reverse();
        return last;
    }

    protected deRef(ref: string): OpenAPI3.Schema | OpenAPI3.Reference {
        const schemas = this.openapi?.components?.schemas;
        const schema = schemas && schemas[this.refToName(ref)];
        if (!schema) {
            throw new Error(`Unknown schema found: ${ref}`);
        }

        return schema as OpenAPI3.Schema | OpenAPI3.Reference;
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
            return this.isUnknown(this.deRef(schema.$ref));
        } else {
            if (schema.type === 'object') {
                return !(schema.properties || schema.additionalProperties);
            }

            return !schema.allOf && !schema.oneOf && !schema.oneOf && !schema.enum && schema.type === undefined;
        }
    }
}

export class SchemaTypeBuilder extends SchemaBase {

    constructor(openapi: OpenAPI3, buffer: Buffer) {
        super(openapi, buffer);
        this.build();
    }

    private build() {
        if (this.openapi?.components?.schemas) {
            const schemas = this.openapi.components.schemas;
            this.types(schemas);
            this.functionTypes(schemas);
        }
    }

    private types(schemas: StringMap<OpenAPI3.Schema | OpenAPI3.Reference>) {
        for (const [ typeName ] of Object.entries(schemas)) {
            this.append(`export const ${this.typeName(typeName)} = ${this.functionName(typeName)}();\n`);
            this.append(`export type ${this.typeName(typeName)} = z.infer<typeof ${this.typeName(typeName)}>;\n`);
            this.append('\n');
        }

        this.append('\n');
    }

    private functionTypes(schemas: StringMap<OpenAPI3.Schema | OpenAPI3.Reference>) {
        for (const [ typeName, schema ] of Object.entries(schemas)) {
            this.append(`export function ${this.functionName(typeName)}() {\nreturn `);
            this.schema(schema);
            this.append(';\n}\n\n');
        }
    }
}

type Verb = 'get' | 'post' | 'put' | 'delete';
const Verbs: Array<Verb> = [ 'get', 'post', 'put', 'delete' ];

export class SchemaActionBuilder extends SchemaBase {

    constructor(openapi: OpenAPI3, buffer: Buffer) {
        super(openapi, buffer);
        this.build();
    }

    private build() {
        if (this.openapi?.paths) {
            const paths = this.openapi.paths;
            for (const [ pathKey, path ] of Object.entries(paths)) {
                for (const verb of Verbs) {
                    const currentPath = path[verb];
                    if (currentPath) {
                        this.append(`// ${verb} ${pathKey}\n`);
                        if (currentPath.description) {
                            this.append(
                                ...currentPath.description.split('\n').map(d => `// ${d}\n`)
                            );
                        }

                        this.anonymousType(pathKey, verb, currentPath);
                        this.params(pathKey, verb, currentPath);
                    }
                }
            }
        }
    }

    private filteredParameters(parameters: Array<OpenAPI3.Parameter | OpenAPI3.Reference>) {
        return parameters.filter(p => p && (isReference(p) || p.in !== 'cookie'));
    }

    private anonymousType(path: string, verb: Verb, operation: OpenAPI3.Operation) {
        if (operation.parameters) {
            this.filteredParameters(operation.parameters).forEach(p => {
                if (!isReference(p) && p.schema && !isReference(p.schema)) {
                    const propName = this.anonymousParamTypeName(path, verb, p.name);
                    this.append(`const ${propName} = `);
                    this.schema(p.schema);
                    this.append(';\n');
                    this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
                }
            });
        }

        if (operation.requestBody) {
            const bodySchema = this.requestBodySchema(operation.requestBody);
            if (bodySchema) {
                const propName = this.anonymousParamTypeName(path, verb, 'body');
                this.append(`const ${propName} = `);
                this.schema(bodySchema);
                this.append(';\n');
                this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
            }
        }
    }

    private params(path: string, verb: Verb, operation: OpenAPI3.Operation) {
        if ((operation.parameters && operation.parameters.length > 0) || operation.requestBody) {
            this.append(`export interface ${this.paramsName(path, verb)} {\n`);
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).forEach((p, index, array) => {
                    if (isReference(p)) {
                        throw new Error(`Not sure what to do with this reference ${verb} ${path} ${p.$ref}`);
                    } else {
                        this.append(`'${p.name}'${p.required ? '' : '?'}:`);
                        if (p.schema) {
                            if (isReference(p.schema)) {
                                this.append(this.typeName(this.refToName(p.schema.$ref)));
                            } else {
                                this.append(this.anonymousParamTypeName(path, verb, p.name));
                            }
                        } else {
                            this.append('unknown');
                        }

                        if (array.length !== index + 1) {
                            this.append(',\n');
                        }
                    }
                });
            }

            if (operation.requestBody) {
                const typeName = this.requestBodySchemaTypeName(path, verb, operation.requestBody);
                this.append('body');
                if (isReference(operation.requestBody)) {
                    this.append(``)
                } else {

                }
            }

            this.append('\n}\n\n');
        }
    }

    private requestBodySchema(requestBody: OpenAPI3.RequestBody | OpenAPI3.Reference): OpenAPI3.Schema | undefined {
        if (!isReference(requestBody) && requestBody.content) {
            const keys = Object.keys(requestBody.content);
            if (keys.length > 0) {
                const firtSchema = requestBody.content[keys[0]];
                if (firtSchema && !isReference(firtSchema)) {
                    return firtSchema;
                }
            }
        }

        return undefined;
    }

    private requestBodySchemaTypeName(path: string, verb: Verb, requestBody: OpenAPI3.RequestBody | OpenAPI3.Reference): string {
        if (isReference(requestBody)) {
            return this.typeName(this.refToName(requestBody.$ref));
        }

        if (requestBody.content) {
            const keys = Object.keys(requestBody.content);
            if (keys.length > 0) {
                const firtSchema = requestBody.content[keys[0]];
                if (firtSchema) {
                    if (isReference(firtSchema)) {
                        return this.typeName(this.refToName(firtSchema.$ref));
                    } else {
                        return this.anonymousParamTypeName(path, verb, 'body');
                    }
                }
            }
        }

        throw new Error(`Could find requestBody type for ${verb} ${path}`);
    }

    private anonymousParamTypeName(path: string, verb: Verb, name: string) {
        const paramName = this.paramsName(path, verb);
        const propertyName = camelcase(name, {
            pascalCase: true
        });
        return `${paramName}Param${propertyName}`;
    }

    private paramsName(path: string, verb: Verb) {
        const filteredPath = path
        .replace(/[/{}]/g, '_');
        return camelcase(`${verb}${filteredPath}`, {
            pascalCase: true
        });
    }
}
