"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/misc/nosecount.css";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { AllEventsResponse, FursuitCountApiAction, FursuitCountResponse, GetAllEventsApiAction, NoseCountApiAction, NoseCountResponse, SponsorCountApiAction, SponsorCountResponse } from "@/lib/api/counts";
import { buildSearchParams, translate } from "@/lib/utils";
import UserPicture from "@/components/userPicture";
import Icon, { ICONS } from "@/components/icon";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import useTitle from "@/lib/api/hooks/useTitle";
import ModalError from "@/components/modalError";
import Link from "next/link";
import LoadingPanel from "@/components/loadingPanel";

export default function NosecountPage({ params }: {params: Promise<{slug: string[]}>}) {
    const MODE_FURSUIT = "fursuits";
    const MODE_SPONSOR = "sponsors"

    const router = useRouter();
    const [allEvents, setAllEvents] = useState<AllEventsResponse>();
    const [eventId, setEventId] = useState<number>();
    const [selectedEvent, setSelectedEvent] = useState<string>();

    const [totalCount, setTotalCount] = useState<number>();

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
    
    const t = useTranslations();
    const formatter = useFormatter();
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

    useEffect(()=>{
        if (!roomsData) return;
        const hotelGuestCount = roomsData.hotels.map(
            hotel=>hotel.roomTypes.map(
                roomType => roomType.rooms.map(
                    room => room.guests
                )
            )
        ).flat(3).length;
        
        const dailyFursCount = new Set(Object.keys(roomsData.dailyFurs).map(
            day => roomsData.dailyFurs[day].map(user=>user.userId)
        ).flat()).size;

        setTotalCount(hotelGuestCount + roomsData.ticketOnlyFurs.length + dailyFursCount);
    }, [roomsData])

    useTitle(t("misc.nosecount.title"));

    const options = <>
        {/* Rendering options */}
        <div className="options-list horizontal-list flex-wrap gap-4mm">
            {(fursuitMode || sponsorMode) && 
                <Link href={`/nosecount/${selectedEvent}/`} className="title bold change-mode">
                    {t("misc.nosecount.title")}
                </Link>}
            {!fursuitMode && 
                <Link href={`/nosecount/${selectedEvent}/fursuits`} className="title bold change-mode">
                    {t("misc.nosecount.links.fursuits")}
                </Link>}
            {!sponsorMode && 
                <Link href={`/nosecount/${selectedEvent}/sponsors`} className="title bold change-mode">
                    {t("misc.nosecount.links.sponsors")}
                </Link>}
        </div>
    </>

    return <div className="page">
        {loading && <div className="vertical-list flex-vertical-center"><LoadingPanel/></div>}
        {error && <ModalError translationRoot="misc" translationKey="nosecount.errors" error={error}></ModalError>}

        {/* Rendering sponsors */}
        {sponsorMode && <>
        <p className="title x-large bold">{t("misc.nosecount.sections.sponsors")}</p>
        {options}
        {sponsorData?.users.SUPER_SPONSOR && <p className="title large">{t("common.sponsorships.super_sponsor")}</p>}
        <div className="user-list horizontal-list flex-wrap gap-4mm">
            {sponsorData?.users.SUPER_SPONSOR?.map((user, index)=>
                <UserPicture size={96} key={`ss-${index}`} userData={user} showFlag showNickname></UserPicture>)}
        </div>
        {sponsorData?.users.SPONSOR && <p className="title large">{t("common.sponsorships.sponsor")}</p>}
        <div className="user-list horizontal-list flex-wrap gap-4mm">
            {sponsorData?.users.SPONSOR?.map((user, index)=>
                <UserPicture size={96} key={`s-${index}`} userData={user} showFlag showNickname></UserPicture>)}
        </div>
        </>}

        {/* Rendering fursuits */}
        {fursuitMode && <>
        <p className="title x-large bold">{t("misc.nosecount.sections.fursuits")}</p>
        {options}
        <div className="user-list horizontal-list flex-wrap gap-4mm">
            {fursuitData?.fursuits.map((fursuit, index)=>
                <UserPicture size={96} key={index} fursuitData={fursuit} showFlag showNickname></UserPicture>
            )}
        </div>
        </>}

        {/* Rendering nosecount */}
        {roomsData && <>
        <p className="title x-large bold section-title">{t.rich("misc.nosecount.sections.nosecount", 
            {b: (chunks)=><b className="highlight">{chunks}</b>})}</p>
        <p className="title large">{t("misc.nosecount.total_count", {count: totalCount ?? 0})}</p>
        {options}
        {/* Hotel */}
        <div className="vertical-list gap-4mm">
            {roomsData.hotels.map((hotel, hi)=><div key={hi} className="hotel-container">
                <p className="title medium horizontal-list gap-2mm flex-vertical-center">
                    <Icon iconName={ICONS.LOCATION_CITY}></Icon>
                    {translate(hotel.displayName, locale)}
                </p>
                {/* Room type */}
                {hotel.roomTypes.map((roomType, rti)=><div key={`rt${hi}-${rti}`} className="room-type-container">
                    <p className="title average horizontal-list gap-2mm flex-vertical-center">
                        <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
                        {translate(roomType.roomData.roomTypeNames, locale)}
                    </p>
                    {/* Room */}
                    {roomType.rooms.map((room, ri)=><div key={`ri-${hi}-${rti}-${ri}`} className="room-container vertical-list gap-2mm">
                        <p key={`rh${hi}-${rti}-${ri}`} className="title large bold horizontal-list gap-2mm flex-vertical-center">
                            <Icon iconName={ICONS.BED}></Icon>
                            {room.roomName}
                        </p>
                        <div key={`rgl-${hi}-${rti}-${ri}`} className="horizontal-list flex-wrap gap-4mm room-guests">
                            {room.guests.map((user, ui)=><>
                                <UserPicture size={96} key={`rgl-${hi}-${rti}-${ri}-${ui}`} userData={user} showFlag showNickname></UserPicture>
                            </>)}
                        </div>
                        <hr></hr>
                    </div>)}
                </div>)}
            </div>)}
        </div>
        <div className="user-list horizontal-list flex-wrap gap-4mm">
            {roomsData.ticketOnlyFurs.map((user, index)=>
                <UserPicture size={96} key={index} userData={user} showFlag showNickname></UserPicture>)}
        </div>
        {/* Rendering daily furs */}
        {Object.keys(roomsData.dailyFurs).length > 0 && <>
            <p className="title average horizontal-list gap-2mm flex-vertical-center">
                <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
                {t("misc.nosecount.daily_furs")}
            </p>
            {Object.keys(roomsData.dailyFurs).map((day, di)=> <div className="daily-day">
                    <p className="title">{formatter.dateTime(new Date(day), {dateStyle: "medium"})}</p>
                    <div className="user-list horizontal-list flex-wrap gap-4mm">
                        {roomsData.dailyFurs[day]?.map((user, ui) => 
                            <UserPicture size={96} key={ui} userData={user} showFlag showNickname></UserPicture>)}
                    </div>
                </div>
            )}
            </>}
        </>}
        
    </div>
}