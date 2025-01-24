'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import React, { MouseEvent, useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useTranslations, useFormatter, useNow, useLocale } from "next-intl";
import { EVENT_BANNER, EVENT_LOGO, GROUP_CHAT_URL } from "@/app/_lib/constants";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import { BookingOrderApiAction, BookingOrderResponse, BookingOrderUiData, BookingTicketData, calcTicketData, ConfirmMembershipDataApiAction, OrderEditLinkApiAction, OrderRetryLinkApiAction, ShopLinkApiAction, ShopLinkResponse } from "@/app/_lib/api/booking";
import { getCountdown, translate } from "@/app/_lib/utils";
import "../../../../styles/furpanel/booking.css";
import ModalError from "@/app/_components/modalError";
import { useRouter } from "next/navigation";
import Modal from "@/app/_components/modal";
import StatusBox from "@/app/_components/statusBox";
import { AutoInputOrderExchangeManager, OrderExchangeFormAction } from "@/app/_lib/api/order";
import DataForm from "@/app/_components/dataForm";
import { useUser } from "@/app/_lib/context/userProvider";
import AutoInput from "@/app/_components/autoInput";

export default function BookingPage() {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const formatter = useFormatter();
    const router = useRouter();
    const now = useNow({updateInterval: 1000});
    const {showModal} = useModalUpdate();
    const locale = useLocale();
    const {userDisplay} = useUser();
    
    // Main logic
    const [bookingData, setBookingData] = useState<BookingOrderResponse>();
    const [pageData, setPageData] = useState<BookingOrderUiData>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    // exchange order modal
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [exchangeModalOpen, setExchangeModalOpen ] = useState(false);

    const promptExchange = () => {
        if (!bookingData) return;
        setExchangeModalOpen(true);
    }

    const exchangeFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
        setExchangeModalOpen(false);
        showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot={"furpanel"} translationKey={"booking.errors"}></ModalError>
        );
    }

    const exchangeSuccess = () => {
        setExchangeModalOpen(false);
        showModal(t("booking.messages.exchange_invite_sent.title"), 
            <span className="descriptive average">
                {t("booking.messages.exchange_invite_sent.description")}
            </span>, ICONS.CHECK_CIRCLE);
    }
    
    useTitle(t("booking.title"));

    /**UI variables */
    /**If editing's locked */
    let isEditLocked = undefined;
    /**If the store's open */
    let isOpen = undefined;
    /**MS Difference between current date and the store opening date*/
    let openDiff = undefined;
    /**Divided by units of time */
    let countdown = undefined;
    
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
        const hasOrder = !!bookingData && bookingData?.order && ["PENDING", "PAID", "CANCELED"].includes(bookingData?.order?.orderStatus);

        /**Ticket data*/
        const ticketData: BookingTicketData = hasOrder ? calcTicketData(bookingData.order) : {
            isDaily: false,
            ticketName: "",
            dailyDays: undefined
        };

        setPageData ({
            ...ticketData,
            hasOrder: hasOrder,
            bookingStartDate: new Date(bookingData?.bookingStartTime ?? 0),
            editBookEndDate: new Date(bookingData?.editBookEndTime ?? 0),
            shouldUpdateInfo: bookingData?.shouldUpdateInfo,
            shouldRetry: ["PENDING", "CANCELED"].includes(bookingData.order?.orderStatus)
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
        .then((result)=>router.push((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const requestOrderEditLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new OrderEditLinkApiAction())
        .then((result)=>router.push((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const requestRetryPaymentLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new OrderRetryLinkApiAction())
        .then((result)=>router.push((result as ShopLinkResponse).link))
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
        countdown = getCountdown(openDiff)
        /**If the countdown is still running */
        isOpen = openDiff <= 0;
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
                    <NoticeBox title={t("booking.messages.countdown.title")} theme={NoticeTheme.FAQ}>
                        {t("booking.messages.countdown.description", {openingDate: formatter.dateTime(pageData.bookingStartDate)})}
                    </NoticeBox>
                )}
                <div className={`countdown-container rounded-s ${pageData.hasOrder ? "minimized" : ""}`} style={{backgroundImage: `url(${EVENT_BANNER})`}}>
                    <img className="event-logo" alt="a" src={EVENT_LOGO} ></img>
                    {/* Countdown view */}
                    {!isOpen && bookingData?.shouldDisplayCountdown && !pageData.hasOrder && countdown
                    ? <p className="countdown title bold title large rounded-s center">
                        { countdown[0] > 0
                            ? t.rich("booking.coundown_days", {days: countdown[0]})
                            : t.rich("booking.coundown_clock", {hours: countdown[1], minutes: countdown[2], seconds: countdown[3], b: (chunks)=><b className="small">{chunks}</b>})
                        }
                    </p>
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
                    <NoticeBox title={t("booking.messages.review_info.title")} theme={NoticeTheme.Error} className="vertical-list gap-2mm">
                        {t("booking.messages.review_info.description")}
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
                <p className="title medium horizontal-list gap-2mm">
                    {t("booking.your_booking")}
                    <span>({t("booking.items.code")}&nbsp;
                    <b className="highlight">{bookingData?.order?.code}</b>
                    )</span>
                    <StatusBox status={bookingData?.order.orderStatus == "PENDING" ? "warning" : "success"}>
                        {tcommon(`order_status.${bookingData?.order.orderStatus}`)}
                    </StatusBox>
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
                        {pageData?.shouldRetry && <>
                            <Button className="action-button" iconName={ICONS.REPLAY} busy={actionLoading} onClick={requestRetryPaymentLink}>
                            {t("booking.retry_payment")}
                        </Button>
                        </>}
                        <Button className="action-button" disabled={isEditLocked} iconName={ICONS.EDIT} busy={actionLoading} onClick={requestOrderEditLink}>
                            {t("booking.edit_booking")}
                        </Button>
                        <Button className="action-button danger" disabled={isEditLocked} iconName={ICONS.SEND} busy={actionLoading} onClick={()=>promptExchange()}>
                            {t("booking.actions.exchange_order")}
                        </Button>
                    </div>

                    <div className="vertical-list gap-2mm">
                        <NoticeBox theme={isEditLocked ? NoticeTheme.Warning : NoticeTheme.FAQ} title={isEditLocked ? t("booking.messages.editing_locked.title") : t("booking.messages.editing_locked_warning.title")}>
                            {t(isEditLocked ? "booking.messages.editing_locked.description" : "booking.messages.editing_locked_warning.description", {lockDate: formatter.dateTime(pageData.editBookEndDate)})}
                        </NoticeBox>

                        {GROUP_CHAT_URL &&
                        <NoticeBox theme={NoticeTheme.FAQ} customIcon={ICONS.GROUPS} title={t("booking.messages.invite_group.title")}>
                            {t.rich("booking.messages.invite_group.description", 
                                {link: (chunks) => <a className="highlight" target="_blank" href={GROUP_CHAT_URL}>
                                    {GROUP_CHAT_URL}</a>})}
                        </NoticeBox>}
                    </div>

                    {/* Errors view */}
                    {bookingData?.errors && <>
                        <div className="errors-container vertical-list gap-4mm">
                            {bookingData.errors.map((errorCode, index) => {
                                return <NoticeBox key={index} theme={NoticeTheme.Warning} title={t(`booking.errors.${errorCode}.title`)}>
                                    {t(`booking.errors.${errorCode}.description`)}
                                </NoticeBox>;
                            })}
                        </div>
                    </>}
                </div>
                </>
                }
            </>}
        </div>
        {/* Room exchange modal */}
        <Modal icon={ICONS.SEND} open={exchangeModalOpen} title={t("booking.actions.exchange_order")} onClose={()=>setExchangeModalOpen(false)} busy={modalLoading}>
            <DataForm action={new OrderExchangeFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={exchangeSuccess}
            onFail={exchangeFail} hideSave className="vertical-list gap-2mm" shouldReset={!exchangeModalOpen}>
            <input type="hidden" name="userId" value={userDisplay?.display?.userId}></input>
            <AutoInput fieldName="recipientId" required manager={new AutoInputOrderExchangeManager()} multiple={false} disabled={modalLoading}
                label={t("room.input.exchange_user.label")} placeholder={t("room.input.exchange_user.placeholder")} style={{maxWidth: "500px"}}/>
            <div className="horizontal-list gap-4mm">
                <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setExchangeModalOpen(false)}>{tcommon("cancel")}</Button>
                <div className="spacer"></div>
                <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{tcommon("confirm")}</Button>
            </div>
            </DataForm>
        </Modal>
    </>;
}
