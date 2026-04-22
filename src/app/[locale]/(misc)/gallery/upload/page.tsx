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
import GalleryFilePicker from "./_components/uploadPanel/filePicker";
import { UploadRepostPermissions } from "@/lib/api/gallery/types";
import { GalleryUploadEventParams, UploadProgress, UploadProgressStatus } from "@/lib/api/gallery/upload/types";
import UploadStatusBox from "./_components/uploadPanel/uploadStatusBox";
import "@/styles/misc/gallery/upload/page.css";
import Modal from "@/components/modal";
import UploadPanel from "./_components/uploadPanel/uploadPanel";

const MAXIMUM_RUNNING_UPLOADS = 1;

export type UploadState = {
    upload: GalleryUpload,
    progress: UploadProgress,
    createdAt: number,
    started: boolean,
    _launched: boolean,
    ended: boolean
};

const CLEARING_STATUSES: UploadProgressStatus[] = [
    "ABORTED",
    "ERROR",
    "DONE"
];

export default function GalleryUploadPage() {
    const { userDisplayRef, userLoading } = useUser();
    const router = useRouter();
    const t = useTranslations("");

    // User shall not access this page if not logged in

    useEffect(() => {
        if (userLoading) return;
        if (!userDisplayRef.current) {
            router.back();
        }
    }, [userLoading]);

    const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

    return <>
        <UploadPanel onUploadUpdate={(u) => setUploads(u)} />
        <div className="uploads-container">
            {[...uploads.entries()].map(([id, u]) => <UploadStatusBox key={id} state={u} />)}
        </div>
    </>
}