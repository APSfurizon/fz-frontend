import ViewMediaModal from "@/app/[locale]/(misc)/gallery/_components/viewMediaModal";
import { useGallery } from "./context/galleryProvider";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import { GalleryUploadedFullMedia, GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { RefObject, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import FpButton from "@/components/input/fpButton";
import { useTranslations } from "next-intl";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingPanel from "@/components/loadingPanel";
import Image from "next/image";
import GalleryMedia from "@/components/gallery/galleryMedia";
import { useSearchParams } from "next/navigation";
import MediaEditModal from "@/app/[locale]/(misc)/gallery/upload/_components/modals/mediaEditModal";

type GalleryGridViewProps = {
    refresh?: RefObject<() => void>,
    getFullMedia?(id: number): Promise<GalleryUploadedFullMedia>
}
export function GalleryGridView(props: Readonly<GalleryGridViewProps>) {
    const t = useTranslations();
    const { medias, openMedia, ended, getNextData, onRefresh, galleryLoading, selectedMediaIds, onSelect, setSelection } = useGallery();
    const [refreshKey, setRefreshKey] = useState(0);
    const { userDisplayRef, userLoading } = useUser();
    const canManageMedias = useMemo(() => userDisplayRef.current?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS), [userDisplayRef.current]);
    const sortFn = ((a: [number, GalleryUploadedMedia], b: [number, GalleryUploadedMedia]) => b[0] - a[0]);

    // Selection logic
    const [enableSelection, setEnableSelection] = useState(false);

    useEffect(() => {
        if (!enableSelection) {
            setSelection(new Set());
        }
    }, [enableSelection]);

    const selectedMedias = useMemo(() => [...selectedMediaIds].map(id => medias.get(id)).filter(v => !!v), [selectedMediaIds]);

    // Edit modal logic
    const [editModalOpen, setEditModalOpen] = useState(false);

    const refreshRef = useRef<() => void>(() => {
        setRefreshKey(p => (p + 1) % 10);
        onRefresh();
    });
    useImperativeHandle(props.refresh, () => refreshRef.current);

    return <>
        <div className="gallery__grid">
            <div className="gallery__grid__toolbar horizontal-list gap-2mm align-items-center">
                {enableSelection
                    ? <>
                        <FpButton icon="REMOVE_SELECTION"
                            title={t("components.gallery.grid.toolbar.deselect_all")}
                            onClick={() => setEnableSelection(false)} />
                        <span className="title">{selectedMediaIds.size}/{medias.size}</span>
                    </>
                    : <FpButton icon="LIBRARY_ADD_CHECK" onClick={() => setEnableSelection(true)} />
                }
                <FpButton className="margin-left-auto" icon="REFRESH"
                    onClick={refreshRef.current}
                    busy={galleryLoading}>
                    {t("common.reload")}
                </FpButton>
                {enableSelection && <>
                    <FpButton icon="DOWNLOAD"
                        disabled={galleryLoading || !selectedMediaIds.size} />
                    {canManageMedias &&
                        <FpButton icon="EDIT"
                            disabled={galleryLoading || !selectedMediaIds.size}
                            onClick={() => setEditModalOpen(true)}>
                            {t("common.CRUD.edit")}
                        </FpButton>
                    }
                </>}
            </div>
            <InfiniteScroll
                key={refreshKey}
                dataLength={medias.size}
                next={getNextData}
                hasMore={!ended}
                loader={<div className="gallery__grid__container__bottom"><LoadingPanel /></div>}
                endMessage={
                    <div className="gallery__grid__container__bottom align-center">
                        <span aria-label={t("components.gallery.grid.end_label")} className="descriptive medium">
                            {t("components.gallery.grid.end_message")}
                        </span><br />
                        <Image alt=""
                            width={100}
                            height={100}
                            src={"/images/chibi/furizonchibi-social.png"} />
                    </div>
                }
                className="gallery__grid__container">
                {[...medias.entries()].sort(sortFn).map(([id, u]) => <GalleryMedia key={id}
                    image={u}
                    checkbox={enableSelection}
                    onSelect={onSelect}
                    onClick={m => openMedia(m.id)}
                    selected={selectedMediaIds.has(id)} />
                )}
            </InfiniteScroll>
        </div>
        <ViewMediaModal getFullMedia={props.getFullMedia} />
        <MediaEditModal
            medias={selectedMedias}
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onRefresh={refreshRef.current} />
    </>;
}