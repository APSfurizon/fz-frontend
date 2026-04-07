"use client"

import { useUser } from "@/components/context/userProvider"
import { upload, UploadProgress } from "@/lib/api/gallery/upload";
import { ChangeEvent, useState } from "react";

export default function DebugUpload() {
    const [progress, setProgress] = useState<UploadProgress>();

    const { userDisplay } = useUser();
    const runUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.length ? e.target.files[0] : null;
        if (file && userDisplay) {
            upload(file, 1, userDisplay.display.userId, (status) => { setProgress(status); console.log(status); })
                .then(e => console.log("SUCCESS", e))
                .catch(e => console.error("FAIL", e))
                .finally(() => setProgress(undefined));
        }
    }

    return <div className="page">
        <p>{progress?.uploadedSize}</p>
        <input type="file" onChange={runUpload} disabled={!!progress} />
        {!!progress && <progress max={progress.totalSize} value={progress.uploadedSize} />}
    </div>
}