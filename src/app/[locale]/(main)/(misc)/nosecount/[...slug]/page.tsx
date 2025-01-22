"use client"
import { EVENT_NAME } from "@/app/_lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../../../../styles/misc/nosecount.css";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import { AllEventsResponse, FursuitCountApiAction, FursuitCountResponse, GetAllEventsApiAction, NoseCountApiAction, NoseCountResponse, SponsorCountApiAction, SponsorCountResponse } from "@/app/_lib/api/counts";
import { buildSearchParams, translate } from "@/app/_lib/utils";
import UserPicture from "@/app/_components/userPicture";
import Icon, { ICONS } from "@/app/_components/icon";
import { useLocale, useTranslations } from "next-intl";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import ModalError from "@/app/_components/modalError";
import Link from "next/link";

export default function NosecountPage({ params }: {params: Promise<{slug: string[]}>}) {
    const MODE_FURSUIT = "fursuits";
    const MODE_SPONSOR = "sponsors"

    const router = useRouter();
    const [allEvents, setAllEvents] = useState<AllEventsResponse>();
    const [eventId, setEventId] = useState<number>();
    const [selectedEvent, setSelectedEvent] = useState<string>();

    // Modes
    const [roomsData, setRoomsData] = useState<NoseCountResponse> ();
    const [fursuitMode, setFursuitMode] = useState(false);
    const [fursuitData, setFursuitData] = useState<FursuitCountResponse> ();
    const [sponsorMode, setSponsorMode] = useState(false);
    const [sponsorData, setSponsorData] = useState<SponsorCountResponse> ();

    // Main logic
    const [needsLoading, setNeedsLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse | ApiDetailedErrorResponse> ();
    const [loading, setLoading] = useState(false);
    
    const t = useTranslations("misc");
    const tcommon = useTranslations("common");
    const locale = useLocale();

    useEffect(()=>{
        if (!allEvents) {
            setLoading(true);
            runRequest(new GetAllEventsApiAction())
            .then(events=>setAllEvents(events as AllEventsResponse))
            .catch(err=>setError(err))
            .finally(()=>setLoading(false));
        }
        params.then(data=>{
            const [organizer, eventName, mode] = data.slug;
            // Handle special modes
            switch (mode ?? "") {
                case MODE_FURSUIT:
                    setFursuitMode(true);
                    break;
                case MODE_SPONSOR:
                    setSponsorMode(true);
                    break;
            }
            setSelectedEvent(`${organizer}/${eventName}`);
        });
    }, []);

    // Once events are loaded and an event is selected
    useEffect(()=>{
        if (!allEvents || !selectedEvent) return;
        // find the event
        const event = allEvents?.events
            .find((event, index)=>event.slug.toLowerCase() === (selectedEvent ?? "").toLowerCase());
        // Set event id or default to current
        if (event) {
            setEventId(event.id);
        } else {
            const current = allEvents?.events.find(evt=>evt.current);
            setEventId(current?.id);
            setSelectedEvent(current?.slug);
            router.push(`nosecount/${current?.slug}`)
        }
        
    }, [allEvents, selectedEvent]);

    useEffect(()=> {
        if (!eventId) return;
        setNeedsLoading(true);
    }, [fursuitMode, sponsorMode, eventId])

    // Loading logic
    useEffect(() => {
        if (!needsLoading) return;
        // console.log(MODE_FURSUIT, fursuitMode);
        // console.log(MODE_SPONSOR, sponsorMode);
        // console.log("event", selectedEvent);
        // console.log("eventId", eventId);
        setLoading(true);
        setSponsorData(undefined);
        setFursuitData(undefined);
        setRoomsData(undefined);
        setError(undefined);
        const searchParams = buildSearchParams({"event-id": ""+eventId});
        if (fursuitMode) {
            runRequest(new FursuitCountApiAction(), undefined, undefined, searchParams)
            .then((result)=>setFursuitData(result as FursuitCountResponse))
            .catch((err)=>setError(err))
            .finally(()=>{
                setLoading(false);
                setNeedsLoading(false);
            });
        } else if (sponsorMode) {
            runRequest(new SponsorCountApiAction(), undefined, undefined, searchParams)
            .then((result)=>setSponsorData(result as SponsorCountResponse))
            .catch((err)=>setError(err))
            .finally(()=>{
                setLoading(false);
                setNeedsLoading(false);
            });
        } else {
            runRequest(new NoseCountApiAction(), undefined, undefined, searchParams)
            .then((result)=>setRoomsData(result as NoseCountResponse))
            .catch((err)=>setError(err))
            .finally(()=>{
                setLoading(false);
                setNeedsLoading(false);
            });
        }
    }, [needsLoading]);

    useTitle(t("nosecount.title"));

    const options = <>
        {/* Rendering options */}
        <div className="options-list horizontal-list flex-wrap gap-4mm">
            {(fursuitMode || sponsorMode) && 
                <Link href={`/nosecount/${selectedEvent}/`} className="title bold change-mode">
                    {t("nosecount.title")}
                </Link>}
            {!fursuitMode && 
                <Link href={`/nosecount/${selectedEvent}/fursuits`} className="title bold change-mode">
                    {t("nosecount.links.fursuits")}
                </Link>}
            {!sponsorMode && 
                <Link href={`/nosecount/${selectedEvent}/sponsors`} className="title bold change-mode">
                    {t("nosecount.links.sponsors")}
                </Link>}
        </div>
    </>

    return <div className="page">
        {loading && <div className="vertical-list flex-vertical-center">
            <div className="horizontal-list gap-4mm">
                <Icon className="loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                {tcommon("loading")}
            </div>
        </div>}
        {error && <ModalError translationRoot="misc" translationKey="nosecount.errors" error={error}></ModalError>}

        {/* Rendering sponsors */}
        {sponsorData?.users.map((user, index)=> <UserPicture size={96} key={index} userData={user} showFlag showNickname></UserPicture>)}
        {/* Rendering fursuits */}
        {fursuitMode && fursuitData?.fursuits.map((fursuit, index)=> <>
        <p className="title x-large bold">{t("nosecount.sections.fursuits")}</p>
        {options}
        <div className="horizontal-list flex-wrap">
            <UserPicture size={96} key={index} fursuitData={fursuit} showFlag showNickname></UserPicture>
        </div>
        </>)}

        {/* Rendering nosecount */}
        {roomsData && <>
        <p className="title x-large bold section-title">{t.rich("nosecount.sections.nosecount", 
            {b: (chunks)=><b className="highlight">{chunks}</b>})}</p>
        {options}
        {/* Hotel */}
        <div className="vertical-list gap-4mm">
            {roomsData.hotels.map((hotel, hi)=><div key={hi} className="hotel-container">
                <p className="title medium horizontal-list gap-2mm flex-vertical-center">
                    <Icon iconName={ICONS.LOCATION_CITY}></Icon>
                    {translate(hotel.displayName, locale)}
                </p>
                {/* Room type */}
                {hotel.roomTypes.map((roomType, rti)=><div key={rti} className="room-type-container">
                    <p className="title horizontal-list gap-2mm flex-vertical-center">
                        <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
                        {translate(roomType.roomData.roomTypeNames, locale)}
                    </p>
                    {/* Room */}
                    {roomType.rooms.map((room, ri)=><div key={ri} className="room-container vertical-list gap-2mm">
                        <p className="title horizontal-list gap-2mm flex-vertical-center">
                            <Icon iconName={ICONS.GROUPS}></Icon>
                            {room.roomName}
                        </p>
                        <div className="horizontal-list flex-wrap gap-4mm room-guests" key={ri}>
                            {room.guests.map((user, ui)=><>
                                <UserPicture size={96} key={ui} userData={user} showFlag showNickname></UserPicture>
                            </>)}
                        </div>
                    </div>)}
                </div>)}
            </div>)}
        </div>
        </>}
        
    </div>
}