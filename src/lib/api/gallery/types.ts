import { ConventionEvent } from "../counts";
import { MediaData } from "../media";
import { UserData } from "../user";

export type UploadRepostPermissions = "PHOTOGRAPHER_DISCRETION" |
    "CC_BY_NC_ND" |
    "CC_BY_NC" |
    "CC_BY_ND" |
    "CC_BY" |
    "PUBLIC_DOMAIN" |
    "ALL_RIGHTS_RESERVED";

export type GalleryUploadedMediaStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface GalleryUploadedMedia {
    id: number;
    photographerUserId: number;
    uploadDate: string;
    status: GalleryUploadedMediaStatus;
    fileName: string;
    type: "PHOTO" | "VIDEO";
    thumbnailMedia?: MediaData;
    eventId: number;
    selected: boolean;
};

export type PhotoMetadata = {
    cameraMaker: string;
    cameraModel: string;
    lensMaker: string;
    lensModel: string;
    focal: string;
    shutter: string;
    aperture: string;
    iso: string;
}

export type VideoMetadata = {
    audioFrequency: string;
    videoCodec: string;
    audioCodec: string;
    framerate: string;
    durationMs: number;
}

export interface GalleryUploadedFullMedia extends GalleryUploadedMedia {
    photographerUserId: never;
    eventId: never;

    photographer: UserData;
    shotDate: string;
    fileSize: number;
    width: number;
    height: number;
    downloadMedia?: MediaData;
    displayMedia?: MediaData;
    repostPermissions: UploadRepostPermissions;
    event: ConventionEvent;
    photoMetadata: PhotoMetadata;
    videoMetadata: VideoMetadata;
}