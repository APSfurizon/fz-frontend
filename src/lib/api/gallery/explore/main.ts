import { CachedData } from "@/lib/cache/cache";
import { GalleryUploadedFullMedia } from "../types";
import { runRequest } from "../../global";
import { GetFullMediaApiAction } from "../api";

export class CachedFullMedias extends CachedData<GalleryUploadedFullMedia> {
    duration: number = 20 * 60 * 1000; // 20 minutes
    loadData(...p: any[]): Promise<GalleryUploadedFullMedia> {
        return runRequest({
            action: new GetFullMediaApiAction(),
            pathParams: { "id": p[0] }
        })
    }

    // Can cache ONLY if the picture's approved and processed
    override canStoreInCache(data: GalleryUploadedFullMedia): boolean {
        return data?.status === "APPROVED" && !!data?.displayMedia
    }
}