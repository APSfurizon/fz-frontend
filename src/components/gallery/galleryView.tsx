import ViewMediaModal from "@/app/[locale]/(misc)/gallery/_components/viewMediaModal";
import { useGallery } from "./context/galleryProvider";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { useMemo, useState } from "react";
import Button from "@/components/input/button";
import { useTranslations } from "next-intl";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingPanel from "@/components/loadingPanel";
import Image from "next/image";
import GalleryMedia from "@/components/gallery/galleryMedia";

type GalleryGridViewProps = {

}
export function GalleryGridView(props: Readonly<GalleryGridViewProps>) {
    const t = useTranslations();
    const { medias, setGalleryMedias, openMedia, closeMedia, ended, getNextData, onRefresh, galleryLoading, selectedMediaIdMap, onSelect, setSelection } = useGallery();
    const { userDisplayRef, userLoading } = useUser();
    const canManageMedias = useMemo(() => userDisplayRef.current?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS), [userDisplayRef.current]);
    const sortFn = ((a: [number, GalleryUploadedMedia], b: [number, GalleryUploadedMedia]) => b[0] - a[0]);

    // Edit modal logic
    const [editModalOpen, setEditModalOpen] = useState(false);

    return <>
        <div className="gallery__grid">
            <div className="gallery__grid__toolbar horizontal-list gap-2mm align-items-center">
                {canManageMedias && <>
                    <Button icon="REMOVE_SELECTION"
                        title={t("components.gallery.grid.toolbar.deselect_all")}
                        onClick={() => setSelection(new Set())} />
                    <span className="title">{selectedMediaIdMap.size}/{medias.size}</span>
                </>}
                <Button className="margin-left-auto" icon="REFRESH"
                    onClick={onRefresh}
                    busy={galleryLoading}>
                    {t("common.reload")}
                </Button>
                {canManageMedias &&
                    <Button icon="EDIT"
                        disabled={galleryLoading || !selectedMediaIdMap.size}
                        onClick={() => setEditModalOpen(true)}>
                        {t("common.CRUD.edit")}
                    </Button>
                }
            </div>
            <InfiniteScroll
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
                className="gallery__grid__container gap-4mm">
                {[...medias.entries()].sort(sortFn).map(([id, u]) => <GalleryMedia key={id}
                    image={u}
                    checkbox={canManageMedias}
                    onSelect={onSelect}
                    onClick={m => openMedia(m.id)}
                    selected={selectedMediaIdMap.has(id)} />
                )}
            </InfiniteScroll>
        </div>
        <ViewMediaModal />
        {/*<MediaEditModal events={eventItems}
            medias={selectedMedias}
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onRefresh={onRefresh} />*/}
    </>;
}