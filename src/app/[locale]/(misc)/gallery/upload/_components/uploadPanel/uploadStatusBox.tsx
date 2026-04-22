import Image from "next/image";
import { UploadState } from "../../page";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "@/components/hooks/useWindowSize";
import "@/styles/misc/gallery/upload/page.css";
import CircularProgressBar from "./circularProgressBar";
import Icon from "@/components/icon";

type UploadStatusBoxProps = {
    state: UploadState
}

export default function UploadStatusBox(props: Readonly<UploadStatusBoxProps>) {

    const divRef = useRef<HTMLDivElement>(null!);

    // Image url logic
    const [imageUrl, setImageUrl] = useState<string>();

    useEffect(() => {
        props.state.upload.getThumbnail().then(t => setImageUrl(t.url));
    }, []);

    const boxSize = Math.max(divRef.current?.clientWidth ?? 80, 80);
    const isError = useMemo(() => props.state.progress.status === "ERROR", [props.state]);
    const isAborted = useMemo(() => props.state.progress.status === "ABORTED", [props.state]);

    return <div ref={divRef} className={`uploaded-image rounded-m upload-status-box ${props.state.ended ? "ended" : ""}`}>
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