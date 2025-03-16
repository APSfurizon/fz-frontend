'use client'
import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import React, { MouseEvent, useEffect, useState } from "react";
import useTitle from "@/lib/api/hooks/useTitle";
import { useTranslations, useFormatter, useNow, useLocale } from "next-intl";
import { EVENT_BANNER, EVENT_LOGO, GROUP_CHAT_URL } from "@/lib/constants";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { BookingOrderApiAction, BookingOrderResponse, BookingOrderUiData, BookingTicketData, calcTicketData, ConfirmMembershipDataApiAction, mapOrderStatusToStatusBox, OrderEditLinkApiAction, OrderRetryLinkApiAction, ShopLinkApiAction, ShopLinkResponse } from "@/lib/api/booking";
import { getCountdown, translate } from "@/lib/utils";
import { useQRCode } from 'next-qrcode'
import ModalError from "@/components/modalError";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal";
import StatusBox from "@/components/statusBox";
import { AutoInputOrderExchangeManager, OrderExchangeFormAction } from "@/lib/api/order";
import DataForm from "@/components/dataForm";
import { useUser } from "@/components/context/userProvider";
import AutoInput from "@/components/autoInput";
import LoadingPanel from "@/components/loadingPanel";
import "@/styles/furpanel/booking.css";

export default function BookingPage() {
    const t = useTranslations();
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
            t("common.error"), 
            <ModalError error={err} translationRoot={"furpanel"} translationKey={"booking.errors"}></ModalError>
        );
    }

    const exchangeSuccess = () => {
        setExchangeModalOpen(false);
        showModal(t("furpanel.booking.messages.exchange_invite_sent.title"), 
            <span className="descriptive average">
                {t("furpanel.booking.messages.exchange_invite_sent.description")}
            </span>, ICONS.CHECK_CIRCLE);
    }
    
    // order QR logic
    const [secretModalOpen, setSecretModalOpen] = useState(false);
    const { Canvas } = useQRCode();

    useTitle(t("furpanel.booking.title"));

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
                t("common.error"),
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
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const requestOrderEditLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new OrderEditLinkApiAction())
        .then((result)=>router.push((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const requestRetryPaymentLink = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new OrderRetryLinkApiAction())
        .then((result)=>router.push((result as ShopLinkResponse).link))
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
        )).finally(()=>setActionLoading(false));
    }

    const confirmMembershipData = (e: MouseEvent<HTMLElement>) => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new ConfirmMembershipDataApiAction(), undefined, undefined, undefined)
        .then((result)=>setBookingData(undefined))
        .catch((err)=>showModal(
            t("common.error"), 
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
            {isLoading || !!!pageData ? <LoadingPanel/> : <>
                {!isOpen && !pageData.hasOrder && (
                    <NoticeBox title={t("furpanel.booking.messages.countdown.title")} theme={NoticeTheme.FAQ}>
                        {t("furpanel.booking.messages.countdown.description", {openingDate: formatter.dateTime(pageData.bookingStartDate)})}
                    </NoticeBox>
                )}
                <div className={`countdown-container rounded-s ${pageData.hasOrder ? "minimized" : ""}`} style={{backgroundImage: `url(${EVENT_BANNER})`}}>
                    <img className="event-logo" alt="a" src={EVENT_LOGO} ></img>
                    {/* Countdown view */}
                    {!isOpen && bookingData?.shouldDisplayCountdown && !pageData.hasOrder && countdown
                    ? <p className="countdown title bold title large rounded-s center">
                        { countdown[0] > 0
                            ? t.rich("furpanel.booking.coundown_days", {days: countdown[0]})
                            : t.rich("furpanel.booking.coundown_clock", {hours: countdown[1], minutes: countdown[2], seconds: countdown[3], b: (chunks)=><b className="small">{chunks}</b>})
                        }
                    </p>
                    : !pageData.hasOrder && <div className="action-container">
                        <Button className="action-button book-now" busy={actionLoading} disabled={pageData?.shouldUpdateInfo} onClick={requestShopLink}>
                            <div className="vertical-list flex-vertical-center">
                                <span className="title large">{pageData?.shouldUpdateInfo ? <Icon style={{marginRight: ".2em"}} iconName={ICONS.LOCK}></Icon> : <></>}{t("furpanel.booking.book_now")}</span>
                                {pageData?.shouldUpdateInfo && <>
                                    <span className="descriptive tiny">({t("furpanel.booking.review_info_first")})</span>
                                </>}
                            </div>
                        </Button>
                    </div>
                    }
                </div>
                {pageData?.shouldUpdateInfo && <>
                    <NoticeBox title={t("furpanel.booking.messages.review_info.title")} theme={NoticeTheme.Error} className="vertical-list gap-2mm">
                        {t("furpanel.booking.messages.review_info.description")}
                        <span className="horizontal-list gap-2mm" style={{marginTop: ".5em"}}>
                        <Button className="success" busy={actionLoading} onClick={confirmMembershipData} iconName={ICONS.CHECK}>{t("furpanel.booking.actions.confirm_info")}</Button>
                        <Button className="warning" busy={actionLoading} onClick={()=>{
                            router.push("/user");
                        }} iconName={ICONS.OPEN_IN_NEW}>{t("furpanel.booking.actions.review_info")}</Button>
                        </span>
                        
                    </NoticeBox>
                </>}
                {pageData.hasOrder && <>
                {/* Order view */}
                <div className="horizontal-list flex-vertical-center gap-2mm flex-wrap">
                    <span className="title medium">{t("furpanel.booking.your_booking")}</span>
                    <span className="title medium">({t("furpanel.booking.items.code")}&nbsp;
                    <b className="highlight">{bookingData?.order?.code}</b>
                    )</span>
                    <StatusBox status={mapOrderStatusToStatusBox(bookingData?.order.orderStatus ?? "CANCELED")}>
                        {t(`common.order_status.${bookingData?.order.orderStatus}`)}
                    </StatusBox>
                    {bookingData?.order?.secret && <Button iconName={ICONS.QR_CODE} onClick={()=>setSecretModalOpen(true)}
                        title={t("furpanel.booking.actions.show_qr")}/>}
                </div>
                <div className="order-data">
                    <div className="order-items-container horizontal-list flex-same-base gap-4mm flex-wrap">
                        {/* Ticket item */}
                        {orderItem(
                            t.rich(`furpanel.booking.items.${pageData.ticketName}`, {
                                sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
                                supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>
                            }),
                        ICONS.LOCAL_ACTIVITY, 
                        pageData.isDaily ? t("furpanel.booking.items.daily_days", {days: pageData.dailyDays?.map(dt => formatter.dateTime(dt, {day: "2-digit"})).join(", ")}) : undefined)}
                        {/* Membership item */}
                        {bookingData!.hasActiveMembershipForEvent && orderItem(t("furpanel.booking.items.membership_card"), ICONS.ID_CARD)}
                        {/* Extra days */}
                        {bookingData!.order.extraDays !== "NONE" && orderItem(t("furpanel.booking.items.extra_days"), ICONS.CALENDAR_ADD_ON, t(`furpanel.booking.items.extra_days_${bookingData!.order.extraDays}`))}
                        {/* Room */}
                        {bookingData!.order.room && orderItem(`${t("furpanel.booking.items.room")} ${translate(bookingData!.order.room.roomTypeNames, locale)}`, ICONS.BED,
                            t("furpanel.booking.items.room_capacity", {capacity: bookingData!.order.room.roomCapacity}))}
                    </div>

                    {/* Order actions */}
                    <div className="horizontal-list gap-4mm">
                        {pageData?.shouldRetry && <>
                            <Button className="action-button" iconName={ICONS.REPLAY} busy={actionLoading} onClick={requestRetryPaymentLink}>
                            {t("furpanel.booking.retry_payment")}
                        </Button>
                        </>}
                        <Button className="action-button" disabled={isEditLocked} iconName={ICONS.OPEN_IN_NEW} busy={actionLoading} onClick={requestOrderEditLink}>
                            {t("furpanel.booking.edit_booking")}
                        </Button>
                        <div className="spacer"></div>
                        <Button className="action-button danger" disabled={isEditLocked} iconName={ICONS.SEND} busy={actionLoading} onClick={()=>promptExchange()}>
                            {t("furpanel.booking.actions.exchange_order")}
                        </Button>
                    </div>

                    <div className="vertical-list gap-2mm">
                        <NoticeBox theme={isEditLocked ? NoticeTheme.Warning : NoticeTheme.FAQ} title={isEditLocked ? t("furpanel.booking.messages.editing_locked.title") : t("furpanel.booking.messages.editing_locked_warning.title")}>
                            {t(isEditLocked ? "furpanel.booking.messages.editing_locked.description" : "furpanel.booking.messages.editing_locked_warning.description", {lockDate: formatter.dateTime(pageData.editBookEndDate)})}
                        </NoticeBox>

                        {GROUP_CHAT_URL &&
                        <NoticeBox theme={NoticeTheme.FAQ} customIcon={ICONS.GROUPS} title={t("furpanel.booking.messages.invite_group.title")}>
                            {t.rich("furpanel.booking.messages.invite_group.description", 
                                {link: (chunks) => <a className="highlight" target="_blank" href={GROUP_CHAT_URL}>
                                    {GROUP_CHAT_URL}</a>})}
                        </NoticeBox>}
                    </div>

                    {/* Errors view */}
                    {bookingData?.errors && <>
                        <div className="errors-container vertical-list gap-4mm">
                            {bookingData.errors.map((errorCode, index) => {
                                return <NoticeBox key={index} theme={NoticeTheme.Warning} title={t(`furpanel.booking.errors.${errorCode}.title`)}>
                                    {t(`furpanel.booking.errors.${errorCode}.description`)}
                                </NoticeBox>;
                            })}
                        </div>
                    </>}
                </div>
                </>
                }
            </>}
        </div>
        {/* Order exchange modal */}
        <Modal icon={ICONS.SEND} open={exchangeModalOpen} title={t("furpanel.booking.actions.exchange_order")} onClose={()=>setExchangeModalOpen(false)} busy={modalLoading}>
            <span className="descriptive small">{t("furpanel.booking.messages.exchange_explaination")}</span>
            <DataForm action={new OrderExchangeFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={exchangeSuccess}
            onFail={exchangeFail} hideSave className="vertical-list gap-2mm" shouldReset={!exchangeModalOpen}>
            <input type="hidden" name="userId" value={userDisplay?.display?.userId ?? ""}></input>
            <AutoInput fieldName="recipientId" required manager={new AutoInputOrderExchangeManager()} multiple={false} disabled={modalLoading}
                label={t("furpanel.room.input.exchange_user.label")} placeholder={t("furpanel.room.input.exchange_user.placeholder")} style={{maxWidth: "500px"}}/>
            <div className="horizontal-list gap-4mm">
                <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setExchangeModalOpen(false)}>{t("common.cancel")}</Button>
                <div className="spacer"></div>
                <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{t("common.confirm")}</Button>
            </div>
            </DataForm>
        </Modal>
        {/* QR Secret modal */}
        <Modal open={secretModalOpen} icon={ICONS.QR_CODE} title={t("furpanel.booking.reservation_qr")} onClose={()=>setSecretModalOpen(false)}>
                <div className="horizontal-list" style={{justifyContent: "center"}}>
                <Canvas
                    text={bookingData?.order?.secret ?? "a"}
                    options={{
                        type: 'image/jpeg',
                        quality: 0.3,
                        errorCorrectionLevel: 'M',
                        margin: 3,
                        scale: 4,
                        width: 200,
                        color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                        },
                    }}
                />
                </div>
        </Modal>
    </>;
}
