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
import { BookingOrderApiAction, BookingOrderResponse, BookingOrderUiData, ConfirmMembershipDataApiAction, OrderEditLinkApiAction, OrderRetryLinkApiAction, ShopLinkApiAction, ShopLinkResponse } from "@/app/_lib/api/booking";
import { getBiggestTimeUnit, translate } from "@/app/_lib/utils";
import "../../../../styles/furpanel/booking.css";
import ModalError from "@/app/_components/modalError";
import ToolLink from "@/app/_components/toolLink";
import { useRouter } from "next/navigation";

export default function BookingPage() {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const formatter = useFormatter();
    const router = useRouter();
    useTitle(t("booking.title"));
    const now = useNow({updateInterval: 1000});
    const {showModal} = useModalUpdate();
    const locale = useLocale();
    const [bookingData, setBookingData] = useState<BookingOrderResponse>();
    const [pageData, setPageData] = useState<BookingOrderUiData>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    /**UI variables */
    /**If editing's locked */
    let isEditLocked = undefined;
    /**If the store's open */
    let isOpen = undefined;
    /**MS Difference between current date and the store opening date*/
    let openDiff = undefined;
    
    useEffect(()=>{
        if (!!!bookingData) {
            setLoading(true);
            runRequest(new BookingOrderApiAction())
            .then((result)=>setBookingData(result as BookingOrderResponse))
            .catch((err)=>showModal(
                tcommon("error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>,
                ICONS.ERROR
            )).finally(()=>setLoading(false));
            return;
        }
        /**If user has a valid and paid order */
        const hasOrder = !!bookingData && bookingData?.order && ["PENDING", "PAID"].includes(bookingData?.order?.orderStatus);

        /**Order text and daily days*/
        let ticketName: string = "";
        let dailyDays: Date[] | undefined;
        if (hasOrder) {
            if (bookingData.order.dailyTicket) {
                ticketName = "daily_ticket";
                dailyDays = bookingData.order.dailyDays.map(dt=>new Date(dt)).sort((a,b)=>a.getTime()-b.getTime());
            } else {
                ticketName = bookingData.order.sponsorship.toLowerCase() + "_ticket";
            }
        }

        setPageData ({
            hasOrder: hasOrder,
            ticketName: ticketName,
            isDaily: bookingData.order?.dailyTicket,
            dailyDays: dailyDays,
            bookingStartDate: new Date(bookingData?.bookingStartTime ?? 0),
            editBookEndDate: new Date(bookingData?.editBookEndTime ?? 0),
            shouldUpdateInfo: bookingData?.shouldUpdateInfo,
            shouldRetry: bookingData.order.orderStatus === "PENDING"
        });
    }, [bookingData]);

    /**UI generation */
    const orderItem = (name: string | React.ReactNode, iconName: string, subtitle?: string | React.ReactNode) => {
        return (<div className="item vertical-list flex-vertical-center">
            <Icon className="x-large" iconName={iconName}></Icon>
            <span className="descriptive small item-name">{name}</span>
            {subtitle && <span className="descriptive tiny item-subtitle">{subtitle}</span>}
        </div>)
    }

    /**UI Events */
    const requestShopLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new ShopLinkApiAction())
        .then((result)=>window.open((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const requestOrderEditLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new OrderEditLinkApiAction())
        .then((result)=>window.open((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const requestRetryPaymentLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new OrderRetryLinkApiAction())
        .then((result)=>window.open((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const confirmMembershipData = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new ConfirmMembershipDataApiAction(), undefined, undefined, undefined)
        .then((result)=>setBookingData(undefined))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    /**Date calculations */
    if (!!pageData) {
        openDiff = Math.max(pageData.bookingStartDate.getTime() - now.getTime(), 0);
        /**If the countdown is still running */
        isOpen = true;//openDiff <= 0;
        isEditLocked = Math.max(pageData.editBookEndDate.getTime() - now.getTime(), 0) <= 0;
    }

    return <>
        <div className="page">
            {isLoading || !!!pageData ? <>
                <span className="title horizontal-list gap-2mm flex-center">
                    <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}
                </span>
            </> : <>
                {!isOpen && !pageData.hasOrder && (
                    <NoticeBox title={t("booking.countdown")} theme={NoticeTheme.FAQ}>
                        {t("booking.countdown_desc", {openingDate: formatter.dateTime(pageData.bookingStartDate)})}
                    </NoticeBox>
                )}
                <div className={`countdown-container rounded-s ${pageData.hasOrder ? "minimized" : ""}`} style={{backgroundImage: `url(${EVENT_BANNER})`}}>
                    <img className="event-logo" alt="a" src={EVENT_LOGO} ></img>
                    {/* Countdown view */}
                    {!isOpen && bookingData?.shouldDisplayCountdown && !pageData.hasOrder ? <p className="countdown title large rounded-s">{formatter.relativeTime(pageData.bookingStartDate, {now, unit: getBiggestTimeUnit(openDiff ?? 0)})}</p>
                    : !pageData.hasOrder && <div className="action-container">
                        <Button className="action-button book-now" busy={actionLoading} disabled={pageData?.shouldUpdateInfo} onClick={requestShopLink}>
                            <div className="vertical-list flex-vertical-center">
                                <span className="title large">{pageData?.shouldUpdateInfo ? <Icon style={{marginRight: ".2em"}} iconName={ICONS.LOCK}></Icon> : <></>}{t("booking.book_now")}</span>
                                {pageData?.shouldUpdateInfo && <>
                                    <span className="descriptive tiny">({t("booking.review_info_first")})</span>
                                </>}
                            </div>
                        </Button>
                    </div>
                    }
                </div>
                {pageData?.shouldUpdateInfo && <>
                    <NoticeBox title={t("booking.booking_review_info")} theme={NoticeTheme.Error} className="vertical-list gap-2mm">
                        {t("booking.booking_review_info_desc")}
                        <span className="horizontal-list gap-2mm" style={{marginTop: ".5em"}}>
                        <Button className="success" busy={actionLoading} onClick={confirmMembershipData} iconName={ICONS.CHECK}>{t("booking.actions.confirm_info")}</Button>
                        <Button className="warning" busy={actionLoading} onClick={()=>{
                            router.push("/user");
                        }} iconName={ICONS.OPEN_IN_NEW}>{t("booking.actions.review_info")}</Button>
                        </span>
                        
                    </NoticeBox>
                </>}
                {pageData.hasOrder && <>
                {/* Order view */}
                <p className="title medium">
                    {t("booking.your_booking")}&nbsp;
                    <span>({t("booking.items.code")}&nbsp;
                    <b className="highlight">{bookingData?.order?.code}</b>
                    )</span>
                </p>
                <div className="order-data">
                    <div className="order-items-container horizontal-list flex-same-base gap-4mm">
                        {/* Ticket item */}
                        {orderItem(
                            t.rich(`booking.items.${pageData.ticketName}`, {
                                sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
                                supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>
                            }),
                        ICONS.LOCAL_ACTIVITY, 
                        pageData.isDaily ? t("booking.items.daily_days", {days: pageData.dailyDays?.map(dt => formatter.dateTime(dt, {day: "2-digit"})).join(", ")}) : undefined)}
                        {/* Membership item */}
                        {bookingData!.hasActiveMembershipForEvent && orderItem(t("booking.items.membership_card"), ICONS.ID_CARD)}
                        {/* Extra days */}
                        {bookingData!.order.extraDays !== "NONE" && orderItem(t("booking.items.extra_days"), ICONS.CALENDAR_ADD_ON, t(`booking.items.extra_days_${bookingData!.order.extraDays}`))}
                        {/* Room */}
                        {bookingData!.order.room && orderItem(`${t("booking.items.room")} ${translate(bookingData!.order.room.roomTypeNames, locale)}`, ICONS.BED,
                            t("booking.items.room_capacity", {capacity: bookingData!.order.room.roomCapacity}))}
                    </div>

                    {/* Order actions */}
                    <div className="horizontal-list gap-4mm">
                        {pageData?.shouldRetry && !isEditLocked && <>
                            <Button className="action-button" disabled={isEditLocked} iconName={ICONS.REPLAY} busy={actionLoading} onClick={requestRetryPaymentLink}>
                            {t("booking.retry_payment")}
                        </Button>
                        </>}
                        <Button className="action-button" disabled={isEditLocked} iconName={ICONS.EDIT} busy={actionLoading} onClick={requestOrderEditLink}>
                            {t("booking.edit_booking")}
                        </Button>
                    </div>
                    <NoticeBox theme={isEditLocked ? NoticeTheme.Warning : NoticeTheme.FAQ} title={isEditLocked ? t("booking.editing_locked") : t("booking.editing_locked_warning")}>
                        {t(isEditLocked ? "booking.editing_locked_desc" : "booking.editing_locked_warning_desc", {lockDate: formatter.dateTime(pageData.editBookEndDate)})}
                    </NoticeBox>

                    {/* Errors view */}
                    {bookingData?.errors && <>
                        <div className="errors-container vertical-list gap-4mm">{
                            bookingData.errors.map((errorCode, index) => {
                                return <NoticeBox key={index} theme={NoticeTheme.Warning} title={t(`booking.errors.${errorCode}.title`)}>
                                    {t(`booking.errors.${errorCode}.description`)}
                                </NoticeBox>;
                            })
                        }</div>
                    </>}
                </div>
                </>
                }
            </>}
        </div>
    </>;
}
