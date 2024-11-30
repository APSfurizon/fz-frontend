import { useTranslations } from "next-intl";
import { useEffect, useState } from "react"
import { useModalUpdate } from "../_lib/context/modalProvider";
import { Media } from "../_lib/components/upload";
import "../styles/dialogues/uploadDialog.css";
import Icon, { ICONS } from "../_components/icon";

export default function UploadDialog ({directUpload = false, isRequired=false, readonly=false, selected, size=96, uploadType = "profile", zIndex}: Readonly<{
    directUpload?: boolean,
    fieldName?: string,
    isRequired?: boolean,
    readonly?: boolean,
    selected?: number,
    size?: number,
    uploadType?: "full" | "profile",
    zIndex: number
}>) { 
    const t = useTranslations("components");
    const [isLoading, setLoading] = useState(false);
    const {isOpen, showModal, hideModal} = useModalUpdate();
    const [uploadsLoaded, setUploadsLoaded] = useState(false);
    const [uploads, setUploads] = useState<Media[]> ();
    const newZIndex = zIndex + 1;

    useEffect(()=> {
        setLoading(true);
        //setLoading(false);
    }, [uploadsLoaded]);

    return (
        <div className="upload-dialog">
            <div className="image-table">
                {isLoading && (
                    <div className="loader vertical-align-middle">
                        <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                        <span>{t("upload.loading_uploads")}</span>
                    </div>
                )}
            </div>
        </div>
    );
}