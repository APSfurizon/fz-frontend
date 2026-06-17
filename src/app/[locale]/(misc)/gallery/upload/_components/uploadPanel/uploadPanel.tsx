import { useModalUpdate } from "@/components/context/modalProvider";
import { useUser } from "@/components/context/userProvider";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import DataForm from "@/components/input/dataForm";
import FpSelect from "@/components/input/fpSelect";
import Modal from "@/components/modal";
import { UploadRepostPermissions } from "@/lib/api/gallery/types";
import { UploadLimitsApiAction } from "@/lib/api/gallery/upload/api";
import { copyrightValues, GalleryUpload } from "@/lib/api/gallery/upload/main";
import {
  ConventionEventUploadData,
  GalleryUploadEventParams,
  UploadLimitsResponse,
  UploadProgress,
  UploadProgressStatus,
} from "@/lib/api/gallery/upload/types";
import { runRequest } from "@/lib/api/networking/main";
import { ApiErrorResponse, RequestType } from "@/lib/api/networking/types";
import { FormApiAction, FormDTOBuilder, getData } from "@/lib/components/dataForm";
import { OptionRendererParams, SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { TranslatableInputEntityInit } from "@/lib/translations";
import { humanFileSize } from "@/lib/utils";
import { debounce } from "lodash";
import { useLocale, useTranslations } from "next-intl";
import { Key, useCallback, useEffect, useMemo, useRef, useState } from "react";
import GalleryFilePicker from "./filePicker";

const MAXIMUM_RUNNING_UPLOADS = 1;

export type UploadState = {
  upload: GalleryUpload;
  progress: UploadProgress;
  createdAt: number;
  started: boolean;
  _launched: boolean;
  ended: boolean;
};

const CLEARING_STATUSES: UploadProgressStatus[] = ["ABORTED", "ERROR", "DONE"];

type UploadPanelProps = {
  onUploadUpdate: (updates: Map<string, UploadState>) => void;
  onCompletedUpload: () => void;
  onEventItemsLoaded?: (values: SelectItem[]) => void;
};

class EventSelectItem extends SelectItem {
  uploadedCount: number = 0;

  static of(data: TranslatableInputEntityInit & { uploadedCount: number }) {
    const toReturn = Object.assign(new EventSelectItem(), data);
    toReturn.uploadedCount = data.uploadedCount;
    return toReturn;
  }
}

type UploadFormData = {
  eventId?: number;
  copyright?: string;
};

class UploadDataFormDtoBuilder implements FormDTOBuilder<UploadFormData> {
  mapToDTO = (data: FormData) => {
    return {
      eventId: parseInt(getData(data, "eventId") ?? "0") ?? undefined,
      copyright: getData(data, "copyright")?.toString(),
    } as UploadFormData;
  };
}

class UploadDataFormApiAction extends FormApiAction<UploadFormData, any, any> {
  authenticated = false;
  method = RequestType.GET;
  urlAction = "";
  dtoBuilder = new UploadDataFormDtoBuilder();
}

export default function UploadPanel(props: Readonly<UploadPanelProps>) {
  const { userDisplayRef } = useUser();
  const { showModal } = useModalUpdate();
  const formRef = useRef<HTMLFormElement>(null!);
  const [limits, setLimits] = useState<UploadLimitsResponse>();
  const locale = useLocale();
  const t = useTranslations("");

  // Events logic
  const [eventsLoading, setEventsLoading] = useState(false);
  const [events, setEvents] = useState<ConventionEventUploadData[]>([]);
  const eventsItems = useMemo(
    () =>
      events?.map((data) =>
        EventSelectItem.of({
          id: data.event.id,
          code: data.event.slug,
          translatedDescription: data.event.eventNames,
          uploadedCount: data.uploadedCount,
        })
      ) ?? [],
    [events]
  );

  const eventOptionRenderer = useCallback(
    (params: OptionRendererParams) => {
      const option = params.item as EventSelectItem;
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
          <span className="title small">{params.item.getDescription(locale)}</span>
          <div className="spacer"></div>
          {limits && (
            <p className="title average vertical-align-middle">
              <span>
                {option.uploadedCount}
                {limits.maxUploadsNumberPerEvent ? "/" + limits.maxUploadsNumberPerEvent : ""}
              </span>
              <Icon icon="IMAGE" className="color-subtitle" containerClassName="margin-left-1mm" />
            </p>
          )}
        </button>
      );
    },
    [limits]
  );

  useEffect(() => props.onEventItemsLoaded?.(eventsItems), [eventsItems]);

  // Events refresh logic
  /**
   * A debounced method that refreshes the event limits for the user
   * to have updated stats each time
   */
  const refreshEvents = debounce(() => {
    setEventsLoading(true);
    runRequest({ action: new UploadLimitsApiAction() })
      .then((r) => {
        setEvents(r.uploadableEvents);
        setLimits(r);
      })
      .catch((e) => showModal(t("common.error"), <ErrorMessage error={e as ApiErrorResponse} />))
      .finally(() => setEventsLoading(false));
  }, 1000);

  useEffect(() => {
    // First time load events
    refreshEvents();
    refreshEvents.flush();
  }, []);

  // Upload objects
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());
  const uploadFormDataRef = useRef<UploadFormData | undefined>({});
  const [uploadFormData, setUploadFormData] = useState<UploadFormData>();

  const handleUploadQueue = useCallback((prev: typeof uploads) => {
    const next = new Map(prev);
    const running = [...next.values()].filter((state) => state.started && !state.ended);
    const startable = MAXIMUM_RUNNING_UPLOADS - running.length;
    if (startable <= 0) return prev;

    const toRun = [...next.entries()]
      .filter(([, v]) => !v.started)
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .splice(0, startable);

    for (const [id, entry] of toRun) {
      next.set(id, {
        ...entry,
        started: true,
      });
    }

    return next;
  }, []);

  const onUploadStatusUpdate = useCallback(
    (e: GalleryUploadEventParams) => {
      const id = e.data.id;
      setUploads((prev) => {
        const next = new Map(prev);

        const entry = next.get(id);
        if (!entry) return prev;

        const patched: UploadState = {
          ...entry,
          progress: e.data.getProgress(),
          ended: CLEARING_STATUSES.includes(e.data.getProgress().status),
        };

        next.set(id, patched);
        return handleUploadQueue(next);
      });
    },
    [events]
  );

  const onFilesSelected = useCallback(
    (files: File[]) => {
      if (!userDisplayRef.current) return;
      setUploads((prev) => {
        const next = new Map(prev);
        files.forEach((f) => {
          // Create upload object
          const upload = new GalleryUpload({
            eventId: uploadFormDataRef.current?.eventId ?? 0,
            uploadRepostPermissions: uploadFormDataRef.current?.copyright as UploadRepostPermissions,
            file: f,
            userId: userDisplayRef.current!.display.userId,
            autoConfirm: true,
          });
          // Bind events
          upload.addEventHandler("PROGRESS", onUploadStatusUpdate);
          upload.addEventHandler("ABORTED", onUploadStatusUpdate);
          upload.addEventHandler("ERROR", onUploadStatusUpdate);
          const newState: UploadState = {
            upload,
            progress: upload.getProgress(),
            createdAt: Date.now(),
            started: false,
            _launched: false,
            ended: false,
          };
          next.set(upload.id, newState);
        });

        return handleUploadQueue(next);
      });
    },
    [events]
  );

  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    for (const [id, entry] of uploads) {
      if (timers.current.has(id) || !CLEARING_STATUSES.includes(entry.progress.status)) continue;

      const t = window.setTimeout(() => {
        setUploads((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });

        // Fire on complete
        props.onCompletedUpload();
        refreshEvents();
        entry.upload.dispose();
        timers.current.delete(id);
      }, 3100);

      timers.current.set(id, t);
    }
  }, [uploads]);

  useEffect(() => {
    props.onUploadUpdate(uploads);
    for (const entry of uploads.values()) {
      if (entry.started && !entry._launched) {
        entry._launched = true;
        entry.upload.start().catch(() => void 0);
      }
    }
  }, [uploads]);

  // Copyright explaination modal
  const [copyrightExplainationOpen, setCopyrightExplainationOpen] = useState(false);
  const showCopyrightExplainationModal = () => {
    setCopyrightExplainationOpen(true);
  };

  return (
    <div className="upload-panel horizontal-list">
      <DataForm
        formRef={formRef}
        action={new UploadDataFormApiAction()}
        initialEntity={{}}
        className="vertical-list login-form gap-2mm"
        busy={eventsLoading}
        hideSave
        style={{ width: "100vw" }}
        onChange={(changed, newEntity) => {
          if (changed) {
            uploadFormDataRef.current = newEntity;
            setUploadFormData(newEntity);
          }
        }}
      >
        <div className="upload-input-data gap-4mm">
          {/* Event selector */}
          <FpSelect
            required
            className="spacer"
            fieldName="eventId"
            items={eventsItems}
            label={t("misc.gallery.upload.form.event.label")}
            placeholder={t("misc.gallery.upload.form.event.placeholder")}
            optionRenderer={eventOptionRenderer}
          />
          {/* Copyright selector */}
          <FpSelect
            required
            fieldName="copyright"
            itemExtractor={inputEntityCodeExtractor}
            items={copyrightValues}
            label={t("misc.gallery.upload.form.copyright.label")}
            placeholder={t("misc.gallery.upload.form.copyright.placeholder")}
            helpText={t.rich("misc.gallery.upload.form.copyright.help.text", {
              a: (chunks) => (
                <a href="#" onClick={() => showCopyrightExplainationModal()}>
                  {chunks}
                </a>
              ),
            })}
          />
        </div>
        <GalleryFilePicker
          onFilesSelected={(files) => onFilesSelected(files)}
          disabled={limits?.bannedFromUploading || !uploadFormData?.eventId || !uploadFormData?.copyright}
        />
        <span className="descriptive small align-right">
          {limits && (
            <>
              {limits.maxUploadsNumberPerEvent
                ? t("misc.gallery.upload.limits.max_number_per_event", { count: limits.maxUploadsNumberPerEvent })
                : t("misc.gallery.upload.limits.no_limit_per_event")}
              <br />
              {limits.uploadMaxFileSize
                ? t("misc.gallery.upload.limits.size_limit", { size: humanFileSize(limits.uploadMaxFileSize, true) })
                : t("misc.gallery.upload.limits.no_size_limit")}
            </>
          )}
        </span>
      </DataForm>
      <Modal
        open={copyrightExplainationOpen}
        onClose={() => setCopyrightExplainationOpen(false)}
        title={t("misc.gallery.upload.form.copyright.help.modal.title")}
        icon="HELP"
      >
        <p>{t("misc.gallery.upload.form.copyright.help.modal.text")}</p>
        <a href="https://creativecommons.org/licenses">{t("misc.gallery.upload.form.copyright.help.modal.source")}</a>
      </Modal>
    </div>
  );
}
