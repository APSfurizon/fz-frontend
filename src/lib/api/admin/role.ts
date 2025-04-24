import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, filterLoaded } from "@/lib/components/autoInput";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType, runRequest } from "../global"
import { UserData } from "../user";
import { FormApiAction, FormDTOBuilder } from "@/lib/components/dataForm";
import { CACHED_PERMISSIONS, CachedPermissions } from "@/lib/cache/cache";

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

export class GetRolesApiAction extends ApiAction<AllRolesResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
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

export class GetRoleByIdApiAction extends ApiAction<RoleDataResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
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

export interface AddRoleApiData {
    internalName: string
}

export interface AddRoleApiResponse extends ApiResponse {
    roleId: number
}

export class AddRoleDTOBuilder implements FormDTOBuilder<AddRoleApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: AddRoleApiData = {
            internalName: data.get("internalName")!.toString ()
        };
        return toReturn;
    }
}

export class AddRoleFormAction extends FormApiAction<AddRoleApiData, AddRoleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new AddRoleDTOBuilder ();
    urlAction = "roles/";
}

export class DeleteRolesApiAction extends ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.DELETE;
    urlAction = "roles";
}

export class UpdateRoleByIdApiAction extends ApiAction<RoleDataResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
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

export class GetPermissionsApiAction extends ApiAction<GetPermissionsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "roles/permissions";
}

export function getAutoInputPermissions (): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        CACHED_PERMISSIONS.get ().then ((data) => {
            const parsed = data as GetPermissionsResponse;
            resolve (parsed.permissions.map ((permission, index) => {
                const toReturn = new AutoInputSearchResult();
                toReturn.id = index;
                toReturn.code = permission;
                toReturn.description = permission;
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
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