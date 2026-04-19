import Image from "next/image";
import { UploadState } from "../page";
import { useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@/components/hooks/useWindowSize";

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
        if (width > 1000) return 150;
        else if (width > 600) return 100;
        else 80;
    }, [width]);

    return <div className="uploaded-image rounded-m upload-status-box" style={{ width: boxSize, height: boxSize, overflow: "clip", maxWidth: boxSize }}>
        {imageUrl && <Image alt="thumbnail" width={boxSize} height={boxSize} src={imageUrl} style={{ objectFit: "cover" }} />}
        <progress style={{ maxWidth: boxSize }} max={props.state.progress.totalSize} value={props.state.progress.uploadedSize} />
    </div>
}