"use client"
import Modal from "@/components/modal";
import { useGallery } from "../../../../../components/gallery/context/galleryProvider";
import Image from "next/image";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Icon from "@/components/icon";
import { useLocale, useTranslations } from "next-intl";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { GalleryUploadedFullMedia, GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { GetFullMediaApiAction } from "@/lib/api/gallery/api";
import "@/styles/misc/gallery/viewMediaModal.css";
import LoadingPanel from "@/components/loadingPanel";
import { translate } from "@/lib/translations";
import { getCountdown } from "@/lib/utils";
import { copyrightValues } from "@/lib/api/gallery/upload/main";
import { shareMediaUrl } from "@/lib/api/gallery/util";
import { useModalUpdate } from "@/components/context/modalProvider";

export default function ViewMediaModal() {
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
        if (!currentMedia) {
            setFullMedia(undefined);
            return;
        }
        setLoading(true);
        runRequest({
            action: new GetFullMediaApiAction(),
            pathParams: { "id": currentMedia.id }
        }).then(setFullMedia)
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
        <div className="view-grid">
            <div className="back-button">
                <a href="#" onClick={() => goBack()}><Icon icon="ARROW_BACK" /></a>
            </div>
            <div className="media-container rounded-m"
                style={{ transform: `translate(${swipeDiff ?? 0}px, 0px)` }}>
                {currentMedia
                    ? <img alt="gallery image" ref={mediaRef} src={currentMedia?.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC} />
                    : <LoadingPanel />}
            </div>
            <div className="forward-button align-right">
                <a href="#" onClick={() => goNext()}><Icon icon="ARROW_FORWARD" /></a>
            </div>
            {fullMedia
                ? <>
                    <div className="bottom-toolbar horizontal-list gap-2mm align-items-center">
                        <div className="horizontal-list author align-items-center">
                            <Image alt="image author" src={fullMedia.photographer.propic?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC}
                                width={32} height={32} />
                            <span>{fullMedia.photographer.fursonaName}</span>
                        </div>
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
                    <div className={["information-panel", "rounded-m", dataPanelOpen ? "open" : ""].join(" ")}>
                        <div className="header horizontal-list">
                            <h3 className="title medium">{t("misc.gallery.modal.information_panel.title")}</h3>
                            <div className="spacer"></div>
                            <a title={(dataPanelOpen ? t("common.close") : t("common.open")) + " (I)"}
                                className="toggle-button rounded-m"
                                href="#"
                                onClick={() => setDataPanelOpen(prev => !prev)}>
                                <Icon icon={dataPanelOpen ? "CLOSE" : "MORE_VERT"} />
                            </a>
                        </div>
                        <div className="data vertical-list gap-2mm">
                            <span className="vertical-align-bottom"><Icon icon="COPYRIGHT" />
                                {translate(copyrightValues.find(v => v.code === fullMedia?.repostPermissions)?.translatedDescription ?? {}, locale)}
                            </span>
                            <span className="vertical-align-bottom"><Icon icon="LOCAL_ACTIVITY" />{translate(fullMedia.event.eventNames, locale)}</span>
                            <span className="vertical-align-bottom"><Icon icon="FLAG" />{mapStatus(fullMedia.status)}</span>
                            {fullMedia.photoMetadata && <>
                                <h4 className="title">{t("misc.gallery.upload.modal.information_panel.photo.title")}</h4>
                                <div className="margin-left-2mm">
                                    <span className="vertical-align-bottom"><Icon icon="PHOTO_CAMERA" />{fullMedia.photoMetadata.cameraMaker} {fullMedia.photoMetadata.cameraModel}</span>
                                    <span className="vertical-align-bottom"><Icon icon="MOTION_MODE" />{fullMedia.photoMetadata.lensMaker} {fullMedia.photoMetadata.lensModel}</span>
                                    <span className="vertical-align-bottom"><Icon icon="STRAIGHTEN" />{fullMedia.photoMetadata.focal}</span>
                                    <span className="vertical-align-bottom"><Icon icon="SHUTTER_SPEED" />{fullMedia.photoMetadata.shutter}</span>
                                    <span className="vertical-align-bottom"><Icon icon="CAMERA" />{fullMedia.photoMetadata.aperture}</span>
                                    <span className="vertical-align-bottom"><Icon icon="EXPOSURE" />{fullMedia.photoMetadata.iso}</span>
                                </div>
                            </>}
                            {fullMedia.videoMetadata && <>
                                <h4 className="title">{t("misc.gallery.upload.modal.information_panel.video.title")}</h4>
                                <div className="margin-left-2mm">
                                    <span className="vertical-align-bottom"><Icon icon="_24FPS_SELECT" />{fullMedia.videoMetadata.framerate}</span>
                                    <span className="vertical-align-bottom"><Icon icon="AV_TIMER" />{t("misc.gallery.upload.modal.video.duration", {
                                        hours: duration![1],
                                        minutes: duration![2],
                                        seconds: duration![3],
                                        milliseconds: duration![4]
                                    })}</span>
                                </div>~
                            </>}
                        </div>
                    </div>
                </>
                : <LoadingPanel />}
        </div>
    </Modal>
}