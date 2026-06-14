import { ApiAction } from "../networking/types";
import { ApiErrorResponse } from "../networking/types";
import { ApiResponse } from "../networking/types";
import { RequestType } from "../networking/types";
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
