import { FormApiAction, FormDTOBuilder } from "@/lib/components/dataForm";
import { GalleryUpdateBody } from "../admin/types";
import { nullifyEmptyString } from "@/lib/utils";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../../global";
import { GalleryUploadedFullMedia } from "../types";

class GalleryUpdateDtoBuilder implements FormDTOBuilder<GalleryUpdateBody> {
  mapToDTO(data: FormData) {
    const newEventIdStr = data.get("newEventId")?.toString();
    const newPhotographerUserIdStr = data.get("newPhotographerUserId")?.toString();
    const newRepostPermissions = data.get("newRepostPermissions")?.toString();
    const newStatus = data.get("newStatus")?.toString();
    nullifyEmptyString;
    return {
      newEventUid: Number(newEventIdStr),
      newPhotographerUserId: Number(newPhotographerUserIdStr),
      newRepostPermissions,
      newStatus: newStatus,
    } as GalleryUpdateBody;
  }
}

export class GalleryUpdateFormApiAction extends FormApiAction<GalleryUpdateBody, boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "gallery/manage/update";
  dtoBuilder = new GalleryUpdateDtoBuilder();
}

export class GallerySelectMediaFormApiAction extends ApiAction<
  GalleryUploadedFullMedia & ApiResponse,
  ApiErrorResponse
> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "gallery/manage/set-selected";
}
