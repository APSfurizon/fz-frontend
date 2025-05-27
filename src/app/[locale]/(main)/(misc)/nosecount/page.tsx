"use client"
import { ConventionEvent, GetCurrentEventApiAction } from "@/lib/api/counts";
import { runRequest } from "@/lib/api/global";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function NosecountRoot() {
    const router = useRouter();
    useEffect(() => {
        runRequest(new GetCurrentEventApiAction())
            .then((result) => {
                const event = result;
                router.push(`/nosecount/${event.slug}`)
            }).catch(() => router.back());
    }, []);
    return <></>
}