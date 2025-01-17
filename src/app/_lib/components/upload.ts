import { ApiAction, ApiErrorResponse, ApiResponse } from "../api/global"
import { MediaData } from "../api/media"
import { UPLOAD_MAX_SIZE, UPLOAD_MIN_SIZE } from "../constants"
import { getRectangle } from "../utils"

export type ImageSettings = {
    width: number,
    height: number,
    resizeFactor: number,
}

export type Coordinates = {
    x: number,
    y: number
}

export type HandleSettings = {
    coordinates: Coordinates,
    active: boolean
}

export type WholeHandleSettings = {
    startingOffset: Coordinates,
    active: boolean
}

export type Rectangle = {
    x: number,
    y: number,
    width: number,
    height: number
}

export const VALID_FILE_TYPES = ["image/gif", "image/jpeg", "image/png", "image/bmp", "image/webp", "image/tiff"];
const ERROR_NOT_VALID = "file_not_valid";
export function validateImage (file: File): Promise<ImageBitmap> {
    return new Promise((resolve, reject)=> {
        let errors: string[] = [];
        if (!VALID_FILE_TYPES.includes(file.type.toLowerCase())) {
            reject(ERROR_NOT_VALID);
        }
        createImageBitmap(file).then (result=> {
            if (result.width < UPLOAD_MIN_SIZE || result.height < UPLOAD_MIN_SIZE) reject("upload_size_too_small");
            else if (result.width > UPLOAD_MAX_SIZE || result.height > UPLOAD_MAX_SIZE) reject("upload_size_too_big");
            else resolve(result);
        }).catch(err=>reject(ERROR_NOT_VALID));
    })
}

export function getImageSettings (image: ImageBitmap, size: {width: number, height: number}): ImageSettings {
    const isWidthBigger = image.width > image.height;
    const containerSize = isWidthBigger ? size.width : size.height;
    const imageSize = isWidthBigger ? image.width : image.height;
    return {
        width: image.width,
        height: image.height,
        resizeFactor: containerSize < imageSize ? imageSize / containerSize : 1
    }
}

export function crop(image: ImageBitmap, p1: Coordinates, p2: Coordinates, resizeFactor: number): Promise<Blob> {
    return new Promise ((resolve, reject) => {
        const rectangle: Rectangle = getRectangle(p1, p2);
        const canvas = document.createElement('canvas');
        canvas.width = rectangle.width * resizeFactor;
        canvas.height = rectangle.height * resizeFactor;

        const canvasCtx = canvas.getContext('2d');
        canvasCtx?.drawImage(image, rectangle.x * resizeFactor, rectangle.y * resizeFactor,
            rectangle.width * resizeFactor, rectangle.height * resizeFactor,
            0, 0, rectangle.width * resizeFactor, rectangle.height * resizeFactor);
        canvasCtx?.save();
        const croppedImage = canvas.toBlob((generated) => generated ? resolve(generated) : reject(),
            "image/png", 1);
    })
}

export interface BadgeUploadResponse extends ApiResponse {
    id: number,
    relativePath: string
}

export class UploadBadgeAction implements ApiAction<BadgeUploadResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "badge/upload";
    onSuccess: (status: number, body?: BadgeUploadResponse) => void = (status: number, body?: BadgeUploadResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface GetMediaResponse extends ApiResponse {
    media: MediaData[]
}

export class GetMediaAction implements ApiAction<BadgeUploadResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "badge/upload";
    onSuccess: (status: number, body?: BadgeUploadResponse) => void = (status: number, body?: BadgeUploadResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}