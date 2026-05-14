"use client"
import Modal from "@/components/modal";
import { useGallery } from "../../../../../components/gallery/context/galleryProvider";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Icon, { MaterialIcon } from "@/components/icon";
import { useLocale, useTranslations } from "next-intl";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GalleryUploadedFullMedia, GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { GetFullMediaApiAction } from "@/lib/api/gallery/api";
import "@/styles/misc/gallery/viewMediaModal.scss";
import LoadingPanel from "@/components/loadingPanel";
import { translate } from "@/lib/translations";
import { getCountdown } from "@/lib/utils";
import { copyrightValues } from "@/lib/api/gallery/upload/main";
import { shareMediaUrl } from "@/lib/api/gallery/util";
import { useModalUpdate } from "@/components/context/modalProvider";
import UserPicture from "@/components/userPicture";

function ModalPanelData(props: Readonly<{
    icon: MaterialIcon,
    text: string
}>) {
    return <div className="view-media-modal__data vertical-align-middle">
        <Icon className="medium" icon={props.icon} />
        <span className="view-media-modal__data__text title small">{props.text}</span>
    </div>
}

type ViewMediaModalProps = {
    /**Defines a custom fullmedia retrieving logic, for external caching */
    getFullMedia?(id: number): Promise<GalleryUploadedFullMedia>
}

export default function ViewMediaModal(props: Readonly<ViewMediaModalProps>) {
    const { currentMedia, closeMedia, modalOpen, goNext, goBack } = useGallery();
    const t = useTranslations();
    const locale = useLocale();

    const [loading, setLoading] = useState(false);
    const [fullMedia, setFullMedia] = useState<GalleryUploadedFullMedia>();
    const [dataPanelOpen, setDataPanelOpen] = useState(false);

    // Swipe handler
    const swipeEnabledRef = useRef(false);
    const mediaRef = useRef<HTMLImageElement>(null!);
    const startPoint = useRef<number>(undefined);
    const [swipeDiff, setSwipeDiff] = useState<number>();

    useEffect(() => {
        swipeEnabledRef.current = window?.matchMedia("(pointer: coarse)").matches ?? false
    }, [])

    const touchStartHandler = (e: globalThis.TouchEvent) => {
        startPoint.current = e.touches[0].clientX;
    }

    const touchMoveHandler = (e: globalThis.TouchEvent) => {
        if (startPoint.current === undefined) return;
        setSwipeDiff(e.touches[0].clientX - startPoint.current);
    };

    const touchEndHandler = (e: globalThis.TouchEvent) => {
        const halfWidth = mediaRef.current.offsetWidth / 2;
        if (startPoint.current !== undefined) {
            const moveAmount = startPoint.current - e.changedTouches[0].clientX;
            if (Math.abs(moveAmount) > halfWidth) {
                if (moveAmount > 0) {
                    goNext();
                } else {
                    goBack();
                }
            }
        }
        setSwipeDiff(undefined);
        startPoint.current = undefined;
    }

    // Keyboard listener
    const keyEventHandler = (e: globalThis.KeyboardEvent) => {
        switch (e.code) {
            case "KeyI":
                setDataPanelOpen(prev => !prev);
                break;
            case "Escape":
                closeModal();
                break;
            case "ArrowLeft":
                goBack();
                break;
            case "ArrowRight":
                goNext();
                break;
        }
    }

    useEffect(() => {
        if (modalOpen) {
            document.addEventListener("keydown", keyEventHandler);
            if (swipeEnabledRef.current) {
                mediaRef.current?.addEventListener("touchstart", touchStartHandler);
                mediaRef.current?.addEventListener("touchmove", touchMoveHandler);
                mediaRef.current?.addEventListener("touchend", touchEndHandler);
            }
        }
        return () => {
            document.removeEventListener("keydown", keyEventHandler)
            if (swipeEnabledRef.current) {
                mediaRef.current?.removeEventListener("touchstart", touchStartHandler);
                mediaRef.current?.removeEventListener("touchmove", touchMoveHandler);
                mediaRef.current?.removeEventListener("touchend", touchEndHandler);
                setSwipeDiff(undefined);
                startPoint.current = undefined;
            }
        }
    }, [modalOpen, currentMedia]);

    const closeModal = () => {
        setDataPanelOpen(true);
        closeMedia();
    }

    useEffect(() => {
        if (fullMedia && fullMedia.id !== currentMedia?.id) {
            setFullMedia(undefined);
        }
        if (!currentMedia) { return; }
        setLoading(true);
        (props.getFullMedia
            ? props.getFullMedia(currentMedia.id!)
            : runRequest({
                action: new GetFullMediaApiAction(),
                pathParams: { "id": currentMedia.id }
            })
        ).then(setFullMedia)
            .finally(() => setLoading(false))
    }, [currentMedia]);

    const downloadFile = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (!fullMedia?.downloadMedia?.mediaUrl) { return; }
        fetch(fullMedia.downloadMedia.mediaUrl)
            .then(f => f.blob())
            .then((blobFile) => {
                const url = URL.createObjectURL(blobFile);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = fullMedia.fileName;
                anchor.click();
                URL.revokeObjectURL(url);
            });
    }, [fullMedia]);

    const mapStatus = (status: GalleryUploadedMediaStatus) => {
        switch (status) {
            case "APPROVED":
                return t("components.gallery.media.status.approved");
            case "PENDING":
                return t("components.gallery.media.status.pending");
            case "REJECTED":
                return t("components.gallery.media.status.rejected");
        }
    }

    const { showModal } = useModalUpdate();

    const onShare = () => {
        if (!currentMedia?.id) return;
        if (!shareMediaUrl(currentMedia.id)) {
            showModal(t("common.success"), t("misc.gallery.modal.share.copy_message"), "CONTENT_COPY", 501);
        }
    }

    const duration = fullMedia?.videoMetadata?.durationMs
        ? getCountdown(fullMedia?.videoMetadata?.durationMs)
        : undefined;

    return <Modal open={modalOpen}
        onClose={closeModal}
        icon="IMAGE"
        busy={loading}
        title={t("misc.gallery.upload.modal.title")}
        className="view-media-modal no-bottom">
        { /* Main image view */}
        <div className="view-media-modal__grid">
            <div className="view-media-modal__back-button">
                <a href="#" onClick={() => goBack()}><Icon icon="ARROW_BACK" /></a>
            </div>
            <div className="view-media-modal__media rounded-m"
                style={{ transform: `translate(${swipeDiff ?? 0}px, 0px)` }}>
                {currentMedia
                    ? <img alt="gallery image" ref={mediaRef} src={fullMedia?.displayMedia?.mediaUrl ?? currentMedia?.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC} />
                    : <LoadingPanel />}
            </div>
            <div className="view-media-modal__forward-button align-right">
                <a href="#" onClick={() => goNext()}><Icon icon="ARROW_FORWARD" /></a>
            </div>

            <div className="view-media-modal__toolbar horizontal-list gap-2mm align-items-center">
                {fullMedia?.photographer
                    ? <>
                        <UserPicture className="view_media_modal_author_picture" userData={fullMedia.photographer} />
                        <span>{fullMedia.photographer.fursonaName}</span>
                    </>
                    : <LoadingPanel />
                }
                <a className="vertical-align-middle"
                    href="#"
                    onClick={onShare}>
                    <Icon icon="SHARE" />
                </a>
                <div className="spacer"></div>
                {fullMedia?.downloadMedia && <a className="vertical-align-middle"
                    href={fullMedia.downloadMedia.mediaUrl}
                    onClick={downloadFile}>
                    <Icon icon="DOWNLOAD" />
                    Download
                </a>}
            </div>
            { /* Information panel */}
            <div className={[
                "view-media-modal__panel",
                fullMedia && dataPanelOpen ? "view-media-modal__panel--open" : "",
                "rounded-m"
            ].join(" ")}>
                <div className="horizontal-list">
                    <h3 className="view-media-modal__panel-title title medium">{t("misc.gallery.modal.information_panel.title")}</h3>
                    <div className="spacer"></div>
                    <a title={(fullMedia && dataPanelOpen ? t("common.close") : t("common.open")) + " (I)"}
                        className="view-media-modal__toggle-panel rounded-m"
                        href="#"
                        onClick={() => setDataPanelOpen(prev => !!fullMedia && !prev)}>
                        <Icon icon={dataPanelOpen ? "CLOSE" : "MORE_VERT"} />
                    </a>
                </div>
                <hr></hr>
                {fullMedia && <div className="view-media-modal__panel-data">
                    <ModalPanelData icon="COPYRIGHT" text={copyrightValues.find(v => v.code === fullMedia?.repostPermissions)?.getDescription(locale)!} />
                    <ModalPanelData icon="LOCAL_ACTIVITY" text={translate(fullMedia.event.eventNames, locale)} />
                    <ModalPanelData icon="FLAG" text={mapStatus(fullMedia.status)} />
                    {fullMedia.photoMetadata && <>
                        <h4 className="view-media-modal__panel-header title">{t("misc.gallery.upload.modal.information_panel.photo.title")}</h4>
                        <div className="vertical-list">
                            <ModalPanelData icon="PHOTO_CAMERA" text={`${fullMedia.photoMetadata.cameraMaker} ${fullMedia.photoMetadata.cameraModel}`} />
                            {fullMedia.photoMetadata.lensModel && <ModalPanelData icon="MOTION_MODE" text={`${fullMedia.photoMetadata.lensMaker} ${fullMedia.photoMetadata.lensModel}`} />}
                            <ModalPanelData icon="SHUTTER_SPEED" text={fullMedia.photoMetadata.shutter} />
                            <ModalPanelData icon="CAMERA" text={fullMedia.photoMetadata.aperture} />
                            <ModalPanelData icon="EXPOSURE" text={fullMedia.photoMetadata.iso} />
                        </div>
                    </>}
                    {fullMedia.videoMetadata && <>
                        <h4 className="view-media-modal__panel-header title">{t("misc.gallery.upload.modal.information_panel.video.title")}</h4>
                        <div className="vertical-list">
                            <ModalPanelData icon="24FPS_SELECT" text={fullMedia.videoMetadata.framerate} />
                            {duration && <ModalPanelData icon="AV_TIMER" text={t("misc.gallery.upload.modal.video.duration", {
                                hours: duration[1],
                                minutes: duration[2],
                                seconds: duration[3],
                                milliseconds: duration[4]
                            })} />}
                        </div>
                    </>}
                </div>}
            </div>
        </div>
    </Modal>
}