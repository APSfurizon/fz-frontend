"use client"
import { Event, GetCurrentEventApiAction } from "@/app/_lib/api/counts";
import { runRequest } from "@/app/_lib/api/global";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function NosecountRoot () {
    const router = useRouter();
    useEffect(()=>{
        runRequest(new GetCurrentEventApiAction())
        .then((result)=>{
            const event = result as Event;
            router.push(`/nosecount/${event.slug}`)
        }).catch (()=>router.back());
    }, []);
    return <></>
}