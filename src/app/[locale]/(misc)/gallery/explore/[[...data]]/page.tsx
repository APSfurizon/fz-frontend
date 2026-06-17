"use client";
import Gallery from "@/components/gallery";
import useTitle from "@/components/hooks/useTitle";
import FpButton from "@/components/input/fpButton";
import "@/styles/misc/gallery/explore/explore.scss";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useExploreNavigation } from "../_components/exploreNavigationProvider";
import { useExplore } from "../_components/exploreProvider";
import GalleryBanner from "../_components/galleryBanner";
import GalleryEvents from "../_components/galleryEvents";
import ExploreFilter from "../exploreFilter";

export default function GalleryExploreEventPage() {
  const { cache, nextData } = useExplore();
  const { currentFilter, showFilters, setShowFilters } = useExploreNavigation();
  const t = useTranslations();
  const refreshGallery = useRef<() => void>(null!);

  useTitle(t("misc.gallery.explore.title"));

  return (
    <>
      <div className="gallery-explore__header horizontal-list">
        <span role="title" className="title x-large bold">
          {t("misc.gallery.explore.header.title")}
        </span>
        <div className="spacer"></div>
        <FpButton
          iconButton
          icon={showFilters ? "FILTER_ALT_OFF" : "FILTER_ALT"}
          iconClass="large"
          title={t("misc.gallery.explore.advanced.title")}
          onClick={() => setShowFilters((prev) => !prev)}
        />
      </div>
      <ExploreFilter />
      <GalleryEvents />
      <GalleryBanner />
      {(!!currentFilter?.eventId || !!currentFilter?.photographerId) && (
        <Gallery.Root
          key={"" + currentFilter.eventId + currentFilter.photographerId}
          getNextData={nextData}
          className="explore-gallery"
        >
          <Gallery.GridView
            refresh={refreshGallery}
            getFullMedia={(id) => cache.get(id)}
            onUpdatedMedias={(ids) => ids.forEach((id) => cache.evict(id))}
          />
        </Gallery.Root>
      )}
    </>
  );
}
