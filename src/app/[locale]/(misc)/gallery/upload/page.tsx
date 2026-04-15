"use client"
import { useUser } from "@/components/context/userProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GalleryUploadPage() {
    const { userDisplay, userLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (userLoading) return;
        if (!userDisplay) {
            router.back();
        }
    }, [userLoading])

    return <></>
}