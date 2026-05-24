"use client";
import Gallery from "@/components/gallery";
import { FilterSetterData, useExplore } from "../_components/exploreProvider";
import { runRequest } from "@/lib/api/global";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExploreApiAction } from "@/lib/api/gallery/explore/api";
import { buildSearchParams } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { SelectItem } from "@/lib/components/fpSelect";
import FpSelect from "@/components/input/fpSelect";
import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import EventCard from "../_components/eventCard";
import FpButton from "@/components/input/fpButton";
import "@/styles/misc/gallery/explore/explore.scss";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { inputEntityCodeExtractor } from "@/lib/components/input";

const EVENT_PATH = "events";
const PHOTOGRAPHER_PATH = "photographers";
const PATH_REGEX = /^$|^(events\/\d+)\/?$|^(photographers\/\d+)\/?$|^(events\/\d+)\/(photographers\/\d+)$/;

const statusSelectItems = [
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

export default function GalleryExploreEventPage() {
    const params = useParams();
    const router = useRouter();
    const { cache, events, photographers, loading, reloadData, searchFilter, currentFilter, showFilters, setShowFilters } = useExplore();
    const t = useTranslations();
    const refreshGallery = useRef<() => void>(null!);
    const { userDisplayRef } = useUser();

    const isAdmin = useMemo(() => userDisplayRef.current?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS), [userDisplayRef.current]);

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
    const handleUrl = () => {
        const s = params.data as string[];
        const [path1, param1, path2, param2] = s ?? [];
        const url = (s ?? []).join("/");
        if (PATH_REGEX.test(url)) {
            if (path1 === EVENT_PATH && path2 === PHOTOGRAPHER_PATH) {
                searchFilter({ eventId: parseInt(param1), photographerId: parseInt(param2) });
            } else if (path1 === EVENT_PATH) {
                searchFilter({ eventId: parseInt(param1), photographerId: null });
            } else if (path1 === PHOTOGRAPHER_PATH) {
                searchFilter({ photographerId: parseInt(param1), eventId: null });
            } else {
                searchFilter({ photographerId: null, eventId: null });
            }
        } else {
            // If params are malformed
            router.replace("/gallery/explore");
        }
    }

    useEffect(() => {
        handleUrl();
    }, []);

    const nextData = (currentCursor: number) => {
        console.debug(`Fetching with Photographer (${currentFilter?.photographer?.user.userId}) and Event (${currentFilter?.event?.event.id})`)
        return runRequest({
            action: new ExploreApiAction(),
            searchParams: buildSearchParams({
                photographerUserId: String(currentFilter?.photographer?.user.userId ?? ""),
                eventId: String(currentFilter?.event?.event.id ?? ""),
                fromUploadId: String(currentCursor)
            })
        }).then(r => r.results);
    }

    const setFilter = (data: FilterSetterData) => {
        const values = [];
        if (data?.eventId !== null && (data?.eventId || currentFilter?.event)) {
            values.push(EVENT_PATH, data.eventId ?? currentFilter?.event?.event.id);
        }
        if (data?.photographerId !== null && (data?.photographerId || currentFilter?.photographer)) {
            values.push(PHOTOGRAPHER_PATH, data.photographerId ?? currentFilter?.photographer?.user.userId);
        }
        router.push(`/gallery/explore/${values.join("/")}`);
    }

    useEffect(() => refreshGallery.current?.(), [currentFilter]);

    useTitle(t("misc.gallery.explore.title"));

    return <>
        <div className="gallery-explore__header horizontal-list">
            <span role="title" className="title x-large bold">{t("misc.gallery.explore.header.title")}</span>
            <div className="spacer"></div>
            <FpButton iconButton
                icon={showFilters ? "FILTER_ALT_OFF" : "FILTER_ALT"}
                iconClass="large"
                title={t("misc.gallery.explore.advanced.title")}
                onClick={() => setShowFilters(prev => !prev)} />

        </div>
        {showFilters && <div className="vertical-list">
            <div className="horizontal-list gallery-explore__advanced gap-4mm">
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
            {isAdmin && <div className="horizontal-list gallery-explore__advanced">
                <FpSelect fieldName="status"
                    className="spacer"
                    label={t("misc.gallery.explore.advanced.status.label")}
                    items={statusSelectItems}
                    itemExtractor={inputEntityCodeExtractor}
                    initialValue={String(currentFilter?.status)}
                    onChange={e => setFilter({ status: e?.code as GalleryUploadedMediaStatus ?? null })} />
            </div>}
        </div>}

        {!currentFilter?.event && <div className="horizontal-list gap-4mm flex-wrap">
            {[...events.entries()].map(([id, value]) => <EventCard key={id} event={value} onClick={e => setFilter({ eventId: e.event.id })} />)}
        </div>}
        {(!!currentFilter?.event || !!currentFilter?.photographer) &&
            <Gallery.Root getNextData={nextData} className="explore-gallery">
                <Gallery.GridView refresh={refreshGallery}
                    getFullMedia={(id) => cache.get(id)}
                    onUpdatedMedias={(ids) => ids.forEach(id => cache.evict(id))} />
            </Gallery.Root>
        }
    </>;
}