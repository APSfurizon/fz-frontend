"use client"
import { useUser } from "@/components/context/userProvider";
import { MyUploadsApiAction } from "@/lib/api/gallery/upload/api";
import { GalleryUpload } from "@/lib/api/gallery/upload/main";
import { runRequest } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GalleryUploadedMedia, UploadProgress, UploadProgressStatus } from "@/lib/api/gallery/upload/types";
import UploadStatusBox from "./_components/uploadStatusBox";
import UploadPanel from "./_components/uploadPanel/uploadPanel";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingPanel from "@/components/loadingPanel";
import { buildSearchParams } from "@/lib/utils";
import UploadedImage from "./_components/uploadedMedia";
import "@/styles/misc/gallery/upload/page.css";
import Button from "@/components/input/button";

export type UploadState = {
    upload: GalleryUpload,
    progress: UploadProgress,
    createdAt: number,
    started: boolean,
    _launched: boolean,
    ended: boolean
};

export default function GalleryUploadPage() {
    const { userDisplayRef, userLoading } = useUser();
    const router = useRouter();
    const path = usePathname();
    const t = useTranslations("");

    // User shall not access this page if not logged in

    useEffect(() => {
        if (userLoading) return;
        if (!userDisplayRef.current) {
            router.push(`/login?continue=${path}`);
        }
    }, [userLoading]);

    // Uploads map
    const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

    // Media grid logic
    const [selection, setSelection] = useState<Set<number>>(new Set());
    const [medias, setMedias] = useState<Map<number, GalleryUploadedMedia>>(new Map());
    /** The key of the latest media uploaded, also being the first in the grid */
    const maxKey = useMemo(() => medias.keys().reduce((prev, next) => Math.max(prev, next), 0), [medias]);
    /** The key of the oldest media uploaded */
    const minKey = useMemo(() => medias.keys().reduce((prev, next) => Math.min(prev, next), Number.MAX_SAFE_INTEGER), [medias]);
    const [ended, setEnded] = useState(false);

    // Loading state
    const [loading, setLoading] = useState(false);

    // When scrolling past the last loaded media batch
    const onNextData = useCallback(() => {
        setLoading(true);
        runRequest({
            action: new MyUploadsApiAction(),
            searchParams: buildSearchParams({ "fromUploadId": String(!minKey ? "" : minKey) })
        }).then(result => {
            setMedias(prev => {
                const next = new Map(prev);
                result.results.forEach(r => next.set(r.id, r));
                return next;
            });
            setEnded(!result.results.length)
        }).finally(() => setLoading(false));
    }, [medias]);

    const onRefresh = useCallback(() => {
        setMedias(new Map());
        setSelection(new Set());
        setEnded(false);
    }, []);

    const onSelect = useCallback((id: number, selected: boolean) => {
        setSelection(prev => {
            const next = new Set(prev);
            if (selected) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, [medias])

    // Append the latest uploaded images
    const timeoutHandle = useRef<any>(null!);
    const isPrependRunning = useRef(false);
    const shouldRePrepend = useRef(false);

    const prependUploadedImages = useCallback(() => {
        // Cleanup timer
        if (timeoutHandle.current) window.clearTimeout(timeoutHandle.current);
        // Define the retrieving logic
        const request = (lastImageId: number) => runRequest({
            action: new MyUploadsApiAction(),
            searchParams: buildSearchParams({
                "fromUploadId": String(lastImageId ?? ""),
                "after": String(true)
            })
        });
        // Define the loop promise logic
        const requestLoop = async (lastImageId: number) => {
            setLoading(true);
            const toReturn: GalleryUploadedMedia[] = [];
            let idToUse = lastImageId;
            let lastRetrievedItems: GalleryUploadedMedia[] = [];
            do {
                lastRetrievedItems = (await request(idToUse)).results;
                toReturn.splice(0, 0, ...lastRetrievedItems);
                idToUse = toReturn.map(e => e.id).reduce((a, b) => Math.max(a, b), 0);
            } while (lastRetrievedItems.length);
            setLoading(false);
            return toReturn;
        };

        // Load batches of the latest images until every new image has been recovered
        timeoutHandle.current = window.setTimeout(async () => {
            if (isPrependRunning.current) {
                shouldRePrepend.current = true;
                return;
            }
            isPrependRunning.current = true;
            try {
                do {
                    shouldRePrepend.current = false;
                    const result = await requestLoop(maxKey);
                    setMedias(prev => {
                        const next = new Map(prev);
                        result.forEach(r => next.set(r.id, r));
                        return next;
                    });
                } while (shouldRePrepend.current)
            } finally {
                isPrependRunning.current = false;
            }
        }, 1000);
    }, []);

    const sortFn = ((a: [number, GalleryUploadedMedia], b: [number, GalleryUploadedMedia]) => b[0] - a[0]);
    const imageSize = globalThis.document
        ? Number(globalThis.getComputedStyle(globalThis.document.body).getPropertyValue("--grid-column-width").replace("px", ""))
        : 80;

    return <>
        <UploadPanel onUploadUpdate={(u) => setUploads(u)}
            onCompletedUpload={prependUploadedImages} />
        <h3 className="title medium">{t("misc.gallery.upload.grid.title")}</h3>
        <div className="toolbar horizontal-list gap-2mm flex-vertical-center">
            <span>{selection.size}/{medias.size}</span>
            <Button className="margin-left-auto" icon="REFRESH"
                onClick={onRefresh}
                busy={loading}>
                {t("common.reload")}
            </Button>
            <Button icon="EDIT"
                disabled={loading || !selection.size}>
                {t("common.CRUD.edit")}
            </Button>
        </div>
        <InfiniteScroll
            dataLength={medias.size + uploads.size}
            next={onNextData}
            hasMore={!ended}
            loader={<LoadingPanel />}
            endMessage={
                <div className="bottom-message">
                    <span className="title medium">
                        {t("misc.gallery.upload.grid.end_message")}
                    </span>
                </div>
            }
            className="uploads-container">
            {[...uploads.entries()].map(([id, u]) => <UploadStatusBox key={id} state={u} size={imageSize} />)}
            {[...medias.entries()].sort(sortFn).map(([id, u]) => <UploadedImage key={id} image={u} onSelect={onSelect} selected={selection.has(id)} />)}
        </InfiniteScroll>
    </>
}