import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as endpoints from '@redhat-cloud-services/rbac-client';
import { Rbac, RbacPermission } from '../types/Rbac';
import { AccessPagination } from '@redhat-cloud-services/rbac-client/types';

const BASE_PATH = '/api/rbac/v1';
// eslint-disable-next-line new-cap
export const rbacApi = APIFactory(BASE_PATH, endpoints, {
    axios: axiosInstance
});

export class RbacPermissionsBuilder {
    readonly accessPagination: AccessPagination;

    constructor(accessPagination: AccessPagination) {
        this.accessPagination = accessPagination;
    }

    public build(): RbacPermission {
        if (!this.accessPagination?.data || this.accessPagination.data.length === 0) {
            return {};
        }

        const permissions: RbacPermission = {};

        for (const access of this.accessPagination.data) {
            const [ app, what, verb ] = access.permission.split(':');

            if (!permissions[app]) {
                permissions[app] = {};
            }

            if (!permissions[app][what]) {
                permissions[app][what] = [];
            }

            permissions[app][what].push(verb);
        }

        return permissions;
    }
}

export const fetchRBAC = (appQuery: string): Promise<Rbac> =>
    // @ts-expect-error: To ignore return unknown type which is wrong
    rbacApi
    // @ts-expect-error: Bad handling of arguments types in rbac-client
    .getPrincipalAccess(appQuery)
    .then((response: AccessPagination) => new RbacPermissionsBuilder(response))
    .then((builder: RbacPermissionsBuilder): Rbac => new Rbac(builder.build()));

