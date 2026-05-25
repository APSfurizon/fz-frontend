"use client";
import Gallery from "@/components/gallery";
import { useExplore } from "../_components/exploreProvider";
import { useEffect, useMemo, useRef } from "react";
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
import { STATUS_FILTER_ITEMS } from "@/lib/api/gallery/explore/main";
import { useExploreNavigation } from "../_components/exploreNavigationProvider";

export default function GalleryExploreEventPage() {
    const { cache, nextData } = useExplore();
    const { events, photographers, currentFilter, showFilters, setShowFilters, setFilter, loading } = useExploreNavigation();
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
                    initialValue={String(currentFilter?.eventId)}
                    onChange={e => setFilter({ eventId: e?.id ?? null })} />
                <FpSelect fieldName="photographer"
                    className="spacer"
                    label={t("misc.gallery.explore.advanced.photographer.label")}
                    items={selectPhotographerItems}
                    initialValue={String(currentFilter?.photographerId)}
                    onChange={e => setFilter({ photographerId: e?.id ?? null })} />
            </div>
            {isAdmin && <div className="horizontal-list gallery-explore__advanced">
                <FpSelect fieldName="status"
                    className="spacer"
                    label={t("misc.gallery.explore.advanced.status.label")}
                    items={STATUS_FILTER_ITEMS}
                    itemExtractor={inputEntityCodeExtractor}
                    initialValue={String(currentFilter?.status)}
                    onChange={e => setFilter({ status: e?.code as GalleryUploadedMediaStatus ?? null })} />
            </div>}
        </div>}

        {!currentFilter?.eventId && <div className="horizontal-list gap-4mm flex-wrap">
            {[...events.entries()].map(([id, value]) => <EventCard key={id} event={value} onClick={e => setFilter({ eventId: e.event.id })} />)}
        </div>}
        {(!!currentFilter?.eventId || !!currentFilter?.photographerId) && !loading &&
            <Gallery.Root getNextData={nextData} className="explore-gallery">
                <Gallery.GridView refresh={refreshGallery}
                    getFullMedia={(id) => cache.get(id)}
                    onUpdatedMedias={(ids) => ids.forEach(id => cache.evict(id))} />
            </Gallery.Root>
        }
    </>;
}