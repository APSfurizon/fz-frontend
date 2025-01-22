"use client"
import { EVENT_NAME } from "@/app/_lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../../../../styles/misc/nosecount.css";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import { FursuitCountApiAction, FursuitCountResponse } from "@/app/_lib/api/counts";
import { buildSearchParams } from "@/app/_lib/utils";
import UserPicture from "@/app/_components/userPicture";
import Icon, { ICONS } from "@/app/_components/icon";
import { useTranslations } from "next-intl";

export default function NosecountPage({params}: {params: Promise<{ event: string }>}) {
    const [selectedEvent, setSelectedEvent] = useState<string>();
    const searchParams = useSearchParams();
    const [fursuitMode, setFursuitMode] = useState(false);
    const [needsLoading, setNeedsLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse | ApiDetailedErrorResponse> ();
    const [fursuitData, setFursuitData] = useState<FursuitCountResponse> ();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const tcommon = useTranslations("common");
    
    // Select event
    useEffect(()=>{
        params.then((loadedParams)=>{
            // Validate year
            if (!loadedParams.event) {
                router.replace(EVENT_NAME);
            }
            setSelectedEvent(loadedParams.event)
        })
    }, []);

    useEffect(()=>{
        setFursuitMode(searchParams.get("fursuits")?.toLowerCase () === "true");
    }, [searchParams])

    useEffect(()=> {
        if (fursuitMode) {
            setNeedsLoading(true);
        }
    }, [fursuitMode])

    // Loading logic
    useEffect(() => {
        if (!needsLoading) return;
        setLoading(true);
        setError(undefined);
        if (fursuitMode) {
            runRequest(new FursuitCountApiAction(), undefined, undefined, buildSearchParams({"event-id": ""+1}))
            .then((result)=>setFursuitData(result as FursuitCountResponse))
            .catch((err)=>setError(err))
            .finally(()=>{
                setLoading(false);
                setNeedsLoading(false);
            });
        } else {
            // TODO: IMPLEMENT
            setLoading(false);
        }
    }, [needsLoading]);

    return <div className="page">
        {loading && <div className="vertical-list flex-vertical-center">
            <div className="horizontal-list gap-4mm">
                <Icon className="loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                {tcommon("loading")}
            </div>
        </div>}
        <div className="horizontal-list flex-wrap">
            {/* Rendering fursuits */}
            {fursuitData?.fursuits.map((fursuit, index)=> <UserPicture key={index} fursuitData={fursuit}></UserPicture>)}
        </div>
    </div>
}