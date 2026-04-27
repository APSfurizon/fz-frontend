import Image from "next/image";
import { UploadState } from "../page";
import { useEffect, useMemo, useState } from "react";
import CircularProgressBar from "./uploadPanel/circularProgressBar";
import Icon from "@/components/icon";
import "@/styles/misc/gallery/upload/uploadedMedia.css";
import { useTranslations } from "next-intl";

type UploadStatusBoxProps = {
    state: UploadState,
    size: number
}

export default function UploadStatusBox(props: Readonly<UploadStatusBoxProps>) {
    const t = useTranslations("");
    // Image url logic
    const [imageUrl, setImageUrl] = useState<string>();

    useEffect(() => {
        props.state.upload.getThumbnail().then(t => setImageUrl(t.url));
    }, []);

    const isError = useMemo(() => props.state.progress.status === "ERROR", [props.state]);
    const isAborted = useMemo(() => props.state.progress.status === "ABORTED", [props.state]);

    return <div className={`uploaded-media rounded-m upload-status-box ${props.state.ended ? "ended" : ""}`}>
        {!isError && !isAborted && props.state._launched && <>
            <CircularProgressBar max={props.state.progress.totalSize}
                value={props.state.progress.uploadedSize}
                size={props.size - 32}
                width={12} />
            <a role="button" className="stop-button" onClick={() => props.state.upload.abort()}>
                <Icon className="abort-icon" icon="STOP" title={t("common.cancel")} />
            </a>
        </>}

        {isError && <Icon className="error-icon" icon="ERROR" />}
        {isAborted && <Icon className="aborted-icon" icon="STOP" />}
        {imageUrl && <Image className="thumbnail" alt="thumbnail" width={140} height={140} src={imageUrl} style={{ objectFit: "cover" }} />}
    </div>
}