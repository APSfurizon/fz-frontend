import { UPLOAD_MAX_SIZE, UPLOAD_MIN_SIZE } from "../constants"

export type Media = {
    id: number,
    type: string,
    path: string
}

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

export function cropAndUpload(image: ImageBitmap) {
    
}