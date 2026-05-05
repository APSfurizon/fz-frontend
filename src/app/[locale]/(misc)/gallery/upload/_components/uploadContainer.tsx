import { useGallery } from "@/components/gallery/context/galleryProvider";
import { GalleryUpload } from "@/lib/api/gallery/upload/main";
import { UploadProgress } from "@/lib/api/gallery/upload/types";
import { SelectItem } from "@/lib/components/fpSelect";
import { useCallback, useMemo, useRef, useState } from "react";
import UploadPanel from "./uploadPanel/uploadPanel";
import { runRequest } from "@/lib/api/global";
import { MyUploadsApiAction } from "@/lib/api/gallery/upload/api";
import { buildSearchParams } from "@/lib/utils";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import UploadStatusBox from "./uploadStatusBox";
import { useTranslations } from "next-intl";

export type UploadState = {
    upload: GalleryUpload,
    progress: UploadProgress,
    createdAt: number,
    started: boolean,
    _launched: boolean,
    ended: boolean
};

type UploadContainerProps = {
    children?: React.ReactNode;
}
export default function UploadContainer(props: Readonly<UploadContainerProps>) {
    const t = useTranslations("");

    const { medias, setGalleryMedias } = useGallery();

    // Uploads map
    const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

    /** The key of the latest media uploaded, also being the first in the grid */
    const maxKey = useMemo(() => medias.keys().reduce((prev, next) => Math.max(prev, next), 0), [medias]);

    const [eventItems, setEventItems] = useState<SelectItem[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);

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
                "invertOrder": String(true)
            })
        });

        // Define the loop promise logic
        const requestLoop = async (lastImageId: number) => {
            const toReturn: GalleryUploadedMedia[] = [];
            let idToUse = lastImageId;
            let lastRetrievedItems: GalleryUploadedMedia[] = [];
            do {
                lastRetrievedItems = (await request(idToUse)).results;
                toReturn.splice(0, 0, ...lastRetrievedItems);
                idToUse = toReturn.map(e => e.id).reduce((a, b) => Math.max(a, b), 0);
            } while (lastRetrievedItems.length);
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
                    setGalleryMedias(prev => {
                        const next = new Map(prev);
                        result.forEach(r => next.set(r.id, r));
                        return next;
                    });
                } while (shouldRePrepend.current)
            } finally {
                isPrependRunning.current = false;
            }
        }, 1000);
    }, [maxKey]);

    return <>
        <UploadPanel onUploadUpdate={(u) => setUploads(u)}
            onCompletedUpload={prependUploadedImages}
            onEventItemsLoaded={e => setEventItems(e)} />
        <div className="upload-queue">
            <h3 className="title medium margin-bottom-1mm">{t("misc.gallery.upload.queue.title")}</h3>
            <div className="container rounded-l vertical-list">
                {[...uploads.entries()].map(([id, u]) => <UploadStatusBox key={id} state={u} />)}
            </div>
        </div>
    </>
}