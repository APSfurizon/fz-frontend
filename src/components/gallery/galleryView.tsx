import ViewMediaModal from "@/app/[locale]/(misc)/gallery/_components/viewMediaModal";
import { useGallery } from "./context/galleryProvider";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import { GalleryUploadedFullMedia } from "@/lib/api/gallery/types";
import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import FpButton from "@/components/input/fpButton";
import { useTranslations } from "next-intl";
import MediaEditModal from "@/app/[locale]/(misc)/gallery/upload/_components/modals/mediaEditModal";
import { useGallerySelection } from "./context/gallerySelectionProvider";
import GalleryVirtualizedGrid from "./galleryVirtualizedGrid";
import { runRequest } from "@/lib/api/networking/main";
import { BulkDownloadApiAction } from "@/lib/api/gallery/api";
import { useModalUpdate } from "../context/modalProvider";
import ErrorMessage from "../errorMessage";
import { ApiErrorResponse } from "@/lib/api/networking";

type GalleryGridViewProps = {
  refresh?: RefObject<() => void>;
  getFullMedia?(id: number): Promise<GalleryUploadedFullMedia>;
  onUpdatedMedias?(mediaIds: number[]): void;
};
export function GalleryGridView(props: Readonly<GalleryGridViewProps>) {
  const t = useTranslations();
  const { medias, setGalleryMedias, ended, getNextData, onRefresh, galleryLoading } = useGallery();
  const { showModal } = useModalUpdate();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { selectedIds, selectionEnabled, setSelectionEnabled, clearSelection } = useGallerySelection();
  const [refreshKey, setRefreshKey] = useState(0);
  const { userDisplayRef, userDisplay, userLoading } = useUser();
  const canManageMedias = useMemo(
    () => userDisplay?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS),
    [userLoading]
  );

  // Selection logic
  const selectedMedias = useMemo(() => [...selectedIds].map((id) => medias.get(id)).filter((v) => !!v), [selectedIds]);

  useEffect(() => {
    clearSelection();
  }, [medias]);

  // Edit modal logic
  const [editModalOpen, setEditModalOpen] = useState(false);

  const refreshRef = useRef<() => void>(() => {
    setRefreshKey((p) => (p + 1) % 10);
    onRefresh();
  });
  useImperativeHandle(props.refresh, () => refreshRef.current);

  const onEditedMedias = (mediaIds: number[]) => {
    props.onUpdatedMedias?.(mediaIds);
    refreshRef.current?.();
  };

  const onViewEditedMedias = (mediaId: number, deleted?: boolean) => {
    props.onUpdatedMedias?.([mediaId]);
    if (deleted) {
      setGalleryMedias((prev) => {
        const newMedias = new Map(prev);
        newMedias.delete(mediaId);
        return newMedias;
      });
    }
  };

  useEffect(() => {
    if (medias.size === 0 && !galleryLoading && !ended) {
      getNextData().catch(() => void 0);
    }
  }, [refreshKey]);

  // Bulk download logic
  const [downloadLoading, setDownloadLoading] = useState(false);

  const downloadMedia = useCallback(() => {
    if (downloadLoading || !selectedIds.size) {
      return;
    }
    setDownloadLoading(true);
    runRequest({ action: new BulkDownloadApiAction(), body: { ids: [...selectedIds] } })
      .then(async (result) => {
        const response = await fetch(result.url, {
          method: "POST",
          body: result.body,
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url);
        URL.revokeObjectURL(url);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setDownloadLoading(false));
  }, [selectedIds, downloadLoading]);

  return (
    <>
      <div className="gallery__grid">
        <div className="gallery__grid__toolbar horizontal-list gap-2mm align-items-center">
          {/* eslint-disable-next-line react-hooks/refs */}
          {userDisplayRef.current &&
            (selectionEnabled ? (
              <>
                <FpButton
                  icon="REMOVE_SELECTION"
                  title={t("components.gallery.grid.toolbar.deselect_all")}
                  onClick={() => setSelectionEnabled(false)}
                />
                <span className="title">
                  {selectedIds.size}/{medias.size}
                </span>
              </>
            ) : (
              <FpButton
                icon="LIBRARY_ADD_CHECK"
                title={t("components.gallery.grid.toolbar.select_medias")}
                onClick={() => setSelectionEnabled(true)}
              />
            ))}
          <FpButton
            className="margin-left-auto"
            icon="REFRESH"
            // eslint-disable-next-line react-hooks/refs
            onClick={refreshRef.current}
            busy={galleryLoading}
            title={t("common.reload")}
          >
            {t("common.reload")}
          </FpButton>
          {/* eslint-disable-next-line react-hooks/refs */}
          {selectionEnabled && userDisplayRef.current?.display.userId && (
            <>
              <FpButton
                icon="DOWNLOAD"
                title={t("components.gallery.grid.toolbar.download")}
                busy={downloadLoading}
                disabled={galleryLoading || !selectedIds.size}
                onClick={downloadMedia}
              />
              {canManageMedias && (
                <FpButton
                  icon="EDIT"
                  disabled={galleryLoading || !selectedIds.size}
                  onClick={() => setEditModalOpen(true)}
                >
                  {t("common.CRUD.edit")}
                </FpButton>
              )}
            </>
          )}
        </div>
        <GalleryVirtualizedGrid key={refreshKey} />
      </div>
      <ViewMediaModal getFullMedia={props.getFullMedia} onUpdatedFullMedia={onViewEditedMedias} />
      <MediaEditModal
        medias={selectedMedias}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdatedMedia={onEditedMedias}
      />
    </>
  );
}
