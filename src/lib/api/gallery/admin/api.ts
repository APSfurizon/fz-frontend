import { FormApiAction, FormDTOBuilder, getData } from "@/lib/components/dataForm";
import { GalleryUpdateBody } from "../admin/types";
import { ApiAction } from "../../networking/types";
import { ApiErrorResponse } from "../../networking/types";
import { ApiResponse } from "../../networking/types";
import { RequestType } from "../../networking/types";
import { GalleryUploadedFullMedia } from "../types";

class GalleryUpdateDtoBuilder implements FormDTOBuilder<GalleryUpdateBody> {
  mapToDTO(data: FormData) {
    const newEventIdStr = getData(data, "newEventId");
    const newPhotographerUserIdStr = getData(data, "newPhotographerUserId");
    const newRepostPermissions = getData(data, "newRepostPermissions");
    const newStatus = getData(data, "newStatus");
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
