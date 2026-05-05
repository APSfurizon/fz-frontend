import { DummyDTOBuilder, FormApiAction, FormDTOBuilder } from "@/lib/components/dataForm";
import { AllEventsResponse } from "../../counts";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../../global";
import { UploadRepostPermissions } from "../types";
import { GalleryUpdateBody, UploadsApiResponse } from "./types";
import { nullifyEmptyString } from "@/lib/utils";

export type GalleryUploadApiBody = {
    fileSize: number;
    eventId: number;
    userId: number;
    fileName: string;
}

/**
 * Defines the upload response, alonside the required url to upload chunks to and expiration
 */
export interface GalleryUploadApiResponse extends ApiResponse {
    uploadReqId: number;
    s3Endpoint: string;
    s3Bucket: string;
    multipartCreationResponse: {
        uploadKey: string;
        uploadId: string;
        expiration: string;
        presignedUrls: string[];
        chunkSize: number;
        fileSize: number;
    }
}

export class GalleryUploadApiAction extends ApiAction<GalleryUploadApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "gallery/upload/";
}

export type GalleryUploadCompleteApiBody = {
    fileName: string;
    uploadReqId: number;
    fileSize: number;
    eventId: number;
    uploadRepostPermissions: UploadRepostPermissions,
    etags: string[];
    md5Hash: string;
    userId: number;
}

export class GalleryUploadCompleteApiAction extends ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "gallery/upload/complete";
}

export type GalleryUploadAbortApiBody = {
    uploadReqId: number;
    userId: number;
}

export class GalleryUploadAbortApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "gallery/upload/abort";
}

export class AttendedEventsApiAction extends ApiAction<AllEventsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "events/attended"
}

export class MyUploadsApiAction extends ApiAction<UploadsApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "gallery/my-uploads"
}


class GalleryUpdateDtoBuilder implements FormDTOBuilder<GalleryUpdateBody> {
    mapToDTO(data: FormData) {
        const newEventIdStr = data.get("newEventId")?.toString();
        const newPhotographerUserIdStr = data.get("newPhotographerUserId")?.toString();
        nullifyEmptyString
        return {
            newEventUid: Number(newEventIdStr),
            newPhotographerUserId: Number(newPhotographerUserIdStr)
        } as GalleryUpdateBody;
    };
}

export class GalleryUpdateFormApiAction extends FormApiAction<GalleryUpdateBody, boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "gallery/manage/update";
    dtoBuilder = new GalleryUpdateDtoBuilder();
}