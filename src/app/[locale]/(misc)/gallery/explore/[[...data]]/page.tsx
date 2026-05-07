"use client";
import Gallery from "@/components/gallery";
import { useExplore } from "../_components/exploreProvider";
import { runRequest } from "@/lib/api/global";
import { useEffect } from "react";
import { ExploreApiAction, ExploreEventsApiAction } from "@/lib/api/gallery/explore/api";
import { buildSearchParams, parseId } from "@/lib/utils";
import { useRouter } from "next/navigation";

const EVENT_PATH = "events";
const PHOTOGRAPHER_PATH = "photographers";
const PATH_REGEX = /^$|^(events\/\d+)\/?$|^(photographers\/\d+)\/?$|^(events\/\d+)\/(photographers\/\d+)$/;

export default function GalleryExploreEventPage({ params }: { params: Promise<{ data: string[] }> }) {
    /* 
        Handle urls:
            /events/[eventid]/photographers/[photographerid]
            /events/[eventid]
            /photographers/[photographerid]
            /
    */
    const router = useRouter();
    const { events, photographers, loading, reloadData, setFixedEvent, setFixedPhotographer, searchPhotographer, searchEvent, searchData, currentFilter } = useExplore();

    useEffect(() => {
        params.then(s => {
            const [path1, param1, path2, param2] = s.data ?? [];
            const url = (s.data ?? []).join("/");
            if (PATH_REGEX.test(url)) {
                if (path1 === EVENT_PATH && path2 === PHOTOGRAPHER_PATH) {
                    searchData(parseInt(param1), parseInt(param2));
                } else if (path1 === EVENT_PATH) {
                    searchEvent(parseInt(param1));
                } else if (path1 === PHOTOGRAPHER_PATH) {
                    searchPhotographer(parseInt(param1));
                }
            } else {
                // If params are malformed
                router.replace("/gallery/explore");
            }
        })
    }, [params])

    useEffect(() => {
        if (!currentFilter) return;
        reloadData();
    }, [currentFilter])

    const nextData = (currentCursor: number) => {
        return runRequest({
            action: new ExploreApiAction(),
            searchParams: buildSearchParams({
                photographerUserId: String(currentFilter?.photographer?.user.userId ?? ""),
                eventId: String(currentFilter?.event?.event.id ?? ""),
                fromUploadId: String(currentCursor)
            })
        }).then(r => r.results);
    }

    return <>
        {currentFilter &&
            <Gallery.Root getNextData={nextData}>
                <Gallery.GridView>

                </Gallery.GridView>
            </Gallery.Root>
        }
    </>;
}