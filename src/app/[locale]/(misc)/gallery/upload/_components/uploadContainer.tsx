import { useGallery } from "@/components/gallery/context/galleryProvider";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { MyUploadsApiAction } from "@/lib/api/gallery/upload/api";
import { runRequest } from "@/lib/api/networking/main";
import { buildSearchParams } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";
import UploadPanel, { UploadState } from "./uploadPanel/uploadPanel";
import UploadStatusBox from "./uploadStatusBox";

export default function UploadContainer() {
  const t = useTranslations("");

  const { medias, setGalleryMedias } = useGallery();

  // Uploads map
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

  /** The key of the latest media uploaded, also being the first in the grid */
  const maxKey = useMemo(() => medias.keys().reduce((prev, next) => Math.max(prev, next), 0), [medias]);

  // Append the latest uploaded medias
  const timeoutHandle = useRef<number>(null!);
  const isPrependRunning = useRef(false);
  const shouldRePrepend = useRef(false);

  const prependUploadedMedias = useCallback(() => {
    // Cleanup timer
    if (timeoutHandle.current) window.clearTimeout(timeoutHandle.current);
    // Define the retrieving logic
    const request = (lastMediaId: number) =>
      runRequest({
        action: new MyUploadsApiAction(),
        searchParams: buildSearchParams({
          fromUploadId: String(lastMediaId ?? ""),
          invertOrder: String(true),
        }),
      });

    // Define the loop promise logic
    const requestLoop = async (lastMediaId: number) => {
      const toReturn: GalleryUploadedMedia[] = [];
      let idToUse = lastMediaId;
      let lastRetrievedItems: GalleryUploadedMedia[] = [];
      do {
        lastRetrievedItems = (await request(idToUse)).results;
        toReturn.splice(0, 0, ...lastRetrievedItems);
        idToUse = toReturn.map((e) => e.id).reduce((a, b) => Math.max(a, b), 0);
      } while (lastRetrievedItems.length);
      return toReturn;
    };

    // Load batches of the latest medias until every new media has been recovered
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
          setGalleryMedias((prev) => {
            const next = new Map(prev);
            result.forEach((r) => next.set(r.id, r));
            return next;
          });
        } while (shouldRePrepend.current);
      } finally {
        isPrependRunning.current = false;
      }
    }, 1000);
  }, [maxKey]);

  return (
    <>
      <UploadPanel onUploadUpdate={(u) => setUploads(u)} onCompletedUpload={prependUploadedMedias} />
      <div className="upload-queue">
        <h3 className="title medium margin-bottom-1mm">{t("misc.gallery.upload.queue.title")}</h3>
        <div className="container rounded-l vertical-list">
          {[...uploads.entries()].map(([id, u]) => (
            <UploadStatusBox key={id} state={u} />
          ))}
        </div>
      </div>
    </>
  );
}
