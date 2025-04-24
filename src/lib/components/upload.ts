import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../api/global"
import { MediaData } from "../api/media"
import { UPLOAD_SELECTOR_MAX_SIZE, UPLOAD_SELECTOR_MIN_SIZE } from "../constants"

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

export function scaleBlob (b: Blob, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise<Blob>(async (resolve, reject) => {
        const generatedImage = await createImageBitmap(b);
        if (!generatedImage) reject("Blob invalid");
        const scale = Math.min(maxWidth / generatedImage.width, maxHeight / generatedImage.height, 1);
        const oWidth = generatedImage.width;
        const oHeight = generatedImage.height;
        generatedImage?.close();
        const imageToReturn = await createImageBitmap(b, {resizeWidth: oWidth * scale, resizeHeight: oHeight * scale});
        if (!imageToReturn) {
            reject("Image resize failed");
        } else {
            const toReturn = await imageToBlob(imageToReturn);
            resolve(toReturn);
        }
    })
}

export interface GetMediaResponse extends ApiResponse {
    media: MediaData[]
}

export class GetMediaAction extends ApiAction<GetMediaResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "badge/upload";
}