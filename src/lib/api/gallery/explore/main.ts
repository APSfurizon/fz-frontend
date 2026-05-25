import { CachedData } from "@/lib/cache/cache";
import { GalleryUploadedFullMedia, GalleryUploadedMediaStatus } from "../types";
import { runRequest } from "../../global";
import { GetFullMediaApiAction } from "../api";
import { SelectItem } from "@/lib/components/fpSelect";

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

export const STATUS_FILTER_ITEMS = [
    SelectItem.of({
        code: "PENDING" as GalleryUploadedMediaStatus,
        icon: "HISTORY_TOGGLE_OFF",
        description: "pending",
        translatedDescription: {
            "it-it": "In attesa",
            "en-gb": "Pending"
        }
    }),
    SelectItem.of({
        code: "APPROVED" as GalleryUploadedMediaStatus,
        icon: "THUMB_UP",
        description: "approved",
        translatedDescription: {
            "it-it": "Approvato",
            "en-gb": "Approved"
        }
    }),
    SelectItem.of({
        code: "REJECTED" as GalleryUploadedMediaStatus,
        icon: "THUMB_DOWN",
        description: "rejected",
        translatedDescription: {
            "it-it": "Rifiutato",
            "en-gb": "Rejected"
        }
    })
];

export const ExploreUrl = {
    EVENT: "events",
    PHOTOGRAPHER: "photographers",
    STATUS: "status"
} as const;

type ExploreSlug = {
    event: number | null,
    photographer: number | null,
    status: GalleryUploadedMediaStatus | null
};

const validStatus: GalleryUploadedMediaStatus[] = ["APPROVED", "PENDING", "REJECTED"];

export function parseExploreSlug(slug?: string[]): ExploreSlug {
    const params: ExploreSlug = {
        event: null,
        photographer: null,
        status: null
    };
    if (!slug) return params;

    for (let i = 0; i < slug.length; i += 2) {
        const key = slug[i];
        const value = slug[i + 1];
        if (key && value) {
            switch (key) {
                case ExploreUrl.EVENT:
                    params.event = parseInt(value);
                    break;
                case ExploreUrl.PHOTOGRAPHER:
                    params.photographer = parseInt(value);
                    break;
                case ExploreUrl.STATUS:
                    params.status = validStatus.includes(value as GalleryUploadedMediaStatus)
                        ? value as GalleryUploadedMediaStatus
                        : null;
                    break;
            }
        }
    }
    return params;
}