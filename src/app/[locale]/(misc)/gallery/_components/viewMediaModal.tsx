import Modal from "@/components/modal";
import { useGallery } from "./galleryProvider";
import Image from "next/image";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Icon from "@/components/icon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GalleryUploadedFullMedia } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { GetFullMediaApiAction } from "@/lib/api/gallery/api";
import "@/styles/misc/gallery/viewMediaModal.css";
import LoadingPanel from "@/components/loadingPanel";

export default function ViewMediaModal() {
    const { currentMedia, closeMedia, modalOpen, goNext, goBack } = useGallery();
    const t = useTranslations();

    const [loading, setLoading] = useState(false);
    const [fullMedia, setFullMedia] = useState<GalleryUploadedFullMedia>();
    const [dataPanelOpen, setDataPanelOpen] = useState(false);

    const closeModal = () => {

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

    return <Modal open={modalOpen}
        onClose={closeMedia}
        icon="IMAGE"
        busy={loading}
        title={t("misc.gallery.upload.modal.title")}
        className="view-media-modal">
        { /* Main image view */}
        <div className="view-grid">
            <div className="back-button">
                <a href="#" onClick={() => goBack()}><Icon icon="ARROW_BACK" /></a>
            </div>
            <div className="media-container">
                {currentMedia
                    ? <Image alt="gallery image" src={currentMedia?.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC} width={100} height={100} />
                    : <p>:3</p>}
            </div>
            <div className="forward-button align-right">
                <a href="#" onClick={() => goNext()}><Icon icon="ARROW_FORWARD" /></a>
            </div>
            {fullMedia
                ? <>
                    <div className="bottom-toolbar horizontal-list">
                        <div className="horizontal-list author">
                            <img src={fullMedia.photographer.propic?.mediaUrl} />
                            <span>{fullMedia.photographer.fursonaName}</span>
                        </div>
                        <div className="spacer"></div>
                        <span>Download</span>
                    </div>
                    { /* Information panel */}
                    <div className={["information-panel", dataPanelOpen ? "open" : ""].join(" ")}>
                        <div className="header">
                            <a title={dataPanelOpen ? t("common.close") : t("common.open")}
                                href="#"
                                onClick={() => setDataPanelOpen(prev => !prev)}>
                                <Icon icon={dataPanelOpen ? "CLOSE" : "READ_MORE"} />
                            </a>
                        </div>
                        <div className="data">
                            {currentMedia?.fileName}
                        </div>
                    </div>
                </>
                : <LoadingPanel />}
        </div>
    </Modal>
}