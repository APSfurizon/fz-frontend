import { FormApiAction, FormDTOBuilder, getData } from "@/lib/components/dataForm";
import { ApiAction } from "../networking/types";
import { ApiErrorResponse } from "../networking/types";
import { ApiResponse } from "../networking/types";
import { RequestType } from "../networking/types";

export interface AdminCapabilitesResponse extends ApiResponse {
  canUpgradeUser?: boolean;
  canBanUsers?: boolean;
  canChangeLoginData?: boolean;
  canManageMembershipCards?: boolean;
  canRefreshPretixCache?: boolean;
  canRemindOrderLinking?: boolean;
  canRemindBadgeUploads?: boolean;
  canRemindRoomsNotFull?: boolean;
  canRemindFursuitBringToEvent?: boolean;
  canViewUsers?: boolean;
  canExportHotelList?: boolean;
  canExportShirtList?: boolean;
  canExportBadges?: boolean;
  security?: boolean;
}

export class GetAdminCapabilitiesApiAction extends ApiAction<AdminCapabilitesResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "admin/capabilities";
}

export class ExportHotelRoomsApiAction extends ApiAction<Response, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "admin/export/hotel-user-list";
  rawResponse?: boolean = true;
}

export class ExportTShirtsApiAction extends ApiAction<Response, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "admin/export/shirt-user-list";
  rawResponse?: boolean = true;
}

export interface ManualLinkOrderData {
  orderCode: string;
  userId: number;
}

class ManuallyLinkOrderDTOBuilder implements FormDTOBuilder<ManualLinkOrderData> {
  mapToDTO = (data: FormData) => {
    const toReturn: ManualLinkOrderData = {
      orderCode: getData(data, "orderCode")!.toString(),
      userId: parseInt(getData(data, "userId")!.toString()),
    };
    return toReturn;
  };
}

export class ManuallyLinkOrderFormAction extends FormApiAction<ManualLinkOrderData, Response, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  dtoBuilder = new ManuallyLinkOrderDTOBuilder();
  urlAction = "orders-workflow/manual-order-link";
}
