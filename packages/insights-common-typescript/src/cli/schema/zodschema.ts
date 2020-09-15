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

            let current;
            for (const segment of path) {
                if (segment === '#') {
                    current = this.openapi;
                } else {
                    const next = current[segment];
                    if (!current) {
                        throw new Error(`Invalid reference found ${ref.$ref} when processing ${segment} in context: ${current}`);
                    }

                    current = next;
                }
            }

            return current as T;
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
            // Making top-level schemas required unless `required` is defined
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

                        this.anonymousTypes(pathKey, verb, currentPath);
                        this.params(pathKey, verb, currentPath);
                        this.actions(pathKey, verb, currentPath);
                        this.append('\n');
                    }
                }
            }
        }
    }

    private filteredParameters(parameters: Array<OpenAPI3.Parameter | OpenAPI3.Reference>) {
        return parameters.map(p => this.deRef(p)).filter(p => p && p.in !== 'cookie');
    }

    private anonymousTypes(path: string, verb: Verb, operation: OpenAPI3.Operation) {
        if (operation.parameters) {
            this.filteredParameters(operation.parameters).forEach(p => {
                if (p.schema && !isReference(p.schema)) {
                    const isRequired = !!p.required || p.in === 'path';
                    const propName = this.anonymousParamTypeName(path, verb, p.name);
                    this.append(`const ${propName} = `);
                    this.schema({ ...p.schema, required: isRequired });
                    this.append(';\n');
                    this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
                }
            });
        }

        if (operation.requestBody) {
            const bodySchema = this.requestBodyOrResponseSchema(operation.requestBody);
            if (bodySchema) {
                const propName = this.anonymousParamTypeName(path, verb, 'body');
                this.append(`const ${propName} = `);
                this.schema(bodySchema);
                this.append(';\n');
                this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
            }
        }

        if (operation.responses) {
            for (const [ status, response ] of Object.entries(operation.responses)) {
                const responseSchema = this.requestBodyOrResponseSchema(response);
                if (responseSchema) {
                    const propName = this.responseTypeName(path, verb, status, response);
                    this.append(`const ${propName} = `);
                    this.schema(responseSchema);
                    this.append(';\n');
                    this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
                }
            }
        }
    }

    private params(path: string, verb: Verb, operation: OpenAPI3.Operation) {
        if ((operation.parameters && operation.parameters.length > 0) || operation.requestBody) {
            this.append(`export interface ${this.endpointName(path, verb)} {\n`);
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).forEach((p, index, array) => {
                    const isRequired = !!p.required || p.in === 'path';
                    this.append(`'${this.paramName(p.name)}'${isRequired ? '' : '?'}:`);
                    if (p.schema) {
                        if (isReference(p.schema)) {
                            this.append(this.typeName(this.refToName(p.schema)));
                        } else {
                            this.append(this.anonymousParamTypeName(path, verb, p.name));
                        }
                    } else {
                        this.append('unknown');
                    }

                    if (operation.requestBody || array.length !== index + 1) {
                        this.append(',\n');
                    }
                });
            }

            if (operation.requestBody) {
                const typeName = this.requestBodySchemaTypeName(path, verb, operation.requestBody);
                this.append('body');
                if (isReference(operation.requestBody)) {
                    this.append(`: ${typeName}`);
                } else {
                    if (!operation.requestBody.required) {
                        this.append('?');
                    }

                    this.append(`: ${typeName}`);
                }
            }

            this.append('\n}\n\n');
        }
    }

    private actions(path: string, verb: Verb, operation: OpenAPI3.Operation) {
        if (operation.responses) {
            const actionType = this.actionEndpointType(path, verb);
            const payloadType = this.payloadEndpointType(path, verb);
            this.append(`export type ${payloadType} = `);

            const responsesEntries = Object.entries(operation.responses);
            if (responsesEntries.length > 0) {
                responsesEntries.forEach(([ status, response ]) => {
                    const responseType = this.responseTypeName(path, verb, status, response);
                    this.append(`ValidatedResponse<'${responseType}',${status}, ${responseType}>`);

                    this.append('| ');
                });
            }

            this.append('ValidatedResponse<\'unknown\', undefined, unknown>;\n');

            this.append(`export type ${actionType} = Action<${payloadType}, ActionValidatable>;`);
            if (operation.summary) {
                this.append(`/** ${operation.summary} /\n`);
            }

            this.append(`export const ${this.functionEndpointType(path, verb)} = (`);
            if ((operation.parameters && operation.parameters.length > 0) || operation.requestBody) {
                this.append(`params: ${this.endpointName(path, verb)}`);
            }

            this.append(`): ${actionType} => {\n`);

            // Path params
            this.append(`const path = \'${this.absolutePath(path)}\'\n`);
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).filter(p => p.in === 'path').forEach(param => {
                    this.append(`.replace('{${param.name}}', params.${this.paramName(param.name)}.toString())\n`);
                });
            }

            this.append(';\n');

            // Query params
            this.append('const query = {} as Record<string, any>;');
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).filter(p => p.in === 'query').forEach(param => {
                    this.append(`if (params.${this.paramName(param.name)}) {\n`);
                    this.append(`query['{${param.name}}'] = params.${this.paramName(param.name)}.toString()\n`);
                    this.append('}\n');
                });
            }

            this.append(`return actionBuilder('${verb.toUpperCase()}', path)\n`);
            this.append('.queryParams(query)\n');

            if (operation.requestBody) {
                this.append('.data(params.body)\n');
            }

            if (operation.responses) {
                this.append('.config({\nrules:[\n');
                const entries = Object.entries(operation.responses);
                entries.forEach(([ status, response ], index, array) => {
                    const responseType = this.responseTypeName(path, verb, status, response);
                    this.append(`{ status: ${status}, zod: ${responseType} }\n`);
                    if (array.length !== index + 1) {
                        this.append(',\n');
                    }
                });
                this.append(']})\n');
            }

            this.append('.build();\n');
            this.append('}\n');
        }
    }

    private requestBodyOrResponseSchema(
        requestOrResponse: OpenAPI3.RequestBody | OpenAPI3.Response | OpenAPI3.Reference): OpenAPI3.Schema | undefined {
        if (!isReference(requestOrResponse) && requestOrResponse.content) {
            const keys = Object.keys(requestOrResponse.content);
            if (keys.length > 0) {
                const firtSchema = requestOrResponse.content[keys[0]].schema;
                if (firtSchema && !isReference(firtSchema)) {
                    return firtSchema;
                }
            }
        }

        return undefined;
    }

    private requestBodySchemaTypeName(path: string, verb: Verb, requestBody: OpenAPI3.RequestBody | OpenAPI3.Reference): string {
        if (isReference(requestBody)) {
            return this.typeName(this.refToName(requestBody));
        }

        if (requestBody.content) {
            const keys = Object.keys(requestBody.content);
            if (keys.length > 0) {
                const firtSchema = requestBody.content[keys[0]].schema;
                if (firtSchema) {
                    if (isReference(firtSchema)) {
                        return this.typeName(this.refToName(firtSchema));
                    } else {
                        return this.anonymousParamTypeName(path, verb, 'body');
                    }
                }
            }
        }

        throw new Error(`Could find requestBody type for ${verb} ${path}`);
    }

    private responseTypeName(path: string, verb: Verb, status: string, response: OpenAPI3.Response | OpenAPI3.Reference): string {
        if (isReference(response)) {
            return this.typeName(this.refToName(response));
        } else if (response.content) {
            const keys = Object.keys(response.content);
            if (keys.length > 0) {
                const firtSchema = response.content[keys[0]].schema;
                if (firtSchema && isReference(firtSchema)) {
                    return this.typeName(this.refToName(firtSchema));
                } else {
                    return this.anonymousParamTypeName(path, verb, `Response${status}`);
                }
            }
        }

        throw new Error(`Undefined response type for: ${verb} ${path} ${status}`);
    }

    private anonymousParamTypeName(path: string, verb: Verb, name: string) {
        const paramName = this.endpointName(path, verb);
        const propertyName = camelcase(name, {
            pascalCase: true
        });
        return `${paramName}Param${propertyName}`;
    }

    private endpointName(path: string, verb: Verb) {
        const filteredPath = path
        .replace(/[/{}]/g, '_');
        return camelcase(`${verb}${filteredPath}`, {
            pascalCase: true
        });
    }

    private actionEndpointType(path: string, verb: Verb) {
        return `Action${this.endpointName(path, verb)}`;
    }

    private payloadEndpointType(path: string, verb: Verb) {
        return `${this.endpointName(path, verb)}Payload`;
    }

    private functionEndpointType(path: string, verb: Verb) {
        return `action${this.endpointName(path, verb)}`;
    }

    private absolutePath(path: string) {
        if (this.openapi.servers) {
            const variables = this.openapi.servers[0].variables;
            if (variables && variables.basePath) {
                return `${variables.basePath}${path}`;
            }
        }

        return path;
    }

    private paramName(name: string) {
        return camelcase(name);
    }
}
