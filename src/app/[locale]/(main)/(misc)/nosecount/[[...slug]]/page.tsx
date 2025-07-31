"use client"
import { useEffect, useState } from "react";
import "@/styles/misc/nosecount.css";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import {
    CountViewMode,
    FursuitCountApiAction, FursuitCountResponse, NoseCountApiAction,
    NoseCountResponse, SponsorCountApiAction, SponsorCountResponse
} from "@/lib/api/counts";
import { buildSearchParams } from "@/lib/utils";
import { translate } from "@/lib/translations";
import UserPicture from "@/components/userPicture";
import Icon from "@/components/icon";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import ModalError from "@/components/modalError";
import LoadingPanel from "@/components/loadingPanel";
import { ExtraDays } from "@/lib/api/user";
import StatusBox from "@/components/statusBox";
import { useNosecountContext } from "../layout";

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

    useTitle(t("misc.nosecount.title"));

    return <div className="page">
        {loading && <div className="vertical-list flex-vertical-center"><LoadingPanel /></div>}
        {error && <ModalError translationRoot="misc" translationKey="nosecount.errors" error={error}></ModalError>}

        {/* Rendering sponsors */}
        {mode == CountViewMode.SPONSOR && <>
            <p className="title x-large bold">{t("misc.nosecount.sections.sponsors")}</p>
            {sponsorData?.users.SUPER_SPONSOR && <p className="title large">
                {t("common.sponsorships.super_sponsor")}
            </p>}
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {sponsorData?.users.SUPER_SPONSOR?.map((user, index) =>
                    <UserPicture size={96} key={`ss-${index}`} userData={user} showFlag showNickname />)}
            </div>
            {sponsorData?.users.SPONSOR && <p className="title large">{t("common.sponsorships.sponsor")}</p>}
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {sponsorData?.users.SPONSOR?.map((user, index) =>
                    <UserPicture size={96} key={`s-${index}`} userData={user} showFlag showNickname />)}
            </div>
        </>}

        {/* Rendering fursuits */}
        {mode == CountViewMode.FURSUIT && <>
            <p className="title x-large bold">{t("misc.nosecount.sections.fursuits")}</p>
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {fursuitData?.fursuits.map((fursuit, index) =>
                    <UserPicture size={96} key={index} fursuitData={fursuit} showFlag showNickname />
                )}
            </div>
        </>}

        {/* Rendering nosecount */}
        {mode == CountViewMode.NORMAL && roomsData && <>
            <p className="title x-large bold section-title">{t.rich("misc.nosecount.sections.nosecount",
                { b: (chunks) => <b className="highlight">{chunks}</b> })}</p>
            <p className="title large">{t("misc.nosecount.total_count", { count: totalCount ?? 0 })}</p>
            {/* Hotel */}
            <div className="vertical-list gap-4mm">
                {roomsData.hotels.map((hotel, hi) => <div key={hi} className="hotel-container">
                    <p className="title medium horizontal-list gap-2mm flex-vertical-center">
                        <Icon icon={"LOCATION_CITY"}></Icon>
                        {translate(hotel.displayName, locale)}
                    </p>
                    {/* Room type */}
                    {hotel.roomTypes.map((roomType, rti) => <div key={`rt${hi}-${rti}`} className="room-type-container">
                        <p className="title average horizontal-list gap-2mm flex-vertical-center">
                            <Icon icon={"BEDROOM_PARENT"}></Icon>
                            {translate(roomType.roomData.roomTypeNames, locale)}
                        </p>
                        {/* Room */}
                        {roomType.rooms.map((room, ri) => <div key={`ri-${hi}-${rti}-${ri}`}
                            className="room-container vertical-list gap-2mm flex-wrap">
                            <p key={`rh${hi}-${rti}-${ri}`}
                                className="title large bold horizontal-list gap-2mm flex-vertical-center">
                                <Icon icon={"BED"}></Icon>
                                {room.roomName}
                                {room.roomExtraDays != ExtraDays.NONE && <div className="horizontal-list gap-2mm">
                                    {[ExtraDays.EARLY, ExtraDays.BOTH].includes(room.roomExtraDays) && <StatusBox>
                                        {t(`furpanel.booking.items.extra_days_${ExtraDays.EARLY}`)}
                                    </StatusBox>}
                                    {[ExtraDays.LATE, ExtraDays.BOTH].includes(room.roomExtraDays) && <StatusBox>
                                        {t(`furpanel.booking.items.extra_days_${ExtraDays.LATE}`)}
                                    </StatusBox>}
                                </div>}
                            </p>
                            <div key={`rgl-${hi}-${rti}-${ri}`}
                                className="horizontal-list flex-wrap gap-4mm room-guests">
                                {room.guests.map((guest, ui) => <>
                                    <UserPicture size={96}
                                        key={`rgl-${hi}-${rti}-${ri}-${ui}`}
                                        userData={guest.user}
                                        showFlag
                                        showNickname />
                                </>)}
                            </div>
                            <hr></hr>
                        </div>)}
                    </div>)}
                </div>)}
            </div>
            <div className="user-list horizontal-list flex-wrap gap-4mm">
                {roomsData.roomlessFurs.map((data, index) =>
                    <UserPicture size={96}
                        key={index}
                        userData={data.user}
                        extraDays={data.extraDays}
                        showFlag
                        showNickname/>)}
            </div>
            {/* Rendering daily furs */}
            {Object.keys(roomsData.dailyFurs).length > 0 && <>
                <p className="title average horizontal-list gap-2mm flex-vertical-center">
                    <Icon icon={"BEDROOM_PARENT"}></Icon>
                    {t("misc.nosecount.daily_furs")}
                </p>
                {Object.keys(roomsData.dailyFurs).map((day, di) => <div className="daily-day" key={di}>
                    <p className="title">{formatter.dateTime(new Date(day), { dateStyle: "medium" })}</p>
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