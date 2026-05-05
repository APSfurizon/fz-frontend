"use client"
import { useUser } from "@/components/context/userProvider";
import { MyUploadsApiAction } from "@/lib/api/gallery/upload/api";
import { runRequest } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { buildSearchParams } from "@/lib/utils";
import Gallery from "@/components/gallery/index";
import UploadContainer from "./_components/uploadContainer";
import "@/styles/misc/gallery/upload/page.css";
import "@/components/gallery";

export default function GalleryUploadPage() {
    const { userDisplayRef, userLoading } = useUser();
    const router = useRouter();
    const path = usePathname();
    const t = useTranslations("");

    // User shall not access this page if not logged in

    useEffect(() => {
        if (userLoading) return;
        if (!userDisplayRef.current) {
            router.push(`/login?continue=${path}`);
        }
    }, [userLoading]);

    // Load media batch
    const onNextData = useCallback((currentCursor: number) => {
        return runRequest({
            action: new MyUploadsApiAction(),
            searchParams: buildSearchParams({ "fromUploadId": String(currentCursor ?? "") })
        }).then(result => Promise.resolve(result.results))
    }, []);

    return <>
        <Gallery.Root getNextData={onNextData}>
            <UploadContainer />
            <h3 className="title medium">{t("misc.gallery.upload.grid.title")}</h3>
            <Gallery.GridView />
        </Gallery.Root>
    </>
}