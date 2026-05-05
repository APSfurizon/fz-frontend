import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global"
import { GalleryUploadedFullMedia } from "./types"

export class GetFullMediaApiAction extends ApiAction<ApiResponse & GalleryUploadedFullMedia, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "gallery/pub/{id}";
    hasPathParams = true;
}