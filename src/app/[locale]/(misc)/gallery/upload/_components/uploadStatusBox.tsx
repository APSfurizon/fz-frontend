import Image from "next/image";
import { UploadState } from "../page";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@/components/hooks/useWindowSize";
import "@/styles/misc/gallery/upload/page.css";
import CircularProgressBar from "./circularProgressBar";
import Icon from "@/components/icon";

type UploadStatusBoxProps = {
    state: UploadState
}

export default function UploadStatusBox(props: Readonly<UploadStatusBoxProps>) {

    // Image url logic
    const [imageUrl, setImageUrl] = useState<string>();
    useEffect(() => {
        props.state.upload.getThumbnail().then(t => setImageUrl(t.url));
    }, []);

    // Box size logic
    const { width } = useWindowSize();
    const boxSize = useMemo(() => {
        if (width > 850) return 150;
        else if (width > 600) return 100;
        else return 80;
    }, [width]);

    const isError = useMemo(() => props.state.progress.status === "ERROR", [props.state]);
    const isAborted = useMemo(() => props.state.progress.status === "ABORTED", [props.state]);

    return <div className={`uploaded-image rounded-m upload-status-box ${props.state.ended ? "ended" : ""}`}
        style={{ width: boxSize, height: boxSize, overflow: "clip", maxWidth: boxSize }}>
        {!isError && !isAborted &&
            <CircularProgressBar max={props.state.progress.totalSize}
                value={props.state.progress.uploadedSize}
                size={boxSize - 32}
                width={12} />}
        {isError && <Icon className="error-icon" icon="ERROR" />}
        {isAborted && <Icon className="aborted-icon" icon="STOP" />}
        {imageUrl && <Image className="thumbnail" alt="thumbnail" width={boxSize} height={boxSize} src={imageUrl} style={{ objectFit: "cover" }} />}
    </div>
}