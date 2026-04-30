import Modal from "@/components/modal";
import { useGallery } from "./galleryProvider";
import Image from "next/image";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Icon from "@/components/icon";
import { useTranslations } from "next-intl";

export default function ViewMediaModal() {
    const { currentMedia, closeMedia, modalOpen, goNext, goBack } = useGallery();
    const t = useTranslations();

    return <Modal open={modalOpen} onClose={closeMedia} icon="IMAGE" title={t("misc.gallery.upload.modal.title")}>
        <div className="horizontal-list">
            <a href="#" onClick={() => goBack()}>
                <Icon icon="ARROW_BACK" />
            </a>
            <div className="vertical-list">
                {currentMedia
                    ? <Image alt="gallery picture" src={currentMedia?.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC} width={100} height={100} />
                    : <p>:3</p>}
            </div>
            <a href="#" onClick={() => goNext()}>
                <Icon icon="ARROW_FORWARD" />
            </a>
        </div>
        {currentMedia?.fileName}
    </Modal>
}