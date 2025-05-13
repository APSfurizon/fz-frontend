import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global";

export interface AdminCapabilitesResponse extends ApiResponse {
    canUpgradeUser: boolean,
    canBanUsers: boolean,
    canManageMembershipCards: boolean,
    canRefreshPretixCache: boolean,
    canRemindOrderLinking: boolean,
    canRemindBadgeUploads: boolean,
    canRemindRoomsNotFull: boolean,
    canExportHotelList: boolean
}

export const EMPTY_CAPABILITIES: AdminCapabilitesResponse = {
    canUpgradeUser: false,
    canBanUsers: false,
    canManageMembershipCards: false,
    canRefreshPretixCache: false,
    canRemindOrderLinking: false,
    canRemindBadgeUploads: false,
    canRemindRoomsNotFull: false,
    canExportHotelList: false
}

export class GetAdminCapabilitiesApiAction extends ApiAction<AdminCapabilitesResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/capabilities";
}

export class ExportHotelRoomsApiAction extends ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/export/hotel-user-list";
    rawResponse?: boolean = true;
}