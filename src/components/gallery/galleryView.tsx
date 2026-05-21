import ViewMediaModal from "@/app/[locale]/(misc)/gallery/_components/viewMediaModal";
import { useGallery } from "./context/galleryProvider";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import { GalleryUploadedFullMedia, GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { RefObject, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import FpButton from "@/components/input/fpButton";
import { useTranslations } from "next-intl";
import LoadingPanel from "@/components/loadingPanel";
import Image from "next/image";
import GalleryMedia from "@/components/gallery/galleryMedia";
import MediaEditModal from "@/app/[locale]/(misc)/gallery/upload/_components/modals/mediaEditModal";
import { useGallerySelection } from "./context/gallerySelectionProvider";
import { useGalleryView } from "./context/galleryViewProvider";
import { useVirtualizer } from "@tanstack/react-virtual";
import useResizeObserver from "../hooks/useResizeObserver";
import { throttle } from "lodash";
import GalleryVirtualizedGrid from "./galleryVirtualizedGrid";

type GalleryGridViewProps = {
    refresh?: RefObject<() => void>,
    getFullMedia?(id: number): Promise<GalleryUploadedFullMedia>,
    onUpdatedMedias?(mediaIds: number[]): void;
}
export function GalleryGridView(props: Readonly<GalleryGridViewProps>) {
    const t = useTranslations();
    const { medias, ended, getNextData, onRefresh, galleryLoading } = useGallery();
    const { openMedia } = useGalleryView();
    const { selectedIds, selectionEnabled, setSelectionEnabled, select, clearSelection } = useGallerySelection();
    const [refreshKey, setRefreshKey] = useState(0);
    const { userDisplayRef, userLoading } = useUser();
    const canManageMedias = useMemo(() => userDisplayRef.current?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS), [userDisplayRef.current]);

    // Selection logic
    const selectedMedias = useMemo(() => [...selectedIds].map(id => medias.get(id)).filter(v => !!v), [selectedIds]);

    // Edit modal logic
    const [editModalOpen, setEditModalOpen] = useState(false);

    const refreshRef = useRef<() => void>(() => {
        setRefreshKey(p => (p + 1) % 10);
        onRefresh();
    });
    useImperativeHandle(props.refresh, () => refreshRef.current);

    const onEditedMedias = (mediaIds: number[]) => {
        props.onUpdatedMedias?.(mediaIds);
        refreshRef.current?.();
    }

    useEffect(() => {
        if (medias.size === 0 && !galleryLoading && !ended) {
            getNextData();
        }
    }, [refreshKey]);

    return <>
        <div className="gallery__grid">
            <div className="gallery__grid__toolbar horizontal-list gap-2mm align-items-center">
                {selectionEnabled
                    ? <>
                        <FpButton icon="REMOVE_SELECTION"
                            title={t("components.gallery.grid.toolbar.deselect_all")}
                            onClick={() => setSelectionEnabled(false)} />
                        <span className="title">{selectedIds.size}/{medias.size}</span>
                    </>
                    : <FpButton icon="LIBRARY_ADD_CHECK"
                        title={t("components.gallery.grid.toolbar.select_medias")}
                        onClick={() => setSelectionEnabled(true)} />
                }
                <FpButton className="margin-left-auto" icon="REFRESH"
                    onClick={refreshRef.current}
                    busy={galleryLoading}
                    title={t("common.reload")}>
                    {t("common.reload")}
                </FpButton>
                {selectionEnabled && <>
                    <FpButton icon="DOWNLOAD"
                        title={t("components.gallery.grid.toolbar.download")}
                        disabled={galleryLoading || !selectedIds.size} />
                    {canManageMedias &&
                        <FpButton icon="EDIT"
                            disabled={galleryLoading || !selectedIds.size}
                            onClick={() => setEditModalOpen(true)}>
                            {t("common.CRUD.edit")}
                        </FpButton>
                    }
                </>}
            </div>
            <GalleryVirtualizedGrid key={refreshKey} />
        </div>
        <ViewMediaModal getFullMedia={props.getFullMedia}
            onUpdatedFullMedia={(id) => props.onUpdatedMedias?.([id])} />
        <MediaEditModal
            medias={selectedMedias}
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onUpdatedMedia={onEditedMedias} />
    </>;
}