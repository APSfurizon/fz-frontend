"use client";
import Gallery from "@/components/gallery";
import { useExplore } from "../_components/exploreProvider";
import { runRequest } from "@/lib/api/global";
import { useEffect, useMemo, useRef } from "react";
import { ExploreApiAction } from "@/lib/api/gallery/explore/api";
import { buildSearchParams } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SelectItem } from "@/lib/components/fpSelect";
import FpSelect from "@/components/input/fpSelect";
import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import EventCard from "../_components/eventCard";

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
    const { cache, events, photographers, loading, reloadData, setFilter, searchFilter, currentFilter } = useExplore();
    const t = useTranslations();
    const refreshGallery = useRef<() => void>(null!);

    const selectEventItems = useMemo(() => [...events.entries()].map(([id, exploreEvent]) =>
        SelectItem.of({
            id,
            code: exploreEvent.event.slug,
            description: exploreEvent.event.slug,
            translatedDescription: exploreEvent.event.eventNames
        })), [events]);

    const selectPhotographerItems = useMemo(() => [...photographers.entries()].map(([id, photographer]) =>
        SelectItem.of({
            id,
            description: photographer.user.fursonaName,
            imageUrl: photographer.user.propic?.mediaUrl
        })), [events]);

    // Handle urls
    useEffect(() => {
        params.then(s => {
            const [path1, param1, path2, param2] = s.data ?? [];
            const url = (s.data ?? []).join("/");
            if (PATH_REGEX.test(url)) {
                if (path1 === EVENT_PATH && path2 === PHOTOGRAPHER_PATH) {
                    searchFilter({ eventId: parseInt(param1), photographerId: parseInt(param2) });
                } else if (path1 === EVENT_PATH) {
                    searchFilter({ eventId: parseInt(param1) });
                } else if (path1 === PHOTOGRAPHER_PATH) {
                    searchFilter({ photographerId: parseInt(param1) });
                } else {
                    reloadData();
                }
            } else {
                // If params are malformed
                router.replace("/gallery/explore");
            }
        })
    }, [params]);

    // Update url based off filters
    useEffect(() => {
        console.log("was");
        const values = [];
        if (currentFilter?.event) {
            values.push(EVENT_PATH, currentFilter.event.event.id);
        }
        if (currentFilter?.photographer) {
            values.push(PHOTOGRAPHER_PATH, currentFilter.photographer.user.userId);
        }
        window.history.pushState({}, '', `/gallery/explore/${values.join("/")}`);
        refreshGallery.current && refreshGallery.current();
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

    useTitle(t("misc.gallery.explore.title"))

    return <>
        <div className="horizontal-list gap-4mm">
            <FpSelect fieldName="event"
                className="spacer"
                label={t("misc.gallery.explore.advanced.event.label")}
                items={selectEventItems}
                initialValue={String(currentFilter?.event?.event.id)}
                onChange={e => setFilter({ eventId: e?.id ?? null })} />
            <FpSelect fieldName="photographer"
                className="spacer"
                label={t("misc.gallery.explore.advanced.photographer.label")}
                items={selectPhotographerItems}
                initialValue={String(currentFilter?.photographer?.user.userId)}
                onChange={e => setFilter({ photographerId: e?.id ?? null })} />
        </div>
        {[...events.entries()].map(([id, value]) => <EventCard key={id} event={value} />)}
        {(!!currentFilter?.event || !!currentFilter?.photographer) &&
            <Gallery.Root getNextData={nextData} className="explore-gallery">
                <Gallery.GridView refresh={refreshGallery} getFullMedia={(id) => cache.get(id)} />
            </Gallery.Root>
        }
    </>;
}