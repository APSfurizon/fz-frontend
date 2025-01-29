import { ApiAction, ApiErrorResponse, ApiResponse } from "../api/global"
import { MediaData } from "../api/media"
import { UPLOAD_MAX_SIZE, UPLOAD_SELECTOR_MAX_SIZE, UPLOAD_SELECTOR_MIN_SIZE } from "../constants"

export const VALID_FILE_TYPES = ["image/gif", "image/jpeg", "image/png", "image/bmp", "image/webp", "image/tiff"];
const ERROR_NOT_VALID = "file_not_valid";
export function validateImage (file: File): Promise<ImageBitmap> {
    return new Promise((resolve, reject)=> {
        let errors: string[] = [];
        if (!VALID_FILE_TYPES.includes(file.type.toLowerCase())) {
            reject(ERROR_NOT_VALID);
        }
        createImageBitmap(file).then (result=> {
            if (result.width < UPLOAD_SELECTOR_MIN_SIZE || result.height < UPLOAD_SELECTOR_MIN_SIZE) reject("upload_size_too_small");
            else if (result.width > UPLOAD_SELECTOR_MAX_SIZE || result.height > UPLOAD_SELECTOR_MAX_SIZE) reject("upload_size_too_big");
            else resolve(result);
        }).catch(err=>reject(ERROR_NOT_VALID));
    })
}

export function imageToBlob (image: ImageBitmap): Promise<Blob> {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("bitmaprenderer");
    ctx?.transferFromImageBitmap(image);
    return canvas.convertToBlob();
};

export interface GetMediaResponse extends ApiResponse {
    media: MediaData[]
}

export class GetMediaAction implements ApiAction<GetMediaResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "badge/upload";
    onSuccess: (status: number, body?: GetMediaResponse) => void = (status: number, body?: GetMediaResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export function getScale(data: Cropper.Data): number {
    // currentSize : 1 = max : x
    return Math.min(UPLOAD_MAX_SIZE / data.width, UPLOAD_MAX_SIZE / data.height, 1);
}