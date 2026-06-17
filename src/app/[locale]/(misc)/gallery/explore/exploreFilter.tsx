import { useUser } from "@/components/context/userProvider";
import { OptionRendererParams, SelectItem } from "@/lib/components/fpSelect";
import { Key, useMemo } from "react";
import { useExploreFilterData } from "./_components/exploreFilterDataProvider";
import { Permissions } from "@/lib/api/permission";
import { useExploreNavigation } from "./_components/exploreNavigationProvider";
import FpSelect from "@/components/input/fpSelect";
import { useLocale, useTranslations } from "next-intl";
import { STATUS_FILTER_ITEMS } from "@/lib/api/gallery/explore/main";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { TranslatableInputEntityInit } from "@/lib/translations";
import Image from "next/image";
import Icon from "@/components/icon";

type SelectPhotographerItemInit = TranslatableInputEntityInit & {
  officialPhotographer: boolean;
  photoNumber: number;
};

class SelectPhotographerItem extends SelectItem {
  officialPhotographer: boolean = false;
  photoNumber: number = 0;

  static of(data: SelectPhotographerItemInit): SelectPhotographerItem {
    const toReturn = Object.assign(new SelectPhotographerItem(), data);
    toReturn.officialPhotographer = data.officialPhotographer;
    toReturn.photoNumber = data.photoNumber;
    return toReturn;
  }
}

export default function ExploreFilter() {
  const { userDisplay, userLoading } = useUser();
  const isAdmin = useMemo(
    () => userDisplay?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS),
    [userLoading]
  );
  const { events, photographers } = useExploreFilterData();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { currentFilter, showFilters, setFilter } = useExploreNavigation();
  const t = useTranslations();
  const locale = useLocale();

  const selectEventItems = useMemo(
    () =>
      [...events.entries()].map(([id, exploreEvent]) =>
        SelectItem.of({
          id,
          code: exploreEvent.event.slug,
          description: exploreEvent.event.slug,
          translatedDescription: exploreEvent.event.eventNames,
        })
      ),
    [events]
  );

  const selectPhotographerItems = useMemo(
    () =>
      [...photographers.entries()].map(([id, photographer]) =>
        SelectPhotographerItem.of({
          id,
          description: photographer.user.fursonaName,
          imageUrl: photographer.user.propic?.mediaUrl,
          officialPhotographer: photographer.officialPhotographer,
          photoNumber: photographer.photoNumber,
        })
      ),
    [events]
  );

  const photographerOptionRenderer = (params: OptionRendererParams) => {
    const option = params.item as SelectPhotographerItem;
    return (
      <button
        key={params.id as Key}
        type="button"
        tabIndex={0}
        onClick={params.onClick}
        className={[
          "fp-select__option",
          "rounded-s",
          "horizontal-list",
          "align-items-center",
          "gap-2mm",
          params.selected ? "fp-select__option--selected" : "",
        ].join(" ")}
      >
        {params.item.imageUrl ? (
          option.imageUrl && (
            <Image alt="" className="rounded-l" unoptimized width={32} height={32} src={params.item.imageUrl} />
          )
        ) : (
          <div className="fp-select__filler" style={{ width: 32, height: 32 }}></div>
        )}
        <span className="title small">{params.item.getDescription(locale)}</span>
        <div className="spacer"></div>
        <span className="descriptive">{option.photoNumber}</span>
        {option.officialPhotographer && (
          <Icon
            icon="STAR"
            className="highlight"
            containerClassName="highlight"
            title={t("misc.gallery.explore.advanced.photographer.list.official")}
          />
        )}
      </button>
    );
  };

  return (
    showFilters && (
      <div className="vertical-list">
        <div className="horizontal-list gallery-explore__advanced gap-4mm">
          <FpSelect
            fieldName="event"
            className="spacer"
            label={t("misc.gallery.explore.advanced.event.label")}
            items={selectEventItems}
            initialValue={String(currentFilter?.eventId)}
            onChange={(e) => setFilter({ eventId: e?.id ?? null })}
          />
          <FpSelect
            fieldName="photographer"
            className="spacer"
            label={t("misc.gallery.explore.advanced.photographer.label")}
            items={selectPhotographerItems}
            initialValue={String(currentFilter?.photographerId)}
            onChange={(e) => setFilter({ photographerId: e?.id ?? null })}
            optionRenderer={photographerOptionRenderer}
          />
        </div>
        {isAdmin && (
          <div className="horizontal-list gallery-explore__advanced">
            <FpSelect
              fieldName="status"
              className="spacer"
              label={t("misc.gallery.explore.advanced.status.label")}
              items={STATUS_FILTER_ITEMS}
              itemExtractor={inputEntityCodeExtractor}
              initialValue={String(currentFilter?.status)}
              onChange={(e) => setFilter({ status: (e?.code as GalleryUploadedMediaStatus) ?? null })}
            />
          </div>
        )}
      </div>
    )
  );
}
