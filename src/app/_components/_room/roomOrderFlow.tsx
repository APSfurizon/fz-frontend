import { CSSProperties, Dispatch, SetStateAction, useEffect, useState } from "react";
import Icon, { ICONS } from "../icon";
import Button from "../button";
import { useLocale, useTranslations } from "next-intl";
import { translate } from "@/app/_lib/utils";
import { getRemainingQuota, RoomStoreItemsApiAction, RoomStoreItemsApiResponse, RoomTypeInfo } from "@/app/_lib/api/flows/roomOrderFlow";
import { runRequest } from "@/app/_lib/api/global";
import ModalError from "../modalError";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";

enum STEPS {
    START,
    REVIEW
}

export default function RoomOrderFlow ({style, className, modalLoading, setModalLoading, close}: Readonly<{
    style?: CSSProperties,
    className?: string,
    modalLoading: boolean,
    setModalLoading: Dispatch<SetStateAction<boolean>>,
    close: Function
  }>) {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const locale = useLocale();
    const {showModal, hideModal} = useModalUpdate();

    /* Data about rooms availability */
    const [roomsData, setRoomsData] = useState<RoomStoreItemsApiResponse>();

    /* Flow step */
    const [step, setStep] = useState<STEPS>(STEPS.START);

    /* Selected room type */
    const [selectedType, setSelectedType] = useState<RoomTypeInfo>();

    /* Rooms data refresh */
    useEffect(()=>{
        if (roomsData) return;
        setModalLoading(true);
        runRequest(new RoomStoreItemsApiAction(), undefined, undefined, undefined)
        .then(data=>setRoomsData(data as RoomStoreItemsApiResponse))
        .catch((err)=>showModal(
            tcommon("error"),
            <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>,
            ICONS.ERROR
        )).finally(()=>setModalLoading(false));
    }, [roomsData]);

    return <>
        {step === STEPS.START && <>
            <div className="horizontal-list flex-vertical-center">
                <span className="title">Select a room type:</span>
                <div className="spacer"></div>
                <Button iconName={ICONS.REFRESH} onClick={()=>setRoomsData(undefined)} debounce={3000}>{tcommon("reload")}</Button>
            </div>
            
            <div className="horizontal-list gap-4mm room-container">
                {modalLoading && <span><Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}</span>}
                {/* Room type selection */}
                {roomsData?.rooms?.map((roomInfo, index)=>
                    <a className="room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m" key={index} onClick={()=>setSelectedType(roomInfo)}>
                        {selectedType?.data.roomPretixItemId === roomInfo.data.roomPretixItemId && 
                        <Icon className="" iconName={ICONS.CHECK_CIRCLE}></Icon>}
                        <div className="vertical-list">
                            <span>{translate(roomInfo.data.roomTypeNames, locale)}</span>
                            <span className="descriptive color-subtitle">{t("room.order_flow.quota_left", {size: getRemainingQuota(roomInfo.quotaAvailability)})}</span>
                        </div>
                    </a>
                )}
            </div>
            <div className="horizontal-list gap-4mm">
                <span>{selectedType?.data.roomPretixItemId}</span>
                <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>close()}>{tcommon("cancel")}</Button>
                <div className="spacer"></div>
                <Button iconName={ICONS.ARROW_FORWARD} disabled={!selectedType} busy={modalLoading}>{tcommon("next")}</Button>
            </div>
        </> }
    </>
}