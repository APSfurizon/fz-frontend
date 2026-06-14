import FpButton from "@/components/input/fpButton";
import DataForm from "@/components/input/dataForm";
import FpSelect from "@/components/input/fpSelect";
import Modal from "@/components/modal";
import { ConventionEvent } from "@/lib/api/counts";
import { GalleryUpdateFormApiAction } from "@/lib/api/gallery/admin/api";
import { copyrightValues } from "@/lib/api/gallery/upload/main";
import { GalleryUpdateBody } from "@/lib/api/gallery/admin/types";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { translate } from "@/lib/translations";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { runRequest } from "@/lib/api/global";
import { ExploreEventsApiAction } from "@/lib/api/gallery/explore/api";
import { ExploreEvent } from "@/lib/api/gallery/explore/type";
import { STATUS_FILTER_ITEMS } from "@/lib/api/gallery/explore/main";

type MediaEditModalProps = {
  medias: GalleryUploadedMedia[];
  open: boolean;
  onClose: () => void;
  onUpdatedMedia: (id: number[]) => void;
};
export default function MediaEditModal(props: Readonly<MediaEditModalProps>) {
  const t = useTranslations("");

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const eventItems = useMemo(
    () =>
      events.map((e) =>
        SelectItem.of({
          id: e.event.id,
          code: e.event.slug,
          translatedDescription: e.event.eventNames,
        })
      ),
    [events]
  );

  const eventEditingLocked = useMemo(() => new Set(props.medias.map((m) => m.eventId)).size > 1, []);

  const editRequestData = (data: GalleryUpdateBody) => {
    return {
      ...data,
      uploadIds: [...props.medias].map((m) => m.id),
    };
  };

  useEffect(() => {
    if (!props.open) return;
    setLoading(true);
    runRequest({ action: new ExploreEventsApiAction() })
      .then((r) => setEvents(r.events))
      .finally(() => setLoading(false));
  }, [props.open]);

  return (
    <Modal icon="EDIT_SQUARE" open={props.open} onClose={props.onClose} title={t("common.CRUD.edit")} busy={loading}>
      <DataForm
        className="vertical-list gap-2mm"
        hideSave
        action={new GalleryUpdateFormApiAction()}
        editBodyData={editRequestData}
        onSuccess={() => {
          props.onClose();
          props.onUpdatedMedia([...props.medias.keys()]);
        }}
      >
        <div className="upload-input-data gap-4mm">
          {/* Event selector */}
          <FpSelect
            required
            className="spacer"
            fieldName={!eventEditingLocked ? "newEventId" : undefined}
            disabled={eventEditingLocked}
            items={eventItems}
            label={t("misc.gallery.upload.form.event.label")}
            initialValue={!eventEditingLocked ? String(props.medias[0]?.eventId) : undefined}
            placeholder={t("misc.gallery.upload.form.event.placeholder")}
          />
          {/* Copyright selector */}
          <FpSelect
            required
            fieldName="newRepostPermissions"
            itemExtractor={inputEntityCodeExtractor}
            items={copyrightValues}
            label={t("misc.gallery.upload.form.copyright.label")}
            placeholder={t("misc.gallery.upload.form.copyright.placeholder")}
          />
          {/* Copyright selector */}
          <FpSelect
            required
            fieldName="newStatus"
            itemExtractor={inputEntityCodeExtractor}
            items={STATUS_FILTER_ITEMS}
            label={t("misc.gallery.explore.advanced.status.label")}
          />
          <div className="bottom-toolbar">
            <FpButton
              className="danger"
              title={t("common.cancel")}
              icon="CANCEL"
              type="button"
              onClick={() => props.onClose()}
            >
              {t("common.cancel")}
            </FpButton>
            <div className="spacer"></div>
            <FpButton type="submit" title={t("common.CRUD.save")} icon="SAVE">
              {t("common.CRUD.save")}
            </FpButton>
          </div>
        </div>
      </DataForm>
    </Modal>
  );
}
