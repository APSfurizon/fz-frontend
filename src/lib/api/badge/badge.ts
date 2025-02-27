import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";
import { MediaData } from "../media";
import { UserData, UserDisplayResponse } from "../user";
import { Fursuit } from "./fursuits";

export interface BadgeStatusApiResponse extends ApiResponse {
    badgeEditingDeadline: string,
    fursonaName: string,
    mainBadge?: UserData,
    fursuits: Fursuit[],
    maxFursuits: number,
    canBringFursuitsToEvent: boolean
}

export class GetBadgeStatusAction implements ApiAction<BadgeStatusApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "badge/";
}

export interface BadgeUploadResponse extends MediaData, ApiResponse {}

export class UploadBadgeAction implements ApiAction<BadgeUploadResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "badge/user/upload";
}

export class DeleteBadgeAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "DELETE";
    urlAction = "badge/user/";
}

export interface BadgeDataChangeData {
    userId?: number,
    fursonaName: string,
    locale: string
};

export class BadgeDataChangeDTOBuilder implements FormDTOBuilder<BadgeDataChangeData> {
    mapToDTO = (data: FormData) => {
        let toReturn: BadgeDataChangeData = {
            fursonaName: data.get('fursonaName')?.toString () ?? "",
            locale: data.get('locale')?.toString() ?? ""
        };
        return toReturn;
    }
}

export class BadgeDataChangeFormAction implements FormApiAction<BadgeDataChangeData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new BadgeDataChangeDTOBuilder ();
    urlAction = "badge/update-user-badge-info";
}