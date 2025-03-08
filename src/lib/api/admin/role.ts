import { ApiAction, ApiErrorResponse, ApiResponse } from "../global"

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