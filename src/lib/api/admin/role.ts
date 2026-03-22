import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, filterLoaded } from "@/lib/components/autoInput";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global"
import { UserData } from "../user";
import { FormApiAction, FormDTOBuilder } from "@/lib/components/dataForm";
import { CACHED_PERMISSIONS } from "@/lib/cache/cache";

export interface RoleInfo extends Omit<RoleBaseData, "roleAdmincountPriority"> {
    permanentUsersNumber: number,
    temporaryUsersNumber: number,
    permissionsNumber: number
}

export interface MultipleRolesResponse<T extends RoleInfo | RoleBaseData> extends ApiResponse {
    roles: T[]
}

export class GetAllRolesApiAction extends ApiAction<MultipleRolesResponse<RoleInfo>, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "roles/";
}

export interface RoleMember {
    tempRole: boolean,
    displayData: UserData
}

export interface RoleBaseData {
    roleId: number,
    internalName?: string,
    displayName?: string,
    showInAdminCount: boolean,
    roleAdmincountPriority: number
}

export interface RoleData extends RoleBaseData {
    enabledPermissions: string[],
    users: RoleMember[]
}

export interface RoleDataResponse extends ApiResponse, RoleData { }

export class GetRoleByIdApiAction extends ApiAction<RoleDataResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    hasPathParams = true;
    urlAction = "roles/{id}";
}

export class SearchRoleApiAction extends ApiAction<MultipleRolesResponse<RoleBaseData>, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "roles/search";
}

export interface RoleOutputMember {
    userId: number,
    tempRole: boolean
}

export interface RoleOutputData extends Omit<RoleBaseData, "roleId"> {
    enabledPermissions: string[],
    users: RoleOutputMember[]
}

export interface AddRoleApiData {
    internalName: string
}

export interface AddRoleApiResponse extends ApiResponse {
    roleId: number
}

export class AddRoleDTOBuilder implements FormDTOBuilder<AddRoleApiData> {
    mapToDTO = (data: FormData) => {
        const toReturn: AddRoleApiData = {
            internalName: data.get("internalName")!.toString()
        };
        return toReturn;
    }
}

export class AddRoleFormAction extends FormApiAction<AddRoleApiData, AddRoleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new AddRoleDTOBuilder();
    urlAction = "roles/";
}

export class DeleteRolesApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.DELETE;
    hasPathParams = true;
    urlAction = "roles/{id}";
}

export class UpdateRoleByIdApiAction extends ApiAction<RoleDataResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    hasPathParams = true;
    urlAction = "roles/{id}";
}

export function roleToOutput(view: RoleData): RoleOutputData {
    return {
        displayName: view.displayName,
        internalName: view.internalName,
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

export function getAutoInputPermissions(): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]>((resolve, reject) => {
        CACHED_PERMISSIONS.get().then((data) => {
            const parsed = data as GetPermissionsResponse;
            resolve(parsed.permissions.map((permission, index) => {
                const toReturn = new AutoInputSearchResult();
                toReturn.id = index;
                toReturn.code = permission;
                toReturn.description = permission;
                return toReturn;
            }));
        }).catch((err) => { reject(err) });
    });
}

/**
 * Defines the search service to look for permissions
 */
export class AutoInputPermissionsManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds(filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            getAutoInputPermissions().then(results => {
                resolve(filterLoaded(results, filter));
            });
        });
    }

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            getAutoInputPermissions().then(results => {
                resolve(
                    filterLoaded(results, filter, filterOut)
                );
            });
        });
    }

    isPresent(): Promise<boolean> { return new Promise((resolve) => resolve(true)); };
}