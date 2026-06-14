import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global";
import { BulkDownloadApiResponse, GalleryUploadedFullMedia } from "./types";

export class GetFullMediaApiAction extends ApiAction<ApiResponse & GalleryUploadedFullMedia, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "gallery/pub/{id}";
  hasPathParams = true;
}

export class BulkDownloadApiAction extends ApiAction<BulkDownloadApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "gallery/bulk-download";
}

export class DeleteMediaApiAction extends ApiAction<boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.DELETE;
  urlAction = "gallery/manage/{uploadId}";
  hasPathParams = true;
}
