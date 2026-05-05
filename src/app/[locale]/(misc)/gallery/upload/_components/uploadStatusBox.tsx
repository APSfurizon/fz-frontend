import Image from "next/image";
import { UploadState } from "../page";
import { useEffect, useMemo, useRef, useState } from "react";
import CircularProgressBar from "./uploadPanel/circularProgressBar";
import Icon from "@/components/icon";
import "@/styles/misc/gallery/upload/uploadedMedia.css";
import { useTranslations } from "next-intl";

type UploadStatusBoxProps = {
    state: UploadState
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

    return <div className={`upload-status-box rounded-l ${props.state.ended ? "ended" : ""}`}>
        <div className="picture-container rounded-m">
            {!isError && props.state._launched &&
                <CircularProgressBar max={props.state.progress.totalSize}
                    value={props.state.progress.uploadedSize}
                    size={100}
                    width={12} />}
            {isError && <Icon className="error-icon" icon="ERROR" />}
            {isAborted && <Icon className="aborted-icon" icon="STOP" />}
            {imageUrl && <Image className="thumbnail" alt="thumbnail" width={140} height={140} src={imageUrl} style={{ objectFit: "cover" }} />}
        </div>
        <p className="title small file-name spacer">{props.state.upload.getFileName()}</p>
        {!isAborted && <a role="button" className="stop-button rounded-m" onClick={() => props.state.upload.abort()}>
            <Icon className="abort-icon x-large" icon="STOP" title={t("common.cancel")} />
        </a>}
    </div>
}