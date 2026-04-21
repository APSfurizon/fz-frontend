export function getThumbnail(file: File): Promise<Blob> {
    return file.type.split("/")[0].toLowerCase() === "video"
        ? getVideoThumbnail(file)
        : getImageThumbnail(file)
}

export function getVideoThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.playsInline = true;
        video.muted = true;
        video.preload = "metadata";
        const canvas = new OffscreenCanvas(320, 320);
        // Set the source
        video.src = URL.createObjectURL(file);
        // Event listener
        video.addEventListener("loadeddata", () => {
            const { width, height } = getThumbnailCappedSize(video.videoWidth, video.videoHeight);
            canvas.width = width;
            canvas.height = height;
            video.requestVideoFrameCallback(() => {
                // Draw image
                canvas.getContext("2d")?.drawImage(video, 0, 0, width, height);
                URL.revokeObjectURL(video.src);
                resolve(canvas.convertToBlob());
            })
        });
    });
}

export function getImageThumbnail(file: File): Promise<Blob> {
    // Get image sizes
    return createImageBitmap(file).then(original => {
        const data = { width: original.width, height: original.height };
        // Dispose image bitmap
        original.close();
        return Promise.resolve(data);
    }).then(originalSize => {
        const newSizes = getThumbnailCappedSize(originalSize.width, originalSize.height);
        return createImageBitmap(file, {
            resizeWidth: newSizes.width,
            resizeHeight: newSizes.height,
            resizeQuality: "medium"
        });
    }).then(thumbnailImage => imageToBlob(thumbnailImage, true));
}

const MAX_THUMBNAIL_SIZE = 320;
export function getThumbnailCappedSize(width: number, height: number) {
    type Size = { width: number, height: number };
    const data: Size = { width, height };
    const toEvaluate: { bigger: keyof Size, resized: keyof Size } = { bigger: "width", resized: "height" };
    if (height > width) {
        toEvaluate.bigger = "height";
        toEvaluate.resized = "width";
    }
    // Proportion of sizes
    return {
        [toEvaluate.bigger]: MAX_THUMBNAIL_SIZE,
        [toEvaluate.resized]: Math.floor((data[toEvaluate.resized] * MAX_THUMBNAIL_SIZE) / data[toEvaluate.bigger])
    } as Size;
}

export function imageToBlob(image: ImageBitmap, closeBitmap: boolean = false): Promise<Blob> {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("bitmaprenderer");
    ctx?.transferFromImageBitmap(image);
    if (closeBitmap) {
        image.close();
    }
    return canvas.convertToBlob();
};