import camelcase from 'camelcase';
import { SchemaBase } from './SchemaBase';
import { OpenAPI3, Buffer, isReference, Verb } from './Types';

const Verbs: Array<Verb> = [ 'get', 'post', 'put', 'delete' ];
const UNKNOWN_TYPE_NAME = 'Unknown';

export class SchemaActionBuilder extends SchemaBase {

    private unknownTypeFound: boolean;

    constructor(openapi: OpenAPI3, buffer: Buffer) {
        super(openapi, buffer);
        this.unknownTypeFound = false;
    }

    public build() {
        this.unknownTypeFound = false;

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
                    const propName = this.anonymousParamTypeName(path, verb, p.name);
                    this.append(`const ${propName} = `);
                    this.schema(p.schema);
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
                } else {
                    const propName = this.responseTypeName(path, verb, status, response);
                    if (this.unknownTypeFound && propName === UNKNOWN_TYPE_NAME) {
                        this.append(`const ${propName} = z.unknown();\ntype ${propName} = z.infer<typeof ${propName}>;\n`);
                        this.unknownTypeFound = true;
                    }
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

            this.append(`export type ${actionType} = Action<${payloadType}, ActionValidatable>;\n`);
            if (operation.summary) {
                this.append(`\n/** ${operation.summary} */\n`);
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
                    this.append(`.replace('{${param.name}}', params['${this.paramName(param.name)}'].toString())\n`);
                });
            }

            this.append(';\n');

            // Query params
            this.append('const query = {} as Record<string, any>;\n');
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).filter(p => p.in === 'query').forEach(param => {
                    this.append(`if (params['${this.paramName(param.name)}']) {\n`);
                    this.append(`query['{${param.name}}'] = params['${this.paramName(param.name)}'].toString();\n`);
                    this.append('}\n\n');
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

        return UNKNOWN_TYPE_NAME;
    }

    private anonymousParamTypeName(path: string, verb: Verb, name: string) {
        const paramName = this.endpointName(path, verb);
        const filteredName = name.replace(/[/{}\[\]:]/g, '_');
        const propertyName = camelcase(filteredName, {
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
            if (variables?.basePath?.default) {
                return `${variables.basePath.default}${path}`;
            }
        }

        return path;
    }

    private paramName(name: string) {
        return camelcase(name);
    }
}
