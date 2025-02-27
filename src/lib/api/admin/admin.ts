import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";

export interface AdminCapabilitesResponse extends ApiResponse {
    canUpgradeUser: boolean,
    canBanUsers: boolean,
    canManageMembershipCards: boolean,
    canRefreshPretixCache: boolean,
}

export const EMPTY_CAPABILITIES: AdminCapabilitesResponse = {
    canUpgradeUser: false,
    canBanUsers: false,
    canManageMembershipCards: false,
    canRefreshPretixCache: false
}

export class GetAdminCapabilitiesApiAction implements ApiAction<AdminCapabilitesResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/capabilities";
}