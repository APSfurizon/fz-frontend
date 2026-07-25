import { FormApiAction, FormDTOBuilder, getData } from "../../components/dataForm";
import { MediaData } from "../media";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../networking/types";
import { UserData } from "../user";
import { FursuitEventData } from "./types";

export interface BadgeStatusApiResponse extends ApiResponse {
  badgeEditingDeadline: string;
  fursonaName: string;
  mainBadge?: UserData;
  fursuits: FursuitEventData[];
  maxFursuits: number;
  canBringFursuitsToEvent: boolean;
  allowedModifications: boolean;
  allowEditBringFursuitToEvent: boolean;
}

export class GetBadgeStatusAction extends ApiAction<BadgeStatusApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "badge/";
}

export interface BadgeUploadResponse extends MediaData, ApiResponse {}

export class UploadBadgeAction extends ApiAction<BadgeUploadResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "badge/user/upload";
}

export class UploadBadgeAdminAction extends ApiAction<BadgeUploadResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  hasPathParams = true;
  urlAction = "badge/user/upload/{id}";
}

export class DeleteBadgeAction extends ApiAction<boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.DELETE;
  urlAction = "badge/user/";
}

export class DeleteBadgeAdminAction extends ApiAction<boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.DELETE;
  hasPathParams = true;
  urlAction = "badge/user/{id}";
}

export interface BadgeDataChangeData {
  userId?: number;
  fursonaName: string;
  locale: string;
}

export class BadgeDataChangeDTOBuilder implements FormDTOBuilder<BadgeDataChangeData> {
  mapToDTO = (data: FormData) => {
    return {
      userId: parseInt(getData(data, "userId")?.toString() ?? ""),
      fursonaName: getData(data, "fursonaName")?.toString() ?? "",
      locale: getData(data, "locale")?.toString() ?? "",
    };
  };
}

export class BadgeDataChangeFormAction extends FormApiAction<BadgeDataChangeData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new BadgeDataChangeDTOBuilder();
  urlAction = "badge/update-user-badge-info";
}
