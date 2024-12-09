'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import React, { MouseEvent, useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useTranslations, useFormatter, useNow, useLocale } from "next-intl";
import { EVENT_BANNER, EVENT_LOGO } from "@/app/_lib/constants";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { runRequest } from "@/app/_lib/api/global";
import { BookingOrderApiAction, BookingOrderResponse, OrderEditLinkApiAction, ShopLinkApiAction, ShopLinkResponse } from "@/app/_lib/api/booking";
import { getBiggestTimeUnit, getErrorBody, translate } from "@/app/_lib/utils";
import "../../../../styles/furpanel/booking.css";
import Image from "next/image";

export default function BookingPage() {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const formatter = useFormatter();
    const now = useNow({updateInterval: 1000});
    useTitle(t("booking.title"));
    const {showModal} = useModalUpdate();
    const locale = useLocale();
    const [bookingData, setBookingData] = useState<BookingOrderResponse>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [linkLoading, setLinkLoading] = useState<boolean>(false);
    const date = new Date("2025-01-13T15:30:00.000Z");

    useEffect(()=>{
        setLoading(true);
        runRequest(new BookingOrderApiAction())
        .then((result)=>setBookingData(result as BookingOrderResponse))
        .catch((err)=>showModal(
            tcommon("error"), 
            <span className='error'>{getErrorBody(err) ?? tcommon("unknown_error")}</span>
        )).finally(()=>setLoading(false));
    }, [])

    const requestShopLink = (e: MouseEvent<HTMLElement>) => {
        if (linkLoading) return;
        setLinkLoading(true);
        runRequest(new ShopLinkApiAction())
        .then((result)=>window.open((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <span className='error'>{getErrorBody(err) ?? tcommon("unknown_error")}</span>
        )).finally(()=>setLinkLoading(false));
    }

    const requestOrderEditLink = (e: MouseEvent<HTMLElement>) => {
        if (linkLoading) return;
        setLinkLoading(true);
        runRequest(new OrderEditLinkApiAction())
        .then((result)=>window.open((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <span className='error'>{getErrorBody(err) ?? tcommon("unknown_error")}</span>
        )).finally(()=>setLinkLoading(false));
    }

    /**Chooses whether the user has to wait for the countdown */
    const showCountdown = bookingData?.shouldDisplayCountdown;
    const bookingDate = /*new Date(bookingData?.bookingStartTime ?? 0).getTime() ?? 0*/new Date(2024, 11, 9, 22, 12, 0, 0).getTime();
    const openDiff = Math.max(bookingDate - now.getTime(), 0);
    /**If the countdown is still running */
    const isOpen = openDiff <= 0;
    const editLockDate = new Date(bookingData?.editBookEndTime ?? 0).getTime();
    const isEditLocked = Math.max(editLockDate - now.getTime(), 0) <= 0;
    const hasOrder = bookingData?.order && ["PENDING", "PAID"].includes(bookingData?.order?.orderStatus);

    const orderItem = (name: string | React.ReactNode, iconName: string) => {
        return (<div className="item vertical-list flex-vertical-center">
            <Icon className="x-large" iconName={iconName}></Icon>
            <span className="item-name">{name}</span>
        </div>)
    }

    /**Order text */
    let orderTicketName = null;
    if (hasOrder) {
        if (bookingData.order.isDailyTicket)
            orderTicketName = "daily_ticket";
        else
            orderTicketName = bookingData.order.sponsorship.toLowerCase() + "_ticket";
    }

    const loadingUi = (
        <span className="title horizontal-list gap-2mm flex-center">
            <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}
        </span>
    );
    const loadedUi = <>
        <div className={`countdown-container rounded-s ${hasOrder ? "minimized" : ""}`} style={{backgroundImage: `url(${EVENT_BANNER})`}}>
            <img className="event-logo" alt="a" src={EVENT_LOGO} ></img>
            {/* Countdown view */}
            {!isOpen && showCountdown && !hasOrder ? <p className="countdown title large rounded-s">{formatter.relativeTime(bookingDate, {now, unit: getBiggestTimeUnit(openDiff)})}</p>
            : !hasOrder && <div className="action-container">
                <Button className="action-button book-now" busy={linkLoading} onClick={requestShopLink}>
                    {t("booking.book_now")}
                </Button>
            </div>
            }
        </div>
        {!isOpen && (
            <NoticeBox title={t("booking.countdown")} theme={NoticeTheme.FAQ}>
                {t("booking.countdown_desc", {openingDate: formatter.dateTime(bookingDate)})}
            </NoticeBox>
        )}
        {hasOrder && <>
        {/* Order view */}
        <p className="title medium">
            {t("booking.your_booking")}&nbsp;
            <span>({t("booking.items.code")}&nbsp;
            <b className="highlight">{bookingData?.order?.code}
            </b>
            )</span>
        </p>
        <div className="order-data">
            <div className="order-items-container horizontal-list flex-same-base gap-4mm">
                {/* Ticket item */}
                {orderItem(
                    t.rich(`booking.items.${orderTicketName}`, {
                        sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
                        supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>
                    }),
                ICONS.LOCAL_ACTIVITY)}
                {/* Membership item */}
                {bookingData.hasActiveMembershipForEvent && orderItem(t("booking.items.membership_card"), ICONS.ID_CARD)}
                {/* Extra days */}
                {bookingData.order.extraDays !== "NONE" && orderItem(t(`booking.items.extra_days_${bookingData.order.extraDays}`), ICONS.CALENDAR_ADD_ON)}
                {/* Room */}
                {bookingData.order.room && orderItem(translate(bookingData.order.room.roomTypeNames, locale), ICONS.BED)}
            </div>
            <Button className="action-button" disabled={isEditLocked} iconName={ICONS.EDIT} busy={linkLoading} onClick={requestOrderEditLink}>
                {t("booking.edit_booking")}
            </Button>
            <NoticeBox theme={isEditLocked ? NoticeTheme.Warning : NoticeTheme.FAQ} title={isEditLocked ? t("booking.editing_locked") : t("booking.editing_locked_warning")}>
                {t(isEditLocked ? "booking.editing_locked_desc" : "booking.editing_locked_warning_desc", {lockDate: formatter.dateTime(editLockDate)})}
            </NoticeBox>
        </div>
        </>}
    </>;

    return <>
        <div className="page">
            {isLoading ? loadingUi : loadedUi}
        </div>
    </>;
}
