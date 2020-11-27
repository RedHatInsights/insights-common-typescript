import { buildApiDescriptor } from '../../src/core/ApiDescriptorBuilder';
import { OpenAPI3 } from '../../src/core/types/OpenAPI3';
import { SchemaType } from '../../src/core/types/ApiDescriptor';
import { readFileSync } from "fs";

const emptyOpenApi: Readonly<OpenAPI3> = {
    info: {
        title: 'My open API',
        version: '1.0.0'
    },
    openapi: 'foobar'
};

describe('src/core/ApiDescriptorBuilder', () => {
    it('does not fail with empty openapi', () => {
        expect(buildApiDescriptor(emptyOpenApi)).toEqual({
            basePath: '',
            components: {
                schemas: {}
            },
            paths: []
        });
    });

    it('gets base path from first server', () => {
        expect(buildApiDescriptor({
            ...emptyOpenApi,
            servers: [
                {
                    name: 'prod',
                    variables: {
                        basePath: {
                            default: '/foo/bar/'
                        }
                    }
                }
            ]
        }).basePath).toBe('/foo/bar/');
    });

    it('Throws if using a default response', () => {
        expect(() => buildApiDescriptor({
            ...emptyOpenApi,
            paths: {
                foo: {
                    get: {
                        responses: {
                            default: {
                                $ref: 'myref'
                            }
                        }
                    }
                }
            }
        })).toThrowError('default response not yet supported');
    });

    it('Throws a component schema is a ref', () => {
        expect(() => buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    foo: {
                        $ref: 'my-ref'
                    }
                }
            }
        })).toThrowError('Invalid reference found at component level');
    });

    it('Throws if a request is a schema', () => {
        expect(() => buildApiDescriptor({
            ...emptyOpenApi,
            paths: {
                foo: {
                    get: {
                        requestBody: {
                            $ref: 'myref'
                        },
                        responses: {
                            200: {
                                description: 'this is my description',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })).toThrowError('Reference for RequestBody or Response is not yet supported');
    });

    it('Throws if a response is a schema', () => {
        expect(() => buildApiDescriptor({
            ...emptyOpenApi,
            paths: {
                foo: {
                    get: {
                        responses: {
                            200: {
                                $ref: 'myref'
                            }
                        }
                    }
                }
            }
        })).toThrowError('Reference for RequestBody or Response is not yet supported');
    });

    it('Identify loops in schema components objects 1', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        type: 'object',
                        properties: {
                            parentFoo: {
                                $ref: '#/components/schemas/Foo'
                            }
                        }
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.properties.parentFoo.referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        additionalProperties: undefined,
                        type: SchemaType.OBJECT,
                        typeName: 'Foo',
                        properties: {
                            parentFoo: {
                                typeName: 'Foo',
                                hasLoop: true,
                                isNullable: false,
                                isOptional: true,
                                referred: undefined
                            }
                        }
                    }
                }
            },
            paths: []
        });
    });

    it('Identify loops in schema components objects 2', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        type: 'object',
                        properties: {
                            bar: {
                                $ref: '#/components/schemas/Bar'
                            }
                        }
                    },
                    Bar: {
                        type: 'object',
                        properties: {
                            foo: {
                                $ref: '#/components/schemas/Foo'
                            }
                        }
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.properties.bar.referred = undefined;
        (descriptor as any).components.schemas.Bar.properties.foo.referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        additionalProperties: undefined,
                        type: SchemaType.OBJECT,
                        typeName: 'Foo',
                        properties: {
                            bar: {
                                hasLoop: true,
                                typeName: 'Bar',
                                isNullable: false,
                                isOptional: true,
                                referred: undefined
                            }
                        }
                    },
                    Bar: {
                        additionalProperties: undefined,
                        type: SchemaType.OBJECT,
                        typeName: 'Bar',
                        properties: {
                            foo: {
                                typeName: 'Foo',
                                isNullable: false,
                                isOptional: true,
                                referred: undefined
                            }
                        }
                    }
                }
            },
            paths: []
        });
    });

    it('Identify loops in schema components objects 3', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        type: 'object',
                        additionalProperties: {
                            $ref: '#/components/schemas/Foo'
                        }
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.additionalProperties.referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        properties: undefined,
                        type: SchemaType.OBJECT,
                        typeName: 'Foo',
                        additionalProperties: {
                            typeName: 'Foo',
                            hasLoop: true,
                            isNullable: false,
                            isOptional: false,
                            referred: undefined
                        }
                    }
                }
            },
            paths: []
        });
    });

    it('Identify loops in schema components array', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Foo'
                        }
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.items.referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        type: SchemaType.ARRAY,
                        typeName: 'Foo',
                        items: {
                            typeName: 'Foo',
                            hasLoop: true,
                            isNullable: false,
                            isOptional: false,
                            referred: undefined
                        }
                    }
                }
            },
            paths: []
        });
    });

    it('Identify loops in schema components anyOf', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        anyOf: [
                            {
                                $ref: '#/components/schemas/Foo'
                            }
                        ]
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.anyOf[0].referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        type: SchemaType.ANY_OF,
                        typeName: 'Foo',
                        anyOf: [
                            {
                                typeName: 'Foo',
                                hasLoop: true,
                                isNullable: false,
                                isOptional: false,
                                referred: undefined
                            }
                        ]
                    }
                }
            },
            paths: []
        });
    });

    it('Identify loops in schema components oneOf', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        oneOf: [
                            {
                                $ref: '#/components/schemas/Foo'
                            }
                        ]
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.oneOf[0].referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        type: SchemaType.ONE_OF,
                        typeName: 'Foo',
                        oneOf: [
                            {
                                typeName: 'Foo',
                                hasLoop: true,
                                isNullable: false,
                                isOptional: false,
                                referred: undefined
                            }
                        ]
                    }
                }
            },
            paths: []
        });
    });

    it('Identify loops in schema components allOf', () => {
        const descriptor = buildApiDescriptor({
            ...emptyOpenApi,
            components: {
                schemas: {
                    Foo: {
                        allOf: [
                            {
                                $ref: '#/components/schemas/Foo'
                            }
                        ]
                    }
                }
            }
        });

        (descriptor as any).components.schemas.Foo.allOf[0].referred = undefined;

        expect(descriptor).toEqual({
            basePath: '',
            components: {
                schemas: {
                    Foo: {
                        type: SchemaType.ALL_OF,
                        typeName: 'Foo',
                        allOf: [
                            {
                                typeName: 'Foo',
                                hasLoop: true,
                                isNullable: false,
                                isOptional: false,
                                referred: undefined
                            }
                        ]
                    }
                }
            },
            paths: []
        });
    });
});
