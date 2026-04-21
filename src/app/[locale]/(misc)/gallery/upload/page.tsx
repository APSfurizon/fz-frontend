"use client"
import { useModalUpdate } from "@/components/context/modalProvider";
import { useUser } from "@/components/context/userProvider";
import ErrorMessage from "@/components/errorMessage";
import DataForm from "@/components/input/dataForm";
import FpSelect from "@/components/input/fpSelect";
import { ConventionEvent } from "@/lib/api/counts";
import { AttendedEventsApiAction } from "@/lib/api/gallery/upload/api";
import { copyrightValues, GalleryUpload } from "@/lib/api/gallery/upload/main";
import { runRequest } from "@/lib/api/global";
import { SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { translate } from "@/lib/translations";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GalleryFilePicker from "./_components/filePicker";
import { UploadRepostPermissions } from "@/lib/api/gallery/types";
import { GalleryUploadEventParams, UploadProgress, UploadProgressStatus } from "@/lib/api/gallery/upload/types";
import UploadStatusBox from "./_components/uploadStatusBox";
import "@/styles/misc/gallery/upload/page.css";
import Button from "@/components/input/button";
import Icon from "@/components/icon";

const MAXIMUM_RUNNING_UPLOADS = 1;

export type UploadState = {
    upload: GalleryUpload,
    progress: UploadProgress,
    createdAt: number,
    started: boolean,
    _launched: boolean,
    ended: boolean
}

const CLEARING_STATUSES: UploadProgressStatus[] = [
    "ABORTED",
    "ERROR",
    "DONE"
]

export default function GalleryUploadPage() {
    const { userDisplayRef, userLoading } = useUser();
    const router = useRouter();
    const { showModal } = useModalUpdate();
    const formRef = useRef<HTMLFormElement>(null!);
    const t = useTranslations("");
    const locale = useLocale();

    // Events logic
    const [eventsLoading, setEventsLoading] = useState(false);
    const [events, setEvents] = useState<ConventionEvent[]>([]);
    const eventsItems = useMemo(() =>
        events?.map(evt => new SelectItem(evt.id,
            evt.slug,
            translate(evt.eventNames, locale),
            undefined,
            undefined,
            undefined,
            evt.eventNames)) ?? [], [events]);

    // Upload objects
    const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

    useEffect(() => {
        setEventsLoading(true);
        runRequest({ action: new AttendedEventsApiAction() })
            .then(r => setEvents(r.events))
            .catch(e => showModal(t("common.error"), <ErrorMessage error={e} />))
            .finally(() => setEventsLoading(false));
    }, []);

    const onFilesSelected = useCallback((files: File[]) => {
        if (!userDisplayRef.current) return;
        const form = new FormData(formRef.current);
        setUploads(prev => {
            const next = new Map(prev);
            files.forEach(f => {
                // Create upload object
                const upload = new GalleryUpload({
                    eventId: Number.parseInt(form.get("eventId")?.toString() ?? "0"),
                    uploadRepostPermissions: form.get("copyright")!.toString() as UploadRepostPermissions,
                    file: f,
                    userId: userDisplayRef.current!.display.userId,
                    autoConfirm: true
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
                    ended: false
                }
                next.set(upload.id, newState);
            });

            return handleUploadQueue(next);
        });
    }, [events]);

    const onUploadStatusUpdate = useCallback((e: GalleryUploadEventParams) => {
        const id = e.data.id;
        setUploads(prev => {
            const next = new Map(prev);

            const entry = next.get(id);
            if (!entry) return prev;

            const patched: UploadState = {
                ...entry,
                progress: e.data.getProgress(),
                ended: CLEARING_STATUSES.includes(e.data.getProgress().status)
            };

            next.set(id, patched);
            return handleUploadQueue(next);
        });
    }, [events]);

    const handleUploadQueue = useCallback((prev: typeof uploads) => {
        const next = new Map(prev);
        const running = [...next.values()]
            .filter(state => state.started && !state.ended);
        const startable = MAXIMUM_RUNNING_UPLOADS - running.length;
        if (startable <= 0) return prev;

        const toRun = [...next.entries()]
            .filter(([_, v]) => !v.started)
            .sort((a, b) => a[1].createdAt - b[1].createdAt)
            .splice(0, startable);

        for (const [id, entry] of toRun) {
            next.set(id, {
                ...entry,
                started: true
            });
        }

        return next;
    }, []);

    useEffect(() => {
        const timers = new Map<string, number>();
        for (const [id, entry] of uploads) {
            if (timers.has(id) || !CLEARING_STATUSES.includes(entry.progress.status)) continue;

            const t = window.setTimeout(() => {
                setUploads(prev => {
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });

                entry.upload.dispose();
            }, 5000);

            timers.set(id, t);
        }

        return () => timers.forEach(clearTimeout);
    }, [uploads]);

    useEffect(() => {
        for (const entry of uploads.values()) {
            if (entry.started && !entry._launched) {
                entry._launched = true;
                entry.upload.start();
            }
        }
    }, [uploads]);

    // Copyright explaination modal
    const showCopyrightExplainationModal = () => {
        showModal(t("misc.gallery.upload.form.copyright.help.modal.title"), <></>, "HELP");
    }

    // User shall not access this page if not logged in

    useEffect(() => {
        if (userLoading) return;
        if (!userDisplayRef.current) {
            router.back();
        }
    }, [userLoading]);

    return <>
        <div className="horizontal-list">
            <DataForm formRef={formRef}
                className="vertical-list login-form gap-2mm"
                busy={eventsLoading}
                hideSave
                style={{ width: "100vw" }}>
                <div className="horizontal-list gap-4mm">
                    {/* Event selector */}
                    <FpSelect required
                        className="spacer"
                        fieldName="eventId"
                        items={eventsItems}
                        label={t("misc.gallery.upload.form.event.label")}
                        placeholder={t("misc.gallery.upload.form.event.placeholder")} />
                    {/* Copyright selector */}
                    <FpSelect required
                        fieldName="copyright"
                        itemExtractor={inputEntityCodeExtractor}
                        items={copyrightValues}
                        label={t("misc.gallery.upload.form.copyright.label")}
                        placeholder={t("misc.gallery.upload.form.copyright.placeholder")}
                        helpText={t.rich("misc.gallery.upload.form.copyright.help.text", {
                            a: chunks => <a href="#" onClick={() => showCopyrightExplainationModal()}>{chunks}</a>
                        })} />
                </div>
                <GalleryFilePicker onFilesSelected={onFilesSelected} />
                <div className="uploads-container">
                    {[...uploads.entries()].map(([id, u]) => <UploadStatusBox key={id} state={u} />)}
                </div>
            </DataForm>
        </div>
    </>
}