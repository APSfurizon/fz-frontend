import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, filterLoaded } from "@/lib/components/autoInput";
import { ApiAction, ApiErrorResponse, ApiResponse, runRequest } from "../global"
import { UserData } from "../user";
import { getAutoInputPermissions } from "../authentication/register";

export interface RoleInfo {
    roleId: number,
    roleInternalName: string,
    roleDisplayName: string,
    showInNosecount: boolean,
    permanentUsersNumber: number,
    temporaryUsersNumber: number,
    permissionsNumber: number
}

export interface AllRolesResponse extends ApiResponse {
    roles: RoleInfo[]
}

export class GetRolesApiAction implements ApiAction<AllRolesResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "roles/";
}

export interface RoleMember {
    tempRole: boolean,
    displayData: UserData
}

export interface RoleData {
    roleId: number,
    internalName?: string,
    displayName?: string,
    showInAdminCount: boolean,
    enabledPermissions: string[],
    users: RoleMember[],
    roleAdmincountPriority: number
}

export interface RoleDataResponse extends ApiResponse {}

export class GetRoleByIdApiAction implements ApiAction<RoleDataResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "roles";
}

export interface RoleOutputMember {
    userId: number,
    tempRole: boolean
}

export interface RoleOutputData {
    roleInternalName?: string,
    roleDisplayName?: string,
    showInAdminCount: boolean,
    enabledPermissions: string[],
    users: RoleOutputMember[],
    roleAdmincountPriority: number
}

export class UpdateRoleByIdApiAction implements ApiAction<RoleDataResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "roles";
}

export function roleToOutput(view: RoleData): RoleOutputData {
    return {
        roleDisplayName: view.displayName,
        roleInternalName: view.internalName,
        showInAdminCount: view.showInAdminCount,
        enabledPermissions: view.enabledPermissions,
        users: view.users.map(vu => {
            return {
                userId: vu.displayData.userId,
                tempRole: vu.tempRole
            }
        }),
        roleAdmincountPriority: view.roleAdmincountPriority
    };
}

export interface GetPermissionsResponse extends ApiResponse {
    permissions: string[]
}

export class GetPermissionsApiAction implements ApiAction<GetPermissionsResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "roles/permissions";
}

/**
 * Defines the search service to look for permissions
 */
export class AutoInputPermissionsManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputPermissions ().then (results => {
                resolve (filterLoaded(results, filter));
            });
        });
    }

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputPermissions ().then (results => {
                resolve (
                    filterLoaded(results, filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> { return new Promise((resolve, reject) => resolve(true)); };
}