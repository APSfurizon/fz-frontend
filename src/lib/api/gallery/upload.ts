import { ApiAction, ApiErrorResponse, ApiResponse, RequestType, runRequest } from "../global";
import CryptoJS from "crypto-js";

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
    uploadRepostPermissions: "PHOTOGRAPHER_DISCRETION",
    etags: string[];
    md5Hash: string;
    userId: number;
}

export class GalleryUploadCompleteApiAction extends ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "gallery/upload/complete";
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
    md5Checksum: CryptoJS.lib.WordArray | null;
    tries: number;
}

const ChunkUploadFailTypes = {
    REQUEST_FAILED: "request_failed",
    NETWORK_ERROR: "network_error",
    ABORTED: "aborted"

} as const;
export type ChunkUploadFailType = typeof ChunkUploadFailTypes[keyof typeof ChunkUploadFailTypes];

export type ChunkUploadFail = {
    chunkData: ChunkUpload;
    error: ChunkUploadFailType
}

export type UploadProgress = {
    totalSize: number,
    uploadedSize: number,
    status: "UPLOADING" | "DONE" | "ERROR"
}

export function upload(file: File, eventId: number, userId: number, onProgress?: (status: UploadProgress) => any) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create upload links
            const uploadRequestData = await beginUpload(file, eventId, userId);
            const chunkSize = uploadRequestData.multipartCreationResponse.chunkSize;
            const preSignedUrls = uploadRequestData.multipartCreationResponse.presignedUrls;
            // Create chunk upload data
            const chunks: ChunkUpload[] = [];
            preSignedUrls.forEach((preSignedUrl, index) => {
                chunks.push({
                    success: false,
                    offsetStart: index * chunkSize,
                    link: preSignedUrl,
                    etag: null,
                    md5Checksum: null,
                    tries: 1
                });
            });
            // Upload chunks
            const uploadedChunks = await uploadAllChunks(file,
                uploadRequestData.multipartCreationResponse.chunkSize,
                chunks,
                onProgress);
            // Confirm upload
            const etags = uploadedChunks.map(c => c.etag ?? "");
            const concatHashes = uploadedChunks.map(c => c.md5Checksum).filter(v => !!v)
                .reduce((last, newValue) => last!.concat(newValue), CryptoJS.lib.WordArray.create());
            const md5Hash = CryptoJS.MD5(concatHashes).toString(CryptoJS.enc.Hex);
            resolve(await completeUpload(file, eventId, userId, uploadRequestData.uploadReqId, etags, md5Hash));
        } catch (e) {
            reject(e);
        }
    });

}

function beginUpload(file: File, eventId: number, userId: number) {
    const uploadApiBody: GalleryUploadApiBody = {
        eventId,
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

function uploadAllChunks(file: File, chunkSize: number, chunks: ChunkUpload[],
    onProgress?: (status: UploadProgress) => any): Promise<ChunkUpload[]> {
    const MAX_RUNNING_WORKERS = 3;

    // Divide in upload batches
    const batchedChunks: ChunkUpload[][] = [];
    slidingWindow(chunks, MAX_RUNNING_WORKERS, (data) => batchedChunks.push(data));

    // Progress handling
    // map chunks
    const chunkMap: Record<number, { chunk: ChunkUpload, uploaded: number }> = chunks.reduce((record, chunk) => {
        record[chunk.offsetStart] = { chunk, uploaded: 0 };
        return record;
    }, {} as Record<number, { chunk: ChunkUpload, uploaded: number }>);
    // init progress
    const uploadProgress: UploadProgress = {
        status: "UPLOADING",
        totalSize: file.size,
        uploadedSize: 0
    };
    // define update methods
    const increaseAndNotify = (chunk: ChunkUpload, uploaded: number) => {
        if (chunk.offsetStart in chunkMap) {
            chunkMap[chunk.offsetStart].uploaded = uploaded;
        }
        notify(uploadProgress);
    };
    const notify = (status: UploadProgress) => {
        const progressToSend = { ...status } as UploadProgress;
        progressToSend.uploadedSize = Object.values(chunkMap).map(v => v.uploaded).reduce((prev, val) => prev + val, 0);
        if (onProgress) {
            onProgress(progressToSend);
        }
    };
    notify(uploadProgress);
    // launch chunk uploads
    return new Promise(async (resolve, reject) => {
        const toReturn: ChunkUpload[] = [];
        try {
            for (const toUpload of batchedChunks) {
                const executed = await Promise.all(
                    toUpload.map(chunk => uploadChunk(file, chunkSize, chunk, increaseAndNotify)));
                toReturn.push(...executed);
            }
        } catch (e) { reject(e); }
        resolve(toReturn);
    });
}

function uploadChunk(file: File, chunkSize: number, chunkData: ChunkUpload, progress: (chunk: ChunkUpload, uploaded: number) => any): Promise<ChunkUpload> {
    const MAX_TRIES = 3;
    return new Promise(async (resolve, reject) => {
        const data = { ...chunkData } as ChunkUpload;
        const slicedFile = file.slice(data.offsetStart, data.offsetStart + chunkSize);
        // Create md5 checksum of chunk
        const sliceArray = await slicedFile.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(sliceArray);
        data.md5Checksum = CryptoJS.MD5(wordArray);
        console.debug(`Chunk ${data.link} - Md5 = ${data.md5Checksum}`);
        let lastError: any = null;
        while (!data.success && data.tries <= MAX_TRIES) {
            try {
                const toReturn = await runChunkUpload(slicedFile, data, progress);
                data.success = true;
                resolve(toReturn);
                break;
            } catch (e) {
                lastError = e;
                data.tries += 1;
                console.warn(`Upload of chunk to ${data.link} failed:`, e);
            }
        }
        if (data.tries > MAX_TRIES) {
            reject({ chunkData: data, error: lastError });
        }
    });
}

function runChunkUpload(slicedFile: Blob, chunkData: ChunkUpload, progress: (chunk: ChunkUpload, uploaded: number) => any): Promise<ChunkUpload> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", chunkData.link);
        request.onloadend = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if ([200, 201, 202, 203, 204, 207, 208].includes(request.status)) {
                    // Retrieve chunk etag
                    chunkData.etag = request.getResponseHeader("etag")?.replaceAll("\"", "") ?? null;
                    console.debug(`Chunk ${chunkData.link} SUCCESS. Etag: ${chunkData.etag}`)
                    resolve(chunkData);
                } else {
                    reject(ChunkUploadFailTypes.REQUEST_FAILED);
                }
            }
        }
        const errorFn = () => {
            reject(reject(ChunkUploadFailTypes.NETWORK_ERROR));
        };
        request.upload.onerror = () => errorFn;
        request.upload.onabort = () => errorFn;
        request.upload.ontimeout = () => errorFn;
        request.upload.onprogress = (e) => {
            progress(chunkData, e.loaded);
        }
        request.send(slicedFile);
    })
}

function completeUpload(file: File, eventId: number, userId: number, uploadReqId: number, etags: string[],
    md5Hash: string) {
    const body: GalleryUploadCompleteApiBody = {
        fileName: file.name,
        uploadReqId,
        fileSize: file.size,
        eventId,
        uploadRepostPermissions: "PHOTOGRAPHER_DISCRETION",
        etags,
        md5Hash,
        userId
    }
    return runRequest({
        action: new GalleryUploadCompleteApiAction(),
        body
    })
}

function slidingWindow<T, U>(data: T[], windowSize: number, onWindow: (data: T[]) => U) {
    for (let i = 0; i < Math.ceil(data.length / windowSize) * windowSize; i += windowSize) {
        const arr = Array.from(data);
        const str = Math.min(i, data.length - 1);
        const end = Math.min((i + windowSize), data.length);
        onWindow(arr.slice(str, end));
    }
}