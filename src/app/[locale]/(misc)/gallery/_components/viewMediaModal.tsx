"use client"
import Modal from "@/components/modal";
import { useGallery } from "../../../../../components/gallery/context/galleryProvider";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Icon, { MaterialIcon } from "@/components/icon";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GalleryUploadedFullMedia, GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { GetFullMediaApiAction } from "@/lib/api/gallery/api";
import "@/styles/misc/gallery/viewMediaModal.scss";
import { translate } from "@/lib/translations";
import { getCountdown } from "@/lib/utils";
import { copyrightValues } from "@/lib/api/gallery/upload/main";
import { shareMediaUrl } from "@/lib/api/gallery/util";
import { useModalUpdate } from "@/components/context/modalProvider";
import UserPicture from "@/components/userPicture";
import FpButton from "@/components/input/fpButton";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import Image from "next/image";
import { useGalleryView } from "@/components/gallery/context/galleryViewProvider";

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
    const { medias } = useGallery();
    const { currentMediaId, closeMedia, goNext, goBack } = useGalleryView();
    const t = useTranslations();
    const formatter = useFormatter();
    const locale = useLocale();
    const { userDisplayRef } = useUser();
    const isAdmin = useMemo(() => userDisplayRef.current?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS), [userDisplayRef.current]);

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
                togglePanel();
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
        if (!!currentMediaId) {
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
    }, [currentMediaId]);

    const closeModal = () => {
        setDataPanelOpen(true);
        closeMedia();
    }

    useEffect(() => {
        if (fullMedia && fullMedia.id == currentMediaId) {
            return;
        }
        if (!currentMediaId) {
            setFullMedia(undefined);
            return;
        }
        setLoading(true);
        (props.getFullMedia
            ? props.getFullMedia(currentMediaId)
            : runRequest({
                action: new GetFullMediaApiAction(),
                pathParams: { "id": currentMediaId }
            })
        ).then(setFullMedia)
            .finally(() => setLoading(false))
    }, [currentMediaId]);

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
        if (!currentMediaId) return;
        if (!shareMediaUrl(currentMediaId)) {
            showModal(t("common.success"), t("misc.gallery.modal.share.copy_message"), "CONTENT_COPY", 501);
        }
    }

    const duration = fullMedia?.videoMetadata?.durationMs
        ? getCountdown(fullMedia?.videoMetadata?.durationMs)
        : undefined;

    const shotDate = useMemo(() => !fullMedia
        ? null
        : formatter.dateTime(new Date(fullMedia.shotDate), { dateStyle: "full", timeStyle: "medium" }), [fullMedia]);

    const bottomFocus = useRef<HTMLDivElement>(null!);

    const togglePanel = () => {
        setDataPanelOpen(prev => !prev);
        setTimeout(() => bottomFocus.current.scrollIntoView({ behavior: "smooth" }), 100);
    }

    const [error, setError] = useState(false);
    useEffect(() => setError(false), [currentMediaId]);

    const mediaSrc = useMemo(() => error
        ? EMPTY_PROFILE_PICTURE_SRC
        : fullMedia?.displayMedia?.mediaUrl ?? (
            currentMediaId
                ? medias.get(currentMediaId!)?.thumbnailMedia?.mediaUrl
                : undefined
        ) ?? EMPTY_PROFILE_PICTURE_SRC
        , [fullMedia, currentMediaId, error]);

    return <Modal open={!!currentMediaId}
        onClose={closeModal}
        icon="IMAGE"
        busy={loading}
        title={t("misc.gallery.upload.modal.title")}
        className="view-media-modal no-bottom">
        { /* Main image view */}
        <div className="view-media-modal__grid">
            <div className="view-media-modal__back-button">
                <FpButton iconButton iconClass="large" icon="ARROW_BACK" onClick={goBack} />
            </div>
            <div className="view-media-modal__media rounded-m"
                style={{ transform: `translate(${swipeDiff ?? 0}px, 0px)` }}>
                <Image unoptimized
                    width={800}
                    height={600}
                    alt="gallery image"
                    ref={mediaRef}
                    src={mediaSrc}
                    onError={() => setError(true)} />
            </div>
            <div className="view-media-modal__forward-button align-right">
                <FpButton iconButton iconClass="large" icon="ARROW_FORWARD" onClick={goNext} />
            </div>

            <div className="view-media-modal__toolbar horizontal-list gap-2mm align-items-center">
                <UserPicture className="view_media_modal_author_picture" userData={fullMedia?.photographer} />
                <span>{fullMedia?.photographer && fullMedia.photographer.fursonaName}</span>
                <FpButton iconButton
                    icon="SHARE"
                    title={t("misc.gallery.modal.actions.share")}
                    onClick={onShare} />
                <div className="spacer"></div>
                {/* Media approvals */}
                {isAdmin && <>
                    <FpButton disabled={!fullMedia}
                        success={(fullMedia?.status === "APPROVED" as never)}
                        off={(fullMedia?.status !== "APPROVED") as never} icon="THUMB_UP">
                        {t("misc.gallery.modal.actions.admin.approve")}
                    </FpButton>
                    <FpButton disabled={!fullMedia}
                        danger={(fullMedia?.status === "REJECTED" as never)}
                        off={(fullMedia?.status !== "REJECTED") as never} icon="THUMB_DOWN">
                        {t("misc.gallery.modal.actions.admin.reject")}
                    </FpButton>
                </>}
                {fullMedia && userDisplayRef.current?.display.userId === fullMedia?.photographer.userId && <FpButton danger
                    icon="DELETE"
                    title={t("common.CRUD.delete")} />}
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
                dataPanelOpen ? "view-media-modal__panel--open" : "",
                "rounded-m"
            ].join(" ")}>
                <div className="horizontal-list">
                    <h3 className="view-media-modal__panel-title title medium">{t("misc.gallery.modal.information_panel.title")}</h3>
                    <div className="spacer"></div>
                    <FpButton iconButton
                        icon={dataPanelOpen ? "CHEVRON_RIGHT" : "CHEVRON_LEFT"}
                        title={(dataPanelOpen ? t("common.close") : t("common.open")) + " (I)"}
                        className="view-media-modal__toggle-panel rounded-m"
                        onClick={togglePanel} />
                </div>
                <hr></hr>
                {fullMedia && <div className="view-media-modal__panel-data">
                    <ModalPanelData icon="COPYRIGHT" text={copyrightValues.find(v => v.code === fullMedia?.repostPermissions)?.getDescription(locale)!} />
                    <ModalPanelData icon="LOCAL_ACTIVITY" text={translate(fullMedia.event.eventNames, locale)} />
                    {isAdmin && <ModalPanelData icon="FLAG" text={mapStatus(fullMedia.status)} />}
                    {shotDate && <ModalPanelData icon="EVENT" text={shotDate} />}
                    {fullMedia.photoMetadata && <>
                        <h4 className="view-media-modal__panel-header title">{t("misc.gallery.upload.modal.information_panel.photo.title")}</h4>
                        <div className="vertical-list">
                            <ModalPanelData icon="PHOTO_CAMERA"
                                text={[fullMedia.photoMetadata.cameraMaker ?? "", fullMedia.photoMetadata.cameraModel ?? ""].join(" ")} />
                            {fullMedia.photoMetadata.lensModel && <ModalPanelData icon="MOTION_MODE"
                                text={[fullMedia.photoMetadata.lensMaker ?? "", fullMedia.photoMetadata.lensModel ?? ""].join("")} />}
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
                    <div ref={bottomFocus} />
                </div>}
            </div>
        </div>
    </Modal>
}