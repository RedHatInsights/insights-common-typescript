import { isReference, OpenAPI3 } from './types/OpenAPI3';
import { APIDescriptor } from './Types';
import { StringMap } from './types/Helpers';
import { Schema, SchemaObject, SchemaType, SchemaUnknown, SchemaWithTypeName, Type } from './types/Schemas';

const refToName = (reference: OpenAPI3.Reference) => {
    const [ last ] = reference.$ref.split('/').reverse();
    return last;
};

export interface ApiDescriptorBuilderOptions {
    nonRequiredPropertyIsNull: boolean;
}

class ApiDescriptorBuilder {
    readonly types: StringMap<Type>;
    readonly openapi: Readonly<OpenAPI3>;
    readonly options: ApiDescriptorBuilderOptions;

    constructor(openapi: OpenAPI3, options: Partial<ApiDescriptorBuilderOptions>) {
        this.openapi = openapi;
        this.types = this.getTypesPlaceholders();
        this.options = {
            nonRequiredPropertyIsNull: false,
            ...options
        };
    }

    public build(): APIDescriptor {
        return {
            path: this.getPath(),
            components: this.getSchemaComponents()
        };
    }

    private getSchemaComponents(): StringMap<SchemaWithTypeName> {
        const schemas: StringMap<SchemaWithTypeName> = {};
        if (this.openapi.components?.schemas) {
            for (const [ typeName, schema ] of Object.entries(this.openapi.components.schemas)) {
                if (isReference(schema)) {
                    throw new Error('Invalid reference found at component level');
                } else {
                    schemas[typeName] = {
                        typeName,
                        ...this.getSchema(schema) as Schema
                    };
                }
            }
        }

        return schemas;
    }

    private getSchemaType(schema: OpenAPI3.Schema): Schema {
        if (schema.allOf) {
            return {
                type: SchemaType.ALL_OF,
                allOf: schema.allOf.map(s => this.getSchema(s))
            };
        } else if (schema.oneOf) {
            return {
                type: SchemaType.ONE_OF,
                oneOf: schema.oneOf.map(s => this.getSchema(s))
            };
        } else if (schema.anyOf) {
            return {
                type: SchemaType.ANY_OF,
                anyOf: schema.anyOf.map(s => this.getSchema(s))
            };
        } else if (schema.enum) {
            return {
                type: SchemaType.ENUM,
                enum: schema.enum
            };
        } else if (schema.type) {
            switch (schema.type) {
                case 'array':
                    return {
                        type: SchemaType.ARRAY,
                        items: schema.items ? this.getSchema(schema.items) : {
                            type: SchemaType.UNKNOWN
                        }
                    };
                case 'number':
                    return {
                        type: SchemaType.NUMBER
                    };
                case 'integer':
                    return {
                        type: SchemaType.INTEGER
                    };
                case 'string':
                    return {
                        type: SchemaType.STRING
                    };
                case 'boolean':
                    return {
                        type: SchemaType.BOOLEAN
                    };
                case 'null':
                    return {
                        type: SchemaType.NULL
                    };
                case 'object':
                    return this.getSchemaForObject({ ...schema, type: 'object' });
                default:
                    throw new Error(`Unknown type found: ${schema.type} for schema ${JSON.stringify(schema)}`);
            }
        } else {
            return {
                type: SchemaType.UNKNOWN
            };
        }
    }

    private getSchema(schemaOrRef: OpenAPI3.Schema | OpenAPI3.Reference): Schema | Type {
        if (isReference(schemaOrRef)) {
            const typeName = refToName(schemaOrRef);
            return this.types[typeName];
        } else {
            const schema = this.getSchemaType(schemaOrRef);
            if (schemaOrRef.nullable) {
                schema.isNullable = true;
            }

            return schema;
        }
    }

    private getSchemaForObject(schema: OpenAPI3.Schema & { type: 'object' }): SchemaObject | SchemaUnknown {
        if (schema.properties || schema.additionalProperties) {
            let additionalProperties: SchemaObject['additionalProperties'] = undefined;
            if (schema.additionalProperties) {
                if (schema.additionalProperties === true) {
                    additionalProperties = {
                        type: SchemaType.UNKNOWN
                    };
                } else {
                    additionalProperties = this.getSchema(schema.additionalProperties);
                }
            }

            let properties: SchemaObject['properties'] = undefined;
            if (schema.properties) {
                properties = {};
                for (const [ key, value ] of Object.entries(schema.properties)) {
                    properties[key] = this.getSchema(value);
                    if (schema.required?.includes(key)) {
                        properties[key].isOptional = true;
                        if (this.options.nonRequiredPropertyIsNull) {
                            properties[key].isNullable = true;
                        }
                    }
                }
            }

            return {
                type: SchemaType.OBJECT,
                additionalProperties,
                properties
            };
        }

        return {
            type: SchemaType.UNKNOWN
        };
    }

    private getPath(): string {
        if (this.openapi.servers) {
            const variables = this.openapi.servers[0].variables;
            if (variables?.basePath?.default) {
                return variables.basePath.default;
            }
        }

        return '';
    }

    private getTypesPlaceholders(): StringMap<Type> {
        const types: StringMap<Type> = {};
        if (this.openapi.components?.schemas) {
            for (const [ typeName ] of Object.entries(this.openapi.components.schemas)) {
                types[typeName] = {
                    typeName,
                    schema: null
                } as unknown as Type;
            }
        }

        return types;
    }
}

export const buildApiDescriptor = (openapi: Readonly<OpenAPI3>, options: Partial<ApiDescriptorBuilderOptions>): APIDescriptor => {
    const builder = new ApiDescriptorBuilder(openapi, options);
    return builder.build();
};
