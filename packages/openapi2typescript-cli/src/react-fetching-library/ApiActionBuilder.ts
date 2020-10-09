import { APIDescriptor, Operation, ParamType } from '../core/types/ApiDescriptor';
import { Buffer, BufferType } from '../core/types/Buffer';
import { ApiActionBuilder } from '../core/ApiActionBuilder';
import { Options } from '../core/ApiBase';

export class ReactFetchingLibraryApiActionBuilder extends ApiActionBuilder {

    constructor(api: APIDescriptor, buffer: Buffer, options?: Partial<Options>) {
        super(api, buffer, options);
        // Required imports
        if (!this.options.skipTypes) {
            buffer.write('import { Action } from \'react-fetching-library\';\n', BufferType.HEADER);
        }

        buffer.write('import { actionBuilder' +
            (this.options.skipTypes ? '' : ', ActionValidatableConfig')
            + ' } from \'openapi2typescript/react-fetching-library\';\n', BufferType.HEADER);
    }

    protected buildActionFunction(operation: Operation) {
        const actionType = this.actionEndpointType(operation.id);
        const payloadType = this.payloadEndpointType(operation.id);

        if (!this.options.skipTypes) {
            this.appendTemp(`export type ${actionType} = Action<${payloadType}, ActionValidatableConfig>;\n`);
        }

        this.appendTemp(`export const ${this.functionEndpointType(operation.id)} = (`);
        if ((operation.parameters && operation.parameters.length > 0) || operation.requestBody) {
            this.appendTemp('params');
            if (!this.options.skipTypes) {
                this.appendTemp(`: ${operation.id}`);
            }
        }

        this.appendTemp(')');

        if (!this.options.skipTypes) {
            this.appendTemp(`: ${actionType}`);
        }

        this.appendTemp(' => {\n');

        // Path params
        this.appendTemp(`const path = \'${this.absolutePath(operation.path)}\'\n`);
        if (operation.parameters) {
            this.filteredParameters(operation.parameters).filter(p => p.type === ParamType.PATH).forEach(param => {
                this.appendTemp(`.replace('{${param.name}}', params['${this.paramName(param.name)}'].toString())\n`);
            });
        }

        this.appendTemp(';\n');

        // Query params
        this.appendTemp('const query = {} as Record<string, any>;\n');
        if (operation.parameters) {
            this.filteredParameters(operation.parameters).filter(p => p.type === ParamType.QUERY).forEach(param => {
                this.appendTemp(`if (params['${this.paramName(param.name)}'] !== undefined) {\n`);
                this.appendTemp(`query['${param.name}'] = params['${this.paramName(param.name)}'].toString();\n`);
                this.appendTemp('}\n\n');
            });
        }

        this.appendTemp(`return actionBuilder('${operation.verb.toUpperCase()}', path)\n`);
        this.appendTemp('.queryParams(query)\n');

        if (operation.requestBody) {
            this.appendTemp('.data(params.body)\n');
        }

        if (operation.responses) {
            this.appendTemp('.config({\nrules:[\n');
            const responses = Object.values(operation.responses);
            responses.forEach((response, index, array) => {
                const responseType = this.responseTypeName(operation.id, response);
                this.appendTemp(`{ status: ${response.status}, zod: ${responseType}, type: '${responseType}' }\n`);
                if (array.length !== index + 1) {
                    this.appendTemp(',\n');
                }
            });
            this.appendTemp(']})\n');
        }

        this.appendTemp('.build();\n');
        this.appendTemp('}\n');
    }

}
