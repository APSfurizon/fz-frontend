import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";

export interface AdminCapabilitesResponse extends ApiResponse {
    canUpgradeUser: boolean,
    canBanUsers: boolean,
    canManageMembershipCards: boolean,
    canRefreshPretixCache: boolean,
    canRemindOrderLinking: boolean,
    canRemindBadgeUploads: boolean,
    canExportHotelList: boolean
}

export const EMPTY_CAPABILITIES: AdminCapabilitesResponse = {
    canUpgradeUser: false,
    canBanUsers: false,
    canManageMembershipCards: false,
    canRefreshPretixCache: false,
    canRemindOrderLinking: false,
    canRemindBadgeUploads: false,
    canExportHotelList: false
}

export class GetAdminCapabilitiesApiAction implements ApiAction<AdminCapabilitesResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/capabilities";
}

export class ExportHotelRoomsApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/export/hotel-user-list";
    rawResponse?: boolean = true;
}