import { Buffer, SchemaBase } from './SchemaBase';
import { APIDescriptor, StringMap, SchemaWithTypeName } from './types/ApiDescriptor';

export class SchemaTypeBuilder extends SchemaBase {

    constructor(apiDescriptor: APIDescriptor, buffer: Buffer) {
        super(apiDescriptor, buffer);
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
            this.append(`export const ${schema.typeName} = ${this.functionName(schema)}();\n`);
            this.append(`export type ${schema.typeName} = z.infer<typeof ${schema.typeName}>;\n`);
            this.append('\n');
        }

        this.append('\n');
    }

    private functionTypes(schemas: StringMap<SchemaWithTypeName>) {
        for (const schema of Object.values(schemas)) {
            this.append(`export function ${this.functionName(schema)}() {\nreturn `);
            this.schema(schema);
            this.append(';\n}\n\n');
        }
    }
}
