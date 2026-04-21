import { ApiResponse, runRequest } from "../../global";
import CryptoJS from "crypto-js";
import {
    GalleryUploadAbortApiAction,
    GalleryUploadAbortApiBody,
    GalleryUploadApiAction,
    GalleryUploadApiBody,
    GalleryUploadCompleteApiAction,
    GalleryUploadCompleteApiBody
} from "./api";
import { UploadRepostPermissions } from "../types";
import {
    ChunkUpload,
    ChunkUploadFailTypes,
    GalleryUploadData,
    GalleryUploadEvent,
    GalleryUploadEventCallback,
    GalleryUploadEventParams,
    GalleryUploadThumbnail,
    UploadProgress,
    UploadProgressStatus
} from "./types";
import { SelectItem } from "@/lib/components/fpSelect";
import * as uploadComponentLib from "@/lib/components/upload";
import * as mediaUtil from "@/lib/utils/media";

const ProgressStatusHierarchy: Record<UploadProgressStatus, number | undefined> = {
    INITIALIZING: 1,
    UPLOADING: 2,
    UPLOAD_COMPLETE: 3,
    CONFIRMING: 4,
    DONE: 5,
    ERROR: undefined,
    IDLE: undefined,
    ABORTED: undefined
}

/**
 * Defines a gallery upload, alongside all the required data and verification methods to interact with S3 storage
 * @author Drew
 */
export class GalleryUpload {
    private readonly abortController: AbortController;
    public readonly id: string;
    private progress: UploadProgress;
    private eventHandlers: Record<GalleryUploadEvent, GalleryUploadEventCallback[]>;

    private readonly file: File;
    private thumbnail: GalleryUploadThumbnail | undefined;
    private readonly eventId: number;
    private userId: number;
    private autoConfirm: boolean;
    public uploadRepostPermissions: UploadRepostPermissions;

    private uploadRequestId: number | undefined;
    private chunkSize: number = 0;
    private chunkStatusMap: Record<number, number> | undefined;
    private uploadedMedia: ApiResponse | undefined;
    private confirmationData: {
        allChunksChecksum: string,
        entityTags: string[]
    } | undefined;

    public constructor(data: GalleryUploadData, begin: boolean = false) {
        this.id = self.crypto.randomUUID();
        this.file = data.file;
        this.eventId = data.eventId;
        this.userId = data.userId;
        this.autoConfirm = data.autoConfirm ?? false;
        this.uploadRepostPermissions = data.uploadRepostPermissions ?? "PHOTOGRAPHER_DISCRETION";
        this.eventHandlers = {} as Record<GalleryUploadEvent, GalleryUploadEventCallback[]>;
        this.abortController = new AbortController();

        // Init status
        this.progress = {
            totalSize: this.file.size,
            uploadedSize: 0,
            status: "IDLE",
        }

        if (begin) {
            this.start();
        }
    }

    public getProgress() { return this.progress; }

    public addEventHandler(eventType: GalleryUploadEvent, callback: GalleryUploadEventCallback) {
        if (this.eventHandlers[eventType]) {
            this.eventHandlers[eventType].push(callback);
        } else {
            this.eventHandlers[eventType] = [callback];
        }
        return this;
    }

    public removeEventHandler(eventType: GalleryUploadEvent, callback: GalleryUploadEventCallback) {
        if (this.eventHandlers[eventType]) {
            this.eventHandlers[eventType].splice(this.eventHandlers[eventType].indexOf(callback), 1);
        }
        return this;
    }

    private dispatchEvent(eventType: GalleryUploadEvent, params?: Omit<GalleryUploadEventParams, "data">) {
        // Fire and forget all callbacks
        if (this.eventHandlers[eventType]) {
            Promise.all(this.eventHandlers[eventType]
                .map(callback => new Promise((resolve) => {
                    try {
                        callback({ data: this, ...params });
                    } catch (e) {
                        console.error(e);
                    }
                    resolve(null);
                }))).catch(() => {/* noop*/ });
        }
    }

    /**
     * Updates progress and dispatches the progress update to the callbacks
     * @param progress new progress data
     */
    private updateProgress(progress: Partial<Omit<UploadProgress, "uploadedSize">>) {
        // Status updates cannot go back
        if (!!progress.status && progress.status !== this.progress.status) {
            const oldStatus = ProgressStatusHierarchy[this.progress.status];
            const newStatus = ProgressStatusHierarchy[progress.status];
            if (!!oldStatus && !!newStatus && oldStatus > newStatus) {
                throw `Cannot go from ${this.progress.status} (${oldStatus}) to ${progress.status} (${newStatus})`;
            }
        }
        this.progress = { ...this.progress, ...progress };
        // Calculate total uploaded bytes
        if (this.chunkStatusMap) {
            this.progress.uploadedSize = Object.values(this.chunkStatusMap).reduce((prev, val) => prev + val, 0)
        }
        this.dispatchEvent("PROGRESS");
    }

    private error(reason: any) {
        if (!this.abortController.signal.aborted) {
            this.progress = { ...this.progress, status: "ERROR" };
            this.dispatchEvent("ERROR", { error: reason });
        }
        // Run abort request if an upload request was made
        if (this.uploadRequestId) {
            return runRequest({
                action: new GalleryUploadAbortApiAction(),
                body: {
                    uploadReqId: this.uploadRequestId,
                    userId: this.userId
                } as GalleryUploadAbortApiBody
            }).catch((e) => console.error("Could not abort upload", e))
        }
    }

    private uploadAllChunks(chunks: ChunkUpload[]): Promise<ChunkUpload[]> {
        const MAX_RUNNING_WORKERS = 3;

        // Divide in upload batches
        const batchedChunks: ChunkUpload[][] = [];
        slidingWindow(chunks, MAX_RUNNING_WORKERS, (data) => batchedChunks.push(data));

        // Progress handling
        // map chunks
        this.chunkStatusMap = chunks.reduce((record, chunk) => {
            record[chunk.offsetStart] = 0;
            return record;
        }, {} as Record<number, number>);

        // launch chunk uploads
        return new Promise(async (resolve, reject) => {
            this.abortController.signal.throwIfAborted();
            const toReturn: ChunkUpload[] = [];
            try {
                for (const toUpload of batchedChunks) {
                    const executed = await Promise.all(
                        toUpload.map(chunk => this.uploadChunk(chunk)));
                    toReturn.push(...executed);
                }
            } catch (e) { reject(e); }
            resolve(toReturn);
        });
    }

    private uploadChunk(chunkData: ChunkUpload): Promise<ChunkUpload> {
        const MAX_TRIES = 3;
        return new Promise(async (resolve, reject) => {
            this.abortController.signal.throwIfAborted();
            const data = { ...chunkData } as ChunkUpload;
            const slicedFile = this.file.slice(data.offsetStart, data.offsetStart + this.chunkSize);
            // Create md5 checksum of chunk
            const wordArray = CryptoJS.lib.WordArray.create(await slicedFile.arrayBuffer());
            data.md5Checksum = CryptoJS.MD5(wordArray);
            console.debug(`Uploading chunk ${data.link} - Md5 = ${data.md5Checksum}`);
            let lastError: any = null;
            while (!data.success && data.tries <= MAX_TRIES) {
                this.abortController.signal.throwIfAborted();
                try {
                    const toReturn = await this.chunkUploadRequest(slicedFile, data);
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

    private chunkUploadRequest(slicedFile: Blob, chunkData: ChunkUpload): Promise<ChunkUpload> {
        return new Promise((resolve, reject) => {
            this.abortController.signal.throwIfAborted();
            // Create request
            const request = new XMLHttpRequest();
            request.open("PUT", chunkData.link);

            // Handle abort operation
            const requestAbort = function () {
                request.abort();
            };
            this.abortController.signal.addEventListener("abort", requestAbort, { once: true });

            request.onloadend = () => {
                this.abortController.signal.removeEventListener("abort", requestAbort);
                if (request.readyState !== XMLHttpRequest.DONE) { return; }
                if (request.status >= 200 && request.status < 300) {
                    // Retrieve chunk etag
                    chunkData.etag = request.getResponseHeader("etag")?.replaceAll("\"", "") ?? null;
                    console.debug(`Chunk ${chunkData.link} SUCCESS. Etag: ${chunkData.etag}`)
                    resolve(chunkData);
                } else {
                    reject(ChunkUploadFailTypes.REQUEST_FAILED);
                }
            }
            const errorFn = () => {
                reject(reject(ChunkUploadFailTypes.NETWORK_ERROR));
            };
            request.upload.onerror = () => errorFn;
            request.upload.ontimeout = () => errorFn;
            request.upload.onabort = () => this.abortController.signal.throwIfAborted();
            request.upload.onprogress = (e) => {
                if (this.chunkStatusMap && chunkData.offsetStart in this.chunkStatusMap) {
                    this.chunkStatusMap[chunkData.offsetStart] = e.loaded;
                    this.updateProgress({});
                }
            }
            request.send(slicedFile);
        })
    }

    /**
     * Begins upload
     * @returns 
     */
    public start() {
        if (this.progress.status !== "IDLE") { return Promise.reject("Upload already started"); }
        this.abortController.signal.throwIfAborted();
        this.updateProgress({ status: "INITIALIZING" });
        return runRequest({
            action: new GalleryUploadApiAction(),
            body: {
                eventId: this.eventId,
                fileName: this.file.name,
                fileSize: this.file.size,
                userId: this.userId
            } as GalleryUploadApiBody
        }).then(requestData => {
            this.uploadRequestId = requestData.uploadReqId;
            const uploadData = requestData.multipartCreationResponse;
            this.chunkSize = uploadData.chunkSize;
            // Define chunks to upload
            const chunks: ChunkUpload[] = uploadData.presignedUrls.map((preSignedUrl, index) => ({
                success: false,
                offsetStart: index * this.chunkSize,
                link: preSignedUrl,
                etag: null,
                md5Checksum: null,
                tries: 1
            }));
            this.abortController.signal.throwIfAborted();
            this.updateProgress({ status: "UPLOADING" });
            return this.uploadAllChunks(chunks);
        }).then(uploadedChunks => {
            this.abortController.signal.throwIfAborted();
            this.updateProgress({ status: "UPLOAD_COMPLETE" });
            const concatHashes = uploadedChunks.map(c => c.md5Checksum).filter(v => !!v)
                .reduce((last, newValue) => last!.concat(newValue), CryptoJS.lib.WordArray.create());

            // Set confirmation data
            this.confirmationData = {
                entityTags: uploadedChunks.map(c => c.etag ?? ""),
                allChunksChecksum: CryptoJS.MD5(concatHashes).toString(CryptoJS.enc.Hex)
            }

            if (this.autoConfirm) {
                return this.confirmUpload({
                    fileName: this.file.name,
                    uploadReqId: this.uploadRequestId!,
                    fileSize: this.file.size,
                    eventId: this.eventId,
                    uploadRepostPermissions: this.uploadRepostPermissions,
                    etags: this.confirmationData.entityTags,
                    md5Hash: this.confirmationData.allChunksChecksum,
                    userId: this.userId
                });
            } else {
                return Promise.resolve(true);
            }
        }).catch(e => this.error(e))
    }

    public confirmUpload(data?: GalleryUploadCompleteApiBody) {
        this.updateProgress({ status: "CONFIRMING" });
        return runRequest({
            action: new GalleryUploadCompleteApiAction(),
            body: data ?? {
                etags: this.confirmationData!.entityTags,
                md5Hash: this.confirmationData!.allChunksChecksum,
                eventId: this.eventId,
                fileName: this.file.name,
                fileSize: this.file.size,
                uploadRepostPermissions: this.uploadRepostPermissions,
                uploadReqId: this.uploadRequestId,
                userId: this.userId
            } as GalleryUploadCompleteApiBody
        }).then(response => {
            this.uploadedMedia = response;
            this.updateProgress({ status: "DONE" });
            this.dispatchEvent("DONE", { upload: this.uploadedMedia });
            return Promise.resolve(true);
        });
    }

    public abort() {
        if (this.progress.status === "DONE") {
            throw "Upload already completed";
        }
        this.abortController.signal.throwIfAborted();
        this.abortController.abort("Aborted by user");
        this.updateProgress({ status: "ABORTED" });
        this.dispatchEvent("ABORTED", { error: "Aborted", upload: this.uploadedMedia });
    }

    public dispose() {
        // Clear event handlers
        Object.keys(this.eventHandlers).forEach(k => this.eventHandlers[k as GalleryUploadEvent] = []);
        // Revoke thumbnail data
        if (this.thumbnail) URL.revokeObjectURL(this.thumbnail.url);
    }

    public getThumbnail(): Promise<GalleryUploadThumbnail> {
        return new Promise((resolve, reject) => {
            // Do not re-process if already present
            if (this.thumbnail) {
                resolve(this.thumbnail);
                return;
            }

            // Get image sizes
            return mediaUtil.getThumbnail(this.file)
                .then(thumbnailBlob => {
                    this.thumbnail = {
                        blob: thumbnailBlob,
                        url: URL.createObjectURL(thumbnailBlob)
                    };
                    // Finally return new thumbnail
                    resolve(this.thumbnail);
                }).catch(e => reject(e));
        });
    }
}

function slidingWindow<T, U>(data: T[], windowSize: number, onWindow: (data: T[]) => U) {
    for (let i = 0; i < Math.ceil(data.length / windowSize) * windowSize; i += windowSize) {
        const arr = Array.from(data);
        const str = Math.min(i, data.length - 1);
        const end = Math.min((i + windowSize), data.length);
        onWindow(arr.slice(str, end));
    }
}

export const copyrightValues: SelectItem[] = [
    new SelectItem(
        undefined,
        "PHOTOGRAPHER_DISCRETION",
        "Photographer discretion",
        undefined,
        undefined,
        undefined,
        { "it-it": "Discrezione del fotografo", "en-gb": "Photographer discretion" }
    ),
    new SelectItem(
        undefined,
        "CC_BY_NC_ND",
        "CC BY-NC-ND"
    ),
    new SelectItem(
        undefined,
        "CC_BY_NC",
        "CC BY-NC"
    ),
    new SelectItem(
        undefined,
        "CC_BY_ND",
        "CC BY-ND"
    ),
    new SelectItem(
        undefined,
        "CC_BY",
        "CC BY"
    ),
    new SelectItem(
        undefined,
        "PUBLIC_DOMAIN",
        "Public domain",
        undefined,
        undefined,
        undefined,
        { "it-it": "Pubblico dominio", "en-gb": "Public domain" }
    ),
    new SelectItem(
        undefined,
        "ALL_RIGHTS_RESERVED",
        "All rights reserved",
        undefined,
        undefined,
        undefined,
        { "it-it": "Tutti i diritti riservati", "en-gb": "All rights reserved" }
    )
]