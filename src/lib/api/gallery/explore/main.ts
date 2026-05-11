import { CachedData } from "@/lib/cache/cache";
import { GalleryUploadedFullMedia } from "../types";
import { runRequest } from "../../global";
import { GetFullMediaApiAction } from "../api";

export class CachedFullMedias extends CachedData<GalleryUploadedFullMedia> {
    duration: number = 1 * 60 * 1000; // 1 minute
    loadData(...p: any[]): Promise<GalleryUploadedFullMedia> {
        return runRequest({
            action: new GetFullMediaApiAction(),
            pathParams: { "id": p[0] }
        })
    }
}