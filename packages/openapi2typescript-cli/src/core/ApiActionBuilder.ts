import camelcase from 'camelcase';
import {
    APIDescriptor,
    isType,
    Operation,
    Parameter,
    ParameterOrType,
    ParamType,
    RequestBody,
    Response
} from './types/ApiDescriptor';
import { ApiBase, Options } from './ApiBase';
import { Buffer, BufferType } from './types/Buffer';

export abstract class ApiActionBuilder extends ApiBase {

    private unknownTypeFound: boolean;

    constructor(api: APIDescriptor, buffer: Buffer, options?: Partial<Options>) {
        super(api, buffer, options);
        this.unknownTypeFound = false;
        if (!this.options.skipTypes) {
            buffer.write('import { ValidatedResponse } from \'openapi2typescript\';\n', BufferType.HEADER);
        }
    }

    protected abstract buildActionFunction(operation: Operation);

    public build() {
        this.unknownTypeFound = false;

        if (this.api.paths) {
            const paths = this.api.paths;
            for (const path of paths) {
                for (const operation of path.operations) {
                    this.appendTemp(`// ${operation.verb} ${operation.path}\n`);
                    if (operation.description) {
                        this.appendTemp(
                            ...operation.description.split('\n').map(d => `// ${d}\n`)
                        );
                    }

                    this.anonymousTypes(operation);
                    this.params(operation);
                    this.actions(operation);
                    this.appendTemp('\n');

                    this.writeTempToBuffer(BufferType.OPERATIONS);
                }
            }
        }
    }

    protected filteredParameters(parameters: Array<ParameterOrType>) {
        return parameters.map(p => this.deType<Parameter>(p)).filter(p => p.type !== ParamType.COOKIE);
    }

    protected anonymousTypes(operation: Operation) {
        if (operation.parameters) {
            this.filteredParameters(operation.parameters).forEach(p => {
                if (!isType(p.schema)) {
                    const propName = this.anonymousParamTypeName(operation.id, p.name);
                    this.appendTemp(`const ${propName} = `);
                    this.schema(p.schema, true);
                    this.appendTemp(';\n');

                    if (!this.options.skipTypes) {
                        this.appendTemp(`type ${propName} = z.infer<typeof ${propName}>;\n`);
                    }
                }
            });
        }

        if (operation.requestBody) {
            if (!isType(operation.requestBody.schema)) {
                const propName = this.anonymousParamTypeName(operation.id, 'body');
                this.appendTemp(`const ${propName} = `);
                this.schema(operation.requestBody.schema, true);
                this.appendTemp(';\n');
                this.appendTemp(`type ${propName} = z.infer<typeof ${propName}>;\n`);
            }
        }

        for (const response of operation.responses) {
            if (!isType(response.schema)) {
                const propName = this.responseTypeName(operation.id, response);
                this.appendTemp(`const ${propName} = `);
                this.schema(response.schema, true);
                this.appendTemp(';\n');
                if (!this.options.skipTypes) {
                    this.appendTemp(`type ${propName} = z.infer<typeof ${propName}>;\n`);
                }
            }
        }
    }

    protected params(operation: Operation) {
        if ((operation.parameters.length > 0) || operation.requestBody) {
            if (this.options.skipTypes) {
                this.appendTemp(`/*\n Params\n`);
            } else {
                this.appendTemp(`export interface ${operation.id} {\n`);
            }

            if (operation.parameters.length > 0) {
                this.filteredParameters(operation.parameters).forEach((p, index, array) => {
                    const isRequired = !p.schema.isOptional;
                    this.appendTemp(`'${this.paramName(p.name)}'${isRequired ? '' : '?'}:`);
                    if (isType(p.schema)) {
                        this.appendTemp(p.schema.typeName);
                    } else {
                        this.appendTemp(this.anonymousParamTypeName(operation.id, p.name));
                    }

                    if (operation.requestBody || array.length !== index + 1) {
                        this.appendTemp(',\n');
                    }
                });
            }

            if (operation.requestBody) {
                const typeName = this.requestBodySchemaTypeName(operation.id, operation.requestBody);
                this.appendTemp('body');

                if (isType(operation.requestBody.schema) && operation.requestBody.schema.isOptional) {
                    this.appendTemp('?');
                }

                this.appendTemp(`: ${typeName}`);
            }

            if (this.options.skipTypes) {
                this.appendTemp('\n*/\n');
            } else {
                this.appendTemp('\n}\n\n');
            }
        }
    }

    protected actions(operation: Operation) {
        if (operation.responses.length) {
            if (!this.options.skipTypes) {
                const payloadType = this.payloadEndpointType(operation.id);
                this.appendTemp(`export type ${payloadType} = `);

                for (const response of operation.responses) {
                    const responseType = this.responseTypeName(operation.id, response);
                    this.appendTemp(`ValidatedResponse<'${responseType}', ${response.status}, ${responseType}> | `);
                }

                this.appendTemp('ValidatedResponse<\'unknown\', undefined, unknown>;\n');
            }

            this.buildActionFunction(operation);
        }
    }

    protected requestBodySchemaTypeName(operationId: string, requestBody: RequestBody): string {
        if (isType(requestBody.schema)) {
            return requestBody.schema.typeName;
        } else {
            return this.anonymousParamTypeName(operationId, 'body');
        }
    }

    protected responseTypeName(operationId: string, response: Response): string {
        if (isType(response.schema)) {
            return response.schema.typeName;
        } else {
            return this.anonymousParamTypeName(operationId, `Response${response.status}`);
        }
    }

    protected anonymousParamTypeName(operationId: string, name: string) {
        const filteredName = name.replace(/[/{}\[\]:]/g, '_');
        const propertyName = camelcase(filteredName, {
            pascalCase: true
        });
        return `${operationId}Param${propertyName}`;
    }

    protected actionEndpointType(operationId: string) {
        return `Action${operationId}`;
    }

    protected payloadEndpointType(operationId: string) {
        return `${operationId}Payload`;
    }

    protected functionEndpointType(operationId: string) {
        return `action${operationId}`;
    }

    protected absolutePath(path: string) {
        return `${this.api.basePath}${path}`;
    }

    protected paramName(name: string) {
        return camelcase(name.replace(/[:\[\]]/g, '_'));
    }
}
