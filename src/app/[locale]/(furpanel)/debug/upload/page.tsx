"use client"

import { useUser } from "@/components/context/userProvider"
import Button from "@/components/input/button";
import { GalleryUpload } from "@/lib/api/gallery/upload/main";
import { UploadProgress } from "@/lib/api/gallery/upload/types";
import { ChangeEvent, useState } from "react";

export default function DebugUpload() {
    const [progress, setProgress] = useState<UploadProgress>();
    const [upload, setUpload] = useState<GalleryUpload>();

    const { userDisplay } = useUser();
    const runUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.length ? e.target.files[0] : null;
        if (file && userDisplay) {
            const upload = new GalleryUpload({
                eventId: 1,
                userId: userDisplay.display.userId,
                file
            }, false);
            setUpload(upload);
            upload.addEventHandler("PROGRESS", (e) => {
                setProgress(e.data.progress);
            });
            upload.addEventHandler("DONE", e => console.log(e.upload));
            upload.addEventHandler("ERROR", e => setProgress(e.data.progress));
            upload.start();
        }
    }

    return <div className="page">
        <p>{progress?.uploadedSize}</p>
        <input type="file"
            onChange={runUpload}
            disabled={progress && !["ABORTED", "ERROR", "UPLOAD_COMPLETE"].includes(progress.status ?? "")} />
        {!!progress && <>
            <progress max={progress.totalSize} value={progress.uploadedSize} />
            <p>{progress.status}</p>
            <Button className="danger"
                icon="CANCEL"
                onClick={() => upload?.abort()}
                disabled={["ABORTED", "ERROR", "UPLOAD_COMPLETE"].includes(progress?.status)}>
                ABORT
            </Button>
        </>}
        <Button onClick={() => upload?.confirmUpload()} disabled={progress?.status !== "UPLOAD_COMPLETE"}>
            Confirm
        </Button>
    </div>
}