import { buildApiDescriptor } from '../../src/core/ApiDescriptorBuilder';
import { OpenAPI3 } from '../../src/core/types/OpenAPI3';

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
});
