import { ApiBase, Options } from './ApiBase';
import { APIDescriptor, SchemaWithTypeName, StringMap } from './types/ApiDescriptor';
import { BufferType, Buffer } from './types/Buffer';

export class ApiTypeBuilder extends ApiBase {

    constructor(apiDescriptor: APIDescriptor, buffer: Buffer, options?: Partial<Options>) {
        super(apiDescriptor, buffer, options);
    }

    public build() {
        if (this.api.components?.schemas) {
            const schemas = this.api.components.schemas;
            this.types(schemas);
            this.functionTypes(schemas);
        }
    }

    private types(schemas: StringMap<SchemaWithTypeName>) {
        for (const schema of Object.values(schemas)) {
            this.appendTemp(`export const ${schema.typeName} = ${this.functionName(schema)}();\n`);
            this.writeTempToBuffer(BufferType.TYPES);
            if (!this.options.skipTypes) {
                this.appendTemp(`export type ${schema.typeName} = z.infer<typeof ${schema.typeName}>;\n`);
            }

            this.appendTemp('\n');
            this.writeTempToBuffer(BufferType.TYPES);
        }
    }

    private functionTypes(schemas: StringMap<SchemaWithTypeName>) {
        for (const schema of Object.values(schemas)) {
            this.appendTemp(`export function ${this.functionName(schema)}() {\nreturn `);
            this.schema(schema);
            this.appendTemp(';\n}\n\n');
            this.writeTempToBuffer(BufferType.FUNCTIONS);
        }
    }
}
