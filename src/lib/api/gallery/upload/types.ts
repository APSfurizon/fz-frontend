import { ApiResponse } from "../../global";
import { UploadRepostPermissions } from "../types";
import { GalleryUpload } from "./main";

/**
 * Defines the Chunk to upload
 * returning type of each chunk upload function
 */
export type ChunkUpload = {
    success: boolean;
    offsetStart: number;
    link: string;
    etag: string | null;
    md5Checksum: CryptoJS.lib.WordArray | null;
    tries: number;
}

export const ChunkUploadFailTypes = {
    REQUEST_FAILED: "request_failed",
    NETWORK_ERROR: "network_error",
    ABORTED: "aborted"
} as const;
export type ChunkUploadFailType = typeof ChunkUploadFailTypes[keyof typeof ChunkUploadFailTypes];

export type ChunkUploadFail = {
    chunkData: ChunkUpload;
    error: ChunkUploadFailType
}

export type UploadProgressStatus = "IDLE" |
    "INITIALIZING" |
    "UPLOADING" |
    "UPLOAD_COMPLETE" |
    "CONFIRMING" |
    "DONE" |
    "ERROR";

export type UploadProgress = {
    totalSize: number,
    uploadedSize: number,
    status: UploadProgressStatus
}

export type GalleryUploadData = {
    file: File;
    eventId: number;
    userId: number;
    autoConfirm?: boolean;
    uploadRepostPermissions?: UploadRepostPermissions
}

export type GalleryUploadEvent = "PROGRESS" | "ERROR" | "DONE"
export type GalleryUploadEventParams = { data: GalleryUpload, error?: any, upload?: ApiResponse }
export type GalleryUploadEventCallback = (e: GalleryUploadEventParams) => any;