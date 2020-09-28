import camelcase from 'camelcase';
import { Buffer, SchemaBase } from './SchemaBase';
import { Operation, APIDescriptor, isType, Parameter, ParameterOrType, ParamType, RequestBody, Response } from './types/ApiDescriptor';

export class SchemaActionBuilder extends SchemaBase {

    private unknownTypeFound: boolean;

    constructor(api: APIDescriptor, buffer: Buffer) {
        super(api, buffer);
        this.unknownTypeFound = false;
    }

    public build() {
        this.unknownTypeFound = false;

        if (this.api.paths) {
            const paths = this.api.paths;
            for (const path of paths) {
                for (const operation of path.operations) {
                    this.append(`// ${operation.verb} ${operation.path}\n`);
                    if (operation.description) {
                        this.append(
                            ...operation.description.split('\n').map(d => `// ${d}\n`)
                        );
                    }

                    this.anonymousTypes(operation);
                    this.params(operation);
                    this.actions(operation);
                    this.append('\n');
                }
            }
        }
    }

    private filteredParameters(parameters: Array<ParameterOrType>) {
        return parameters.map(p => this.deType<Parameter>(p)).filter(p => p.type !== ParamType.COOKIE);
    }

    private anonymousTypes(operation: Operation) {
        if (operation.parameters) {
            this.filteredParameters(operation.parameters).forEach(p => {
                if (!isType(p.schema)) {
                    const propName = this.anonymousParamTypeName(operation.id, p.name);
                    this.append(`const ${propName} = `);
                    this.schema(p.schema, true);
                    this.append(';\n');
                    this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
                }
            });
        }

        if (operation.requestBody) {
            if (!isType(operation.requestBody.schema)) {
                const propName = this.anonymousParamTypeName(operation.id, 'body');
                this.append(`const ${propName} = `);
                this.schema(operation.requestBody.schema, true);
                this.append(';\n');
                this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
            }
        }

        for (const response of operation.responses) {
            if (!isType(response.schema)) {
                const propName = this.responseTypeName(operation.id, response);
                this.append(`const ${propName} = `);
                this.schema(response.schema, true);
                this.append(';\n');
                this.append(`type ${propName} = z.infer<typeof ${propName}>;\n`);
            }
        }
    }

    private params(operation: Operation) {
        if ((operation.parameters.length > 0) || operation.requestBody) {
            this.append(`export interface ${operation.id} {\n`);
            if (operation.parameters.length > 0) {
                this.filteredParameters(operation.parameters).forEach((p, index, array) => {
                    const isRequired = !p.schema.isOptional;
                    this.append(`'${this.paramName(p.name)}'${isRequired ? '' : '?'}:`);
                    if (isType(p.schema)) {
                        this.append(p.schema.typeName);
                    } else {
                        this.append(this.anonymousParamTypeName(operation.id, p.name));
                    }

                    if (operation.requestBody || array.length !== index + 1) {
                        this.append(',\n');
                    }
                });
            }

            if (operation.requestBody) {
                const typeName = this.requestBodySchemaTypeName(operation.id, operation.requestBody);
                this.append('body');

                if (isType(operation.requestBody.schema) && operation.requestBody.schema.isOptional) {
                    this.append('?');
                }

                this.append(`: ${typeName}`);
            }

            this.append('\n}\n\n');
        }
    }

    private actions(operation: Operation) {
        if (operation.responses.length) {
            const actionType = this.actionEndpointType(operation.id);
            const payloadType = this.payloadEndpointType(operation.id);
            this.append(`export type ${payloadType} = `);

            for (const response of operation.responses) {
                const responseType = this.responseTypeName(operation.id, response);
                this.append(`ValidatedResponse<'${responseType}', ${response.status}, ${responseType}> | `);
            }

            this.append('ValidatedResponse<\'unknown\', undefined, unknown>;\n');

            this.append(`export type ${actionType} = Action<${payloadType}, ActionValidatable>;\n`);

            this.append(`export const ${this.functionEndpointType(operation.id)} = (`);
            if ((operation.parameters && operation.parameters.length > 0) || operation.requestBody) {
                this.append(`params: ${operation.id}`);
            }

            this.append(`): ${actionType} => {\n`);

            // Path params
            this.append(`const path = \'${this.absolutePath(operation.path)}\'\n`);
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).filter(p => p.type === ParamType.PATH).forEach(param => {
                    this.append(`.replace('{${param.name}}', params['${this.paramName(param.name)}'].toString())\n`);
                });
            }

            this.append(';\n');

            // Query params
            this.append('const query = {} as Record<string, any>;\n');
            if (operation.parameters) {
                this.filteredParameters(operation.parameters).filter(p => p.type === ParamType.QUERY).forEach(param => {
                    this.append(`if (params['${this.paramName(param.name)}'] !== undefined) {\n`);
                    this.append(`query['${param.name}'] = params['${this.paramName(param.name)}'].toString();\n`);
                    this.append('}\n\n');
                });
            }

            this.append(`return actionBuilder('${operation.verb.toUpperCase()}', path)\n`);
            this.append('.queryParams(query)\n');

            if (operation.requestBody) {
                this.append('.data(params.body)\n');
            }

            if (operation.responses) {
                this.append('.config({\nrules:[\n');
                const responses = Object.values(operation.responses);
                responses.forEach((response, index, array) => {
                    const responseType = this.responseTypeName(operation.id, response);
                    this.append(`{ status: ${response.status}, zod: ${responseType}, type: '${responseType}' }\n`);
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

    private requestBodySchemaTypeName(operationId: string, requestBody: RequestBody): string {
        if (isType(requestBody.schema)) {
            return requestBody.schema.typeName;
        } else {
            return this.anonymousParamTypeName(operationId, 'body');
        }
    }

    private responseTypeName(operationId: string, response: Response): string {
        if (isType(response.schema)) {
            return response.schema.typeName;
        } else {
            return this.anonymousParamTypeName(operationId, `Response${response.status}`);
        }
    }

    private anonymousParamTypeName(operationId: string, name: string) {
        const filteredName = name.replace(/[/{}\[\]:]/g, '_');
        const propertyName = camelcase(filteredName, {
            pascalCase: true
        });
        return `${operationId}Param${propertyName}`;
    }

    private actionEndpointType(operationId: string) {
        return `Action${operationId}`;
    }

    private payloadEndpointType(operationId: string) {
        return `${operationId}Payload`;
    }

    private functionEndpointType(operationId: string) {
        return `action${operationId}`;
    }

    private absolutePath(path: string) {
        return `${this.api.basePath}${path}`;
    }

    private paramName(name: string) {
        return camelcase(name.replace(/[:\[\]]/g, '_'));
    }
}
