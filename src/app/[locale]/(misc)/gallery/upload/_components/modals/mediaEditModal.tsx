import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import AutoInput from "@/components/input/autoInput";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpSelect from "@/components/input/fpSelect";
import Modal from "@/components/modal";
import { GalleryUpdateFormApiAction } from "@/lib/api/gallery/admin/api";
import { GalleryUpdateBody } from "@/lib/api/gallery/admin/types";
import { ExploreEventsApiAction } from "@/lib/api/gallery/explore/api";
import { STATUS_FILTER_ITEMS } from "@/lib/api/gallery/explore/main";
import { ExploreEvent } from "@/lib/api/gallery/explore/type";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { copyrightValues } from "@/lib/api/gallery/upload/main";
import { ApiErrorResponse } from "@/lib/api/networking";
import { runRequest } from "@/lib/api/networking/main";
import { AutoInputUsersManager } from "@/lib/api/user";
import { SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type MediaEditModalProps = {
  medias: GalleryUploadedMedia[];
  open: boolean;
  onClose: () => void;
  onUpdatedMedia: (id: number[]) => void;
};
export default function MediaEditModal(props: Readonly<MediaEditModalProps>) {
  const t = useTranslations("");

  const mixedEvents = useMemo(() => new Set(props.medias.map((m) => m.eventId)).size > 1, [props.medias]);
  const mixedStatuses = useMemo(() => new Set(props.medias.map((m) => m.status)).size > 1, [props.medias]);
  const mixedPhotographers = useMemo(
    () => new Set(props.medias.map((m) => m.photographerUserId)).size > 1,
    [props.medias]
  );

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const { showModal } = useModalUpdate();
  const eventItems = useMemo(
    () =>
      events
        .toSorted((b, a) => new Date(a.event.correctDateFrom).getTime() - new Date(b.event.correctDateFrom).getTime())
        .map((e) =>
          SelectItem.of({
            id: e.event.id,
            code: e.event.slug,
            translatedDescription: e.event.eventNames,
          })
        ),
    [events]
  );

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
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setLoading(false));
  }, [props.open]);

  return (
    <Modal icon="EDIT_SQUARE" open={props.open} onClose={props.onClose} title={t("common.CRUD.edit")} busy={loading}>
      <DataForm
        className="vertical-list gap-2mm"
        hideSave
        action={new GalleryUpdateFormApiAction()}
        editBodyData={editRequestData}
        shouldReset={!props.open}
        onSuccess={() => {
          props.onClose();
          props.onUpdatedMedia([...props.medias.keys()]);
        }}
      >
        <div className="upload-input-data gap-4mm">
          {/* Event selector */}
          <FpSelect
            key={"events" + String(mixedEvents)}
            required={!mixedEvents}
            initialValue={mixedEvents ? undefined : String(props.medias[0]?.eventId)}
            className="spacer"
            fieldName="newEventId"
            items={eventItems}
            label={t("misc.gallery.upload.form.event.label")}
            placeholder={t("misc.gallery.upload.form.event.placeholder")}
          />
          {/* Copyright selector */}
          <FpSelect
            fieldName="newRepostPermissions"
            itemExtractor={inputEntityCodeExtractor}
            items={copyrightValues}
            label={t("misc.gallery.upload.form.copyright.label")}
            placeholder={t("misc.gallery.upload.form.copyright.placeholder")}
          />
          {/* Status selector */}
          <FpSelect
            key={"statuses" + String(mixedStatuses)}
            required={!mixedStatuses}
            initialValue={mixedStatuses ? undefined : props.medias[0]?.status}
            fieldName="newStatus"
            itemExtractor={inputEntityCodeExtractor}
            items={STATUS_FILTER_ITEMS}
            label={t("misc.gallery.explore.advanced.status.label")}
          />
          {/* Photographer selector */}
          <AutoInput
            key={"photographers" + String(mixedPhotographers)}
            required={!mixedPhotographers}
            initialData={
              mixedPhotographers
                ? undefined
                : props.medias[0]?.photographerUserId
                  ? [props.medias[0]?.photographerUserId]
                  : undefined
            }
            manager={new AutoInputUsersManager()}
            fieldName="newPhotographerUserId"
            label={t("misc.gallery.admin.edit.photographer.label")}
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
