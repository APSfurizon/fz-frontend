import { ApiAction, ApiErrorResponse, ApiResponse, RequestType, runRequest } from "../global";

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
    urlAction = "gallery/upload";
}

/**
 * Defines the Chunk to upload
 * returning type of each chunk upload function
 */
export type ChunkUpload = {
    success: boolean;
    offsetStart: number;
    link: string;
    etag: string | null;
    md5Checksum: string | null;
    tries: number;
}

function upload(file: File, userId: number) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create upload links
            const uploadRequestData = await beginUpload(file, userId);
            // Create chunk upload data
            const chunks: ChunkUpload[] = [];
            uploadRequestData.multipartCreationResponse.presignedUrls.forEach((preSignedUrl, index) => {
                chunks.push({
                    success: false,
                    offsetStart: index * uploadRequestData.multipartCreationResponse.chunkSize,
                    link: preSignedUrl,
                    etag: null,
                    md5Checksum: null,
                    tries: 1
                });
            });
            // Upload chunks
            uploadAllChunks(file, uploadRequestData.multipartCreationResponse.chunkSize, chunks);
        } catch (e) {
            reject(e);
        }
    });

}

function beginUpload(file: File, userId: number) {
    const uploadApiBody: GalleryUploadApiBody = {
        eventId: 2,
        fileName: file.name,
        fileSize: file.size,
        userId
    };
    // Retrieve 
    return runRequest({
        action: new GalleryUploadApiAction(),
        body: uploadApiBody
    });
}

function uploadAllChunks(file: File, chunkSize: number, chunks: ChunkUpload[]) {
    const MAX_RUNNING_WORKERS = 3;
    const batchedChunks: ChunkUpload[][] = [];
    slidingWindow(chunks, MAX_RUNNING_WORKERS, (data) => batchedChunks.push(data));
    return new Promise(async (resolve, reject) => {
        const toReturn = [];
        try {
            for (const toUpload of batchedChunks) {
                const executed = await Promise.all(toUpload.map(chunk => uploadChunk(file, chunkSize, chunk)));
                toReturn.push(executed);
            }
        } catch (e) { reject(e); }
        resolve(toReturn);
    });
}

function uploadChunk(file: File, chunkSize: number, chunkData: ChunkUpload): Promise<ChunkUpload> {
    const MAX_TRIES = 3;
    return new Promise(async (resolve, reject) => {
        const data = { ...chunkData };
        while (!data.success && data.tries <= MAX_TRIES) {
            const request = new XMLHttpRequest();
            request.open("PUT", data.link);
            try {
                request.send(file.slice(data.offsetStart, data.offsetStart + chunkSize));
            } catch (e) {

            }
        }
        if (data.tries > MAX_TRIES) {

        }
    });
}

function slidingWindow<T, U>(data: T[], windowSize: number, onWindow: (data: T[]) => U) {
    for (let i = 0; i < Math.ceil(data.length / windowSize) * windowSize; i += windowSize) {
        const arr = Array.from(data);
        const str = Math.min(i, data.length - 1);
        const end = Math.min((i + windowSize), data.length);
        onWindow(arr.slice(str, end));
    }
}