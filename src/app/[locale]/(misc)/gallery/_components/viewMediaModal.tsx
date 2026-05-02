import Modal from "@/components/modal";
import { useGallery } from "./galleryProvider";
import Image from "next/image";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Icon from "@/components/icon";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GalleryUploadedFullMedia, GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { GetFullMediaApiAction } from "@/lib/api/gallery/api";
import "@/styles/misc/gallery/viewMediaModal.css";
import LoadingPanel from "@/components/loadingPanel";
import { translate } from "@/lib/translations";
import { getCountdown } from "@/lib/utils";

export default function ViewMediaModal() {
    const { currentMedia, closeMedia, modalOpen, goNext, goBack } = useGallery();
    const t = useTranslations();
    const locale = useLocale();

    const [loading, setLoading] = useState(false);
    const [fullMedia, setFullMedia] = useState<GalleryUploadedFullMedia>();
    const [dataPanelOpen, setDataPanelOpen] = useState(false);

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
        if (modalOpen) document.addEventListener("keydown", keyEventHandler);
        return () => document.removeEventListener("keydown", keyEventHandler)
    }, [modalOpen]);

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

    const mapStatus = (status: GalleryUploadedMediaStatus) => {
        switch (status) {
            case "APPROVED":
                return t("misc.gallery.media.status.approved");
            case "PENDING":
                return t("misc.gallery.media.status.pending");
            case "REJECTED":
                return t("misc.gallery.media.status.rejected");
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
            <div className="media-container rounded-m">
                {currentMedia
                    ? <img alt="gallery image" src={currentMedia?.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC} />
                    : <LoadingPanel />}
            </div>
            <div className="forward-button align-right">
                <a href="#" onClick={() => goNext()}><Icon icon="ARROW_FORWARD" /></a>
            </div>
            {fullMedia
                ? <>
                    <div className="bottom-toolbar horizontal-list align-items-center">
                        <div className="horizontal-list author align-items-center">
                            <Image alt="image author" src={fullMedia.photographer.propic?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC}
                                width={32} height={32} />
                            <span>{fullMedia.photographer.fursonaName}</span>
                        </div>
                        <div className="spacer"></div>
                        <a className="vertical-align-middle" href="#"><Icon icon="DOWNLOAD" />Download</a>
                    </div>
                    { /* Information panel */}
                    <div className={["information-panel", "rounded-m", dataPanelOpen ? "open" : ""].join(" ")}>
                        <div className="header horizontal-list">
                            <span className="title medium">{t("misc.gallery.upload.modal.information_panel.title")}</span>
                            <div className="spacer"></div>
                            <a title={(dataPanelOpen ? t("common.close") : t("common.open")) + " (I)"}
                                className="toggle-button rounded-m"
                                href="#"
                                onClick={() => setDataPanelOpen(prev => !prev)}>
                                <Icon icon={dataPanelOpen ? "CLOSE" : "MORE_VERT"} />
                            </a>
                        </div>
                        <div className="data vertical-list gap-2mm">
                            <span className="vertical-align-bottom"><Icon icon="DRAFT" />{currentMedia?.fileName}</span>
                            <span className="vertical-align-bottom"><Icon icon="LOCAL_ACTIVITY" />{translate(fullMedia.event.eventNames, locale)}</span>
                            <span className="vertical-align-bottom"><Icon icon="FLAG" />{mapStatus(fullMedia.status)}</span>
                            {fullMedia.photoMetadata && <>
                                <span className="vertical-align-bottom"><Icon icon="PHOTO_CAMERA" />{fullMedia.photoMetadata.cameraMaker} {fullMedia.photoMetadata.cameraModel}</span>
                                <span className="vertical-align-bottom"><Icon icon="MOTION_MODE" />{fullMedia.photoMetadata.lensMaker} {fullMedia.photoMetadata.lensModel}</span>
                                <span className="vertical-align-bottom"><Icon icon="STRAIGHTEN" />{fullMedia.photoMetadata.focal}</span>
                                <span className="vertical-align-bottom"><Icon icon="SHUTTER_SPEED" />{fullMedia.photoMetadata.shutter}</span>
                                <span className="vertical-align-bottom"><Icon icon="CAMERA" />{fullMedia.photoMetadata.aperture}</span>
                                <span className="vertical-align-bottom"><Icon icon="EXPOSURE" />{fullMedia.photoMetadata.iso}</span>
                            </>}
                            {fullMedia.videoMetadata && <>
                                <span className="vertical-align-bottom"><Icon icon="_24FPS_SELECT" />{fullMedia.videoMetadata.framerate}</span>
                                <span className="vertical-align-bottom"><Icon icon="AV_TIMER" />{t("misc.gallery.upload.modal.video.duration", {
                                    hours: duration![1],
                                    minutes: duration![2],
                                    seconds: duration![3],
                                    milliseconds: duration![4]
                                })}</span>
                            </>}
                        </div>
                    </div>
                </>
                : <LoadingPanel />}
        </div>
    </Modal>
}