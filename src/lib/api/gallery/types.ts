import { MediaData } from "../media";

export type UploadRepostPermissions = "PHOTOGRAPHER_DISCRETION" |
    "CC_BY_NC_ND" |
    "CC_BY_NC" |
    "CC_BY_ND" |
    "CC_BY" |
    "PUBLIC_DOMAIN" |
    "ALL_RIGHTS_RESERVED";

export type GalleryUploadedMedia = {
    id: number;
    photographerUserId: number;
    uploadDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    fileName: string;
    type: string;
    thumbnailMedia?: MediaData;
    eventId: number;
    selected: boolean;
};
