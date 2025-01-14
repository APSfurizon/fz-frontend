import { CSSProperties, Dispatch, SetStateAction, useEffect, useState } from "react";
import Icon, { ICONS } from "../icon";
import Button from "../button";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { translate } from "@/app/_lib/utils";
import { getRemainingQuota, PretixItemQuota, RoomBuyApiData, RoomStoreBuyAction, RoomStoreItemsApiAction, RoomStoreItemsApiResponse, RoomTypeInfo } from "@/app/_lib/api/flows/roomOrderFlow";
import { ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import ModalError from "../modalError";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import NoticeBox, { NoticeTheme } from "../noticeBox";
import { EVENT_CURRENCY } from "@/app/_lib/constants";
import Checkbox from "../checkbox";
import { useUser } from "@/app/_lib/context/userProvider";
import { ShopLinkResponse } from "@/app/_lib/api/booking";

enum STEPS {
    START,
    REVIEW
}

export default function RoomOrderFlow ({style, className, isOpen, modalLoading, setModalLoading, close}: Readonly<{
    style?: CSSProperties,
    className?: string,
    isOpen: boolean,
    modalLoading: boolean,
    setModalLoading: Dispatch<SetStateAction<boolean>>,
    close: Function
  }>) {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const locale = useLocale();
    const formatter = useFormatter();
    const {showModal, hideModal} = useModalUpdate();
    const {userDisplay, userLoading} = useUser();

    /* Data about rooms availability */
    const [roomsData, setRoomsData] = useState<RoomStoreItemsApiResponse | null>();

    /* Flow step */
    const [step, setStep] = useState<STEPS>(STEPS.START);

    /* Selected room type */
    const [selectedType, setSelectedType] = useState<RoomTypeInfo>();

    /* Order disclaimer */
    const [warningAccepted, setWarningAccepted] = useState(false);

    /* Latest error */
    const [latestError, setLatestError ] = useState<ApiErrorResponse>();

    /* Rooms data refresh */
    useEffect(()=>{
        if (roomsData || !isOpen) return;
        setSelectedType(undefined);
        setModalLoading(true);
        runRequest(new RoomStoreItemsApiAction(), undefined, undefined, undefined)
        .then(data=>setRoomsData(data as RoomStoreItemsApiResponse))
        .catch((err)=>{
            showModal(
                tcommon("error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="room.errors"></ModalError>,
                ICONS.ERROR
            );
            setRoomsData(undefined);
        }).finally(()=>setModalLoading(false));
    }, [roomsData, isOpen]);

    /* Reset upon closure */
    useEffect(()=>{
        if (!isOpen) {
            setStep(STEPS.START);
            setSelectedType(undefined);
            setWarningAccepted(false);
        }
    }, [isOpen]);

    const selectRoomType = (type: RoomTypeInfo) => {
        if (getRemainingQuota(type.quotaAvailability) > 0)
        setSelectedType(type);
    }

    const changeOrder = () => {
        if (!selectedType || userLoading || !userDisplay?.display) return;
        setModalLoading(true);

        const roomBuyData: RoomBuyApiData = {
            userId: userDisplay.display?.userId,
            roomPretixItemId: selectedType.data.roomPretixItemId
        }

        runRequest(new RoomStoreBuyAction(), undefined, roomBuyData, undefined)
        .then((result)=>{window.open((result as ShopLinkResponse).link); close();})
        .catch((err)=>setLatestError(err))
        .finally(()=>{setModalLoading(false);});
    }

    switch(step) {
        case STEPS.START:
            return <>
            <div className="horizontal-list flex-vertical-center">
                <span className="title">{t("room.order_flow.select_type")}</span>
                <div className="spacer"></div>
                <Button iconName={ICONS.REFRESH} onClick={()=>setRoomsData(null)} debounce={3000}>{tcommon("reload")}</Button>
            </div>
            
            <div className="vertical-list gap-4mm room-container">
                <NoticeBox theme={NoticeTheme.Warning} title={t("room.order_flow.messages.quota_warning.title")}>
                    {t("room.order_flow.messages.quota_warning.description")}
                </NoticeBox>
                {modalLoading && <span><Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}</span>}
                {/* Room type selection */}
                {roomsData?.rooms?.map((roomInfo, index)=>
                    <a className={`room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m ${selectedType?.data.roomPretixItemId === roomInfo.data.roomPretixItemId ? "selected" : ""}`} 
                    key={index} onClick={()=>selectRoomType(roomInfo)}>
                        {selectedType?.data.roomPretixItemId === roomInfo.data.roomPretixItemId && 
                        <Icon className="large" iconName={ICONS.CHECK_CIRCLE}></Icon>}
                        <div className="vertical-list">
                            <span className="title">{translate(roomInfo.data.roomTypeNames, locale)}</span>
                            <span>{formatter.number(parseFloat(roomInfo.price)-parseFloat(roomsData.priceOfCurrentRoom ?? "0"), {style: 'currency', currency: EVENT_CURRENCY})}</span>
                            <span className="descriptive color-subtitle">{t("room.order_flow.quota_left", {size: getRemainingQuota(roomInfo.quotaAvailability)})}</span>
                        </div>
                    </a>
                )}
            </div>
            <div className="horizontal-list gap-4mm">
                <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>close()}>{tcommon("cancel")}</Button>
                <div className="spacer"></div>
                <Button iconName={ICONS.ARROW_FORWARD} disabled={!selectedType} busy={modalLoading} onClick={()=>setStep(step+1)}>{tcommon("next")}</Button>
            </div>
            </>;
        case STEPS.REVIEW:
            return <>
            {latestError && <ModalError error={latestError} translationRoot="furpanel" translationKey="room.errors"></ModalError>}
            <span>{t("room.order_flow.your_selection")}</span>
            <div className="room-container">
                {selectedType && <a className={"room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m selected"}>
                    <div className="vertical-list">
                        <span className="title">{translate(selectedType.data.roomTypeNames, locale)}</span>
                        <span>{formatter.number(parseFloat(selectedType.price)-parseFloat(roomsData?.priceOfCurrentRoom ?? "0"), {style: 'currency', currency: EVENT_CURRENCY})}</span>
                        <span className="descriptive color-subtitle">{t("room.order_flow.quota_left", {size: getRemainingQuota(selectedType.quotaAvailability)})}</span>
                    </div>
                </a>}
            </div>

            <div className="vertical-list gap-4mm">
                <NoticeBox theme={NoticeTheme.Warning} title={t("room.order_flow.messages.order_notice.title")}>
                    <Checkbox onClick={(e, c)=>setWarningAccepted(c)}>
                        {t("room.order_flow.messages.order_notice.description")}
                    </Checkbox>
                </NoticeBox>
                <div className="horizontal-list gap-4mm">
                    <Button className="danger" iconName={ICONS.ARROW_BACK} busy={modalLoading} onClick={()=>{setStep(step-1); setLatestError(undefined);}}>
                        {tcommon("back")}
                    </Button>
                    <div className="spacer"></div>
                    <Button iconName={ICONS.SHOPPING_CART_CHECKOUT} disabled={!selectedType || !warningAccepted} busy={modalLoading} onClick={changeOrder}>
                        {t("room.order_flow.complete_order")}
                    </Button>
                </div>
            </div>
            </>;
    }
}