"use client"

import { useUser } from "@/components/context/userProvider"
import { upload } from "@/lib/api/gallery/upload";
import { ChangeEvent } from "react";

export default function DebugUpload() {
    const { userDisplay } = useUser();
    const runUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.length ? e.target.files[0] : null;
        if (file && userDisplay) {
            upload(file, userDisplay.display.userId)
                .then(e => console.log("SUCCESS", e))
                .catch(e => console.error("FAIL", e));
        }
    }

    return <div className="page">
        <input type="file" onChange={runUpload} />
    </div>
}