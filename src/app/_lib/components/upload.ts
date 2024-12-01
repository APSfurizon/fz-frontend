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

export type HandleSettings = {
    x: number,
    y: number
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
            resolve(result);
        }).catch(err=>reject(ERROR_NOT_VALID));
    })
}

export function getImageSettings (image: ImageBitmap, container: HTMLElement): ImageSettings {
    const isWidthBigger = image.width > image.height;
    const containerSize = isWidthBigger ? container.clientWidth : container.clientHeight;
    const imageSize = isWidthBigger ? image.width : image.height;
    console.log(isWidthBigger, containerSize, imageSize);
    return {
        width: image.width,
        height: image.height,
        resizeFactor: containerSize < imageSize ? imageSize / containerSize : 1
    }
}