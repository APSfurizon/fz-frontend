import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useExploreFilterData } from "./exploreFilterDataProvider";
import "@/styles/misc/gallery/explore/galleryBanner.scss";
import { translate } from "@/lib/translations";

export default function GalleryBanner() {
  const { currentFilterData } = useExploreFilterData();
  const locale = useLocale();
  const t = useTranslations();
  const formatter = useFormatter();

  return (
    currentFilterData && (
      <>
        {currentFilterData.event && (
          <div className="gallery-banner__event rounded-l">
            <img
              className="gallery-banner__event__image"
              src={currentFilterData.event.cardDisplayMedia?.mediaUrl ?? "/images/logo_dark.svg"}
            />
            <div className="gallery-banner__event__overlay">
              <div className="vertical-list gallery-banner__event__name">
                <span className="title x-large">{translate(currentFilterData.event.event.eventNames, locale)}</span>
                <span className="descriptive average color-subtitle">
                  {formatter.dateTimeRange(
                    new Date(currentFilterData.event.event.correctDateFrom),
                    new Date(currentFilterData.event.event.correctDateTo),
                    { dateStyle: "medium" }
                  )}
                </span>
                <span className="descriptive small color-subtitle">
                  {t("misc.gallery.explore.events.card.photo_count", { count: currentFilterData.event.photoNumber })}
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    )
  );
}
