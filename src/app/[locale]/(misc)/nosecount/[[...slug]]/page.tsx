"use client"
import { useEffect, useMemo, useState } from "react";
import "@/styles/misc/nosecount.css";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import {
    CountViewMode,
    FursuitCountApiAction, FursuitCountResponse, NoseCountApiAction,
    NoseCountResponse, SponsorCountApiAction, SponsorCountResponse,
    useNosecountContext
} from "@/lib/api/counts";
import { buildSearchParams } from "@/lib/utils";
import { translate } from "@/lib/translations";
import Icon from "@/components/icon";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import ErrorMessage from "@/components/errorMessage";
import LoadingPanel from "@/components/loadingPanel";
import { ExtraDays } from "@/lib/api/user";
import StatusBox from "@/components/statusBox";
import NosecountAttendee from "../_components/attendee";
import NosecountFursuit from "../_components/fursuit";

export default function NosecountPage({ params }: { params: Promise<{ slug: string[] }> }) {

    const { event, mode, selectEvent, selectMode } = useNosecountContext();

    const [totalCount, setTotalCount] = useState<number>();

    // Modes
    const [roomsData, setRoomsData] = useState<NoseCountResponse>();
    const [fursuitData, setFursuitData] = useState<FursuitCountResponse>();
    const [sponsorData, setSponsorData] = useState<SponsorCountResponse>();

    // Main logic
    const [needsLoading, setNeedsLoading] = useState(false);
    const [setup, setSetup] = useState(false);
    const [error, setError] = useState<ApiErrorResponse | ApiDetailedErrorResponse>();
    const [loading, setLoading] = useState(false);

    const t = useTranslations();
    const formatter = useFormatter();
    const locale = useLocale();

    useEffect(() => {
        params.then(data => {
            const [organizer, eventName, viewMode] = data.slug ?? [null, null, null];
            setSetup(true);
            if (organizer && eventName) {
                selectEvent(`${organizer}/${eventName}`);
            }
            selectMode(viewMode ?? CountViewMode.NORMAL);
        });
    }, []);

    useEffect(() => {
        if (!event || !setup) return;
        setNeedsLoading(true);
    }, [event?.id, mode]);

    // Loading logic
    useEffect(() => {
        if (!setup || !needsLoading) return;
        setLoading(true);
        setSponsorData(undefined);
        setFursuitData(undefined);
        setRoomsData(undefined);
        setError(undefined);
        const searchParams = buildSearchParams({ "event-id": "" + event?.id });
        if (mode == CountViewMode.FURSUIT) {
            runRequest(new FursuitCountApiAction(), undefined, undefined, searchParams)
                .then((result) => setFursuitData(result))
                .catch((err) => setError(err))
                .finally(() => {
                    setLoading(false);
                    setNeedsLoading(false);
                });
        } else if (mode == CountViewMode.SPONSOR) {
            runRequest(new SponsorCountApiAction(), undefined, undefined, searchParams)
                .then((result) => setSponsorData(result))
                .catch((err) => setError(err))
                .finally(() => {
                    setLoading(false);
                    setNeedsLoading(false);
                });
        } else {
            runRequest(new NoseCountApiAction(), undefined, undefined, searchParams)
                .then((result) => setRoomsData(result))
                .catch((err) => setError(err))
                .finally(() => {
                    setLoading(false);
                    setNeedsLoading(false);
                });
        }
    }, [needsLoading]);

    useEffect(() => {
        if (!roomsData) return;
        const hotelGuestCount = roomsData.hotels.map(
            hotel => hotel.roomTypes.map(
                roomType => roomType.rooms.map(
                    room => room.guests
                )
            )
        ).flat(3).length;

        const dailyFursCount = new Set(Object.keys(roomsData.dailyFurs).map(
            day => roomsData.dailyFurs[day].map(user => user.userId)
        ).flat()).size;

        setTotalCount(hotelGuestCount + roomsData.roomlessFurs.length + dailyFursCount);
    }, [roomsData])

    const title = useMemo(() => {
        switch (mode) {
            case CountViewMode.NORMAL:
                return t("misc.nosecount.title");
            case CountViewMode.FURSUIT:
                return t("misc.nosecount.links.fursuits");
            case CountViewMode.SPONSOR:
                return t("misc.nosecount.links.sponsors");
        }
    }, [mode]);
    useTitle(title);

    return <div className="page">
        {loading && <div className="vertical-list flex-vertical-center"><LoadingPanel /></div>}
        {error && <ErrorMessage error={error} />}

        {/* Rendering sponsors */}
        {mode == CountViewMode.SPONSOR && <>
            {sponsorData?.users.ULTRA_SPONSOR &&
                <p className="title large">{t("common.sponsorships.ultra_sponsor")}</p>}
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {sponsorData?.users.ULTRA_SPONSOR?.map((user, index) =>
                    <NosecountAttendee key={`ss-${index}`} data={user} />
                )}
            </div>
            {sponsorData?.users.SUPER_SPONSOR &&
                <p className="title large">{t("common.sponsorships.super_sponsor")}</p>}
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {sponsorData?.users.SUPER_SPONSOR?.map((user, index) =>
                    <NosecountAttendee key={`ss-${index}`} data={user} />)}
            </div>
            {sponsorData?.users.SPONSOR && <p className="title large">{t("common.sponsorships.sponsor")}</p>}
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {sponsorData?.users.SPONSOR?.map((user, index) =>
                    <NosecountAttendee key={`ss-${index}`} data={user} />)}
            </div>
        </>}

        {/* Rendering fursuits */}
        {mode == CountViewMode.FURSUIT && <>
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {fursuitData?.fursuits.map((fursuit, index) =>
                    <NosecountFursuit key={index} data={fursuit} />
                )}
            </div>
        </>}

        {/* Rendering nosecount */}
        {mode == CountViewMode.NORMAL && roomsData && <>
            <p className="title large">{t("misc.nosecount.total_count", { count: totalCount ?? 0 })}</p>
            {/* Hotel */}
            <div className="vertical-list gap-4mm">
                {roomsData.hotels.map((hotel, hi) => <div key={hi} className="hotel-container">
                    <p className="title medium horizontal-list gap-2mm flex-vertical-center">
                        <Icon icon="LOCATION_CITY" />
                        {translate(hotel.displayName, locale)}
                    </p>
                    {/* Room type */}
                    {hotel.roomTypes.map((roomType, rti) => <div key={`rt${hi}-${rti}`} className="room-type">
                        <p className="title average horizontal-list gap-2mm flex-vertical-center">
                            <Icon icon="BEDROOM_PARENT" />
                            {translate(roomType.roomData.roomTypeNames, locale)}
                        </p>
                        <div className="room-type-container">
                            {/* Room */}
                            {roomType.rooms.map((room, ri) => <div key={`ri-${hi}-${rti}-${ri}`}
                                className="room-container">
                                <div key={`rh${hi}-${rti}-${ri}`}
                                    className="title large bold horizontal-list gap-2mm flex-vertical-center">
                                    <Icon icon="BED" />
                                    <span>{room.roomName}</span>
                                    {room.roomExtraDays && room.roomExtraDays != ExtraDays.NONE && <StatusBox>
                                        {t(`furpanel.booking.items.extra_days_${room.roomExtraDays}`)}
                                    </StatusBox>}
                                </div>
                                <div key={`rgl-${hi}-${rti}-${ri}`}
                                    className="room-guests gap-2mm">
                                    {room.guests.map((guest, ui) =>
                                        <NosecountAttendee key={`rgl-${hi}-${rti}-${ri}-${ui}`}
                                            data={guest.user} />)}
                                </div>
                            </div>)}
                        </div>
                    </div>)}
                </div>)}
            </div>
            <div className="user-list gap-4mm">
                {roomsData.roomlessFurs.map((data, index) =>
                    <NosecountAttendee key={`rf-${index}`}
                        data={data.user}
                        extraDays={data.extraDays} />
                )}
            </div>
            {/* Rendering daily furs */}
            {Object.keys(roomsData.dailyFurs).length > 0 && <>
                <p className="title average horizontal-list gap-2mm flex-vertical-center">
                    <Icon icon="DATE_RANGE" />
                    {t("misc.nosecount.daily_furs")}
                </p>
                {Object.keys(roomsData.dailyFurs).map((day, di) => <div className="daily-day" key={di}>
                    <p className="title">{formatter.dateTime(new Date(day), { dateStyle: "medium" })}</p>
                    <div className="user-list gap-4mm">
                        {roomsData.dailyFurs[day]?.map((user, ui) =>
                            <NosecountAttendee key={ui} data={user} />)}
                    </div>
                </div>
                )}
            </>}
        </>}

    </div>
}