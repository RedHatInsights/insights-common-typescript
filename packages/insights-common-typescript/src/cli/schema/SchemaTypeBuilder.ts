import { SchemaBase } from './SchemaBase';
import { Buffer, OpenAPI3, StringMap } from './Types';

export class SchemaTypeBuilder extends SchemaBase {

    constructor(openapi: OpenAPI3, buffer: Buffer) {
        super(openapi, buffer);
    }

    public build() {
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
