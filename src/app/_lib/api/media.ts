import { BadgeUploadResponse } from "../components/upload";

export interface MediaData {
    id: number,
    relativePath: string
    mediaType: string
}

export function fromUploadResponse (data: BadgeUploadResponse): MediaData {
    return {
        id: data.id,
        relativePath: data.relativePath,
        mediaType: "image/jpeg"
    }
}