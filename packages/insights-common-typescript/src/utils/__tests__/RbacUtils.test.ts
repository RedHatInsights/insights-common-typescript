import { fetchRBAC, RbacPermissionsBuilder } from '../..';
import { Access, AccessPagination } from '@redhat-cloud-services/rbac-client/types';
import MockAdapter from 'axios-mock-adapter';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';

describe('src/utils/RbacUtils', () => {
    it('RbacPermissionBuilder detects fullAccess', () => {
        const fullAccess: Access[] = [
            {
                permission: 'policies:*:*',
                resourceDefinitions: []
            }
        ];

        const rbac = new RbacPermissionsBuilder({
            data: fullAccess
        }).build();

        expect(rbac).toEqual({
            policies: {
                '*': [ '*' ]
            }
        });
    });

    it('RbacPermissionBuilder detects no access when given other permissions', () => {
        const otherAccess: Access[] = [
            {
                permission: 'policies:foo:bar',
                resourceDefinitions: []
            }
        ];

        const rbac = new RbacPermissionsBuilder({
            data: otherAccess
        }).build();

        expect(rbac).toEqual({
            policies: {
                foo: [ 'bar' ]
            }
        });
    });

    it('RbacPermissionBuilder detects no access', () => {
        const noAccess: Access[] = [];

        const rbac = new RbacPermissionsBuilder({
            data: noAccess
        }).build();

        expect(rbac).toEqual({});
    });

    it('RbacPermissionBuilder detects no access (undef data)', () => {
        const noAccess = undefined as unknown as Access[];

        const rbac = new RbacPermissionsBuilder({
            data: noAccess
        }).build();

        expect(rbac).toEqual({});
    });

    it('RbacPermissionBuilder detects no access (undef access)', () => {
        const rbac = new RbacPermissionsBuilder(undefined as unknown as AccessPagination).build();

        expect(rbac).toEqual({});
    });

    it('RbacPermissionBuilder detects only read', () => {
        const readAccess: Access[] = [
            {
                permission: 'policies:*:read',
                resourceDefinitions: []
            }
        ];

        const rbac = new RbacPermissionsBuilder({
            data: readAccess
        }).build();

        expect(rbac).toEqual({
            policies: {
                '*': [ 'read' ]
            }
        });
    });

    it('RawRbac detects only write', () => {
        const writeAccess: Access[] = [
            {
                permission: 'policies:*:write',
                resourceDefinitions: []
            }
        ];

        const rbac = new RbacPermissionsBuilder({
            data: writeAccess
        }).build();

        expect(rbac).toEqual({
            policies: {
                '*': [ 'write' ]
            }
        });
    });

    it('fetchRBAC fetches the RBAC object', async () => {
        const mock = new MockAdapter(axiosInstance);
        mock.onGet('/api/rbac/v1/access/?application=policies').reply(200,
            {
                data: [
                    {
                        permission: 'policies:*:*',
                        resourceDefinitions: []
                    }
                ]
            }
        );

        const rbac = await fetchRBAC('policies');
        expect(rbac.hasPermission('policies', 'foo', 'bar')).toBeTruthy();
        mock.restore();
    });
});
