import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Icon from "@/components/icon";
import Button from "@/components/input/button";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { translate } from "@/lib/translations";
import {
    getRemainingRoomType, RoomBuyApiData, RoomStoreBuyAction, RoomStoreItemsApiAction,
    RoomStoreItemsApiResponse, RoomTypeInfo
} from "@/lib/api/flows/roomOrderFlow";
import { ApiErrorResponse, runRequest } from "@/lib/api/global";
import ModalError from "@/components/modalError";
import { useModalUpdate } from "@/components/context/modalProvider";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { EVENT_CURRENCY } from "@/lib/constants";
import Checkbox from "@/components/input/checkbox";
import { useUser } from "@/components/context/userProvider";
import { useRouter } from "next/navigation";
import LoadingPanel from "../loadingPanel";

enum STEPS {
    START,
    REVIEW
}

export default function RoomOrderFlow({ isOpen, modalLoading, setModalLoading, close }: Readonly<{
    isOpen: boolean,
    modalLoading: boolean,
    setModalLoading: Dispatch<SetStateAction<boolean>>,
    close: () => void
}>) {
    const t = useTranslations();
    const locale = useLocale();
    const formatter = useFormatter();
    const { showModal } = useModalUpdate();
    const { userDisplay, userLoading } = useUser();
    const router = useRouter();

    /* Data about rooms availability */
    const [roomsData, setRoomsData] = useState<RoomStoreItemsApiResponse | null>();

    /* Flow step */
    const [step, setStep] = useState<STEPS>(STEPS.START);

    /* Selected room type */
    const [selectedType, setSelectedType] = useState<RoomTypeInfo>();

    /* Order disclaimer */
    const [warningAccepted, setWarningAccepted] = useState(false);

    /* Latest error */
    const [latestError, setLatestError] = useState<ApiErrorResponse>();

    /* Rooms data refresh */
    useEffect(() => {
        if (roomsData || !isOpen) return;
        setSelectedType(undefined);
        setModalLoading(true);
        runRequest(new RoomStoreItemsApiAction(), undefined, undefined, undefined)
            .then(data => setRoomsData(data))
            .catch((err) => {
                showModal(t("common.error"), <ModalError error={err} />, "ERROR");
                setRoomsData(undefined);
            }).finally(() => setModalLoading(false));
    }, [roomsData, isOpen]);

    /* Reset upon closure */
    useEffect(() => {
        if (!isOpen) {
            setStep(STEPS.START);
            setSelectedType(undefined);
            setWarningAccepted(false);
        }
    }, [isOpen]);

    const selectRoomType = (type: RoomTypeInfo) => {
        if (getRemainingRoomType(type) > 0)
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
            .then((result) => {
                router.push(result.link);
                close();
            }).catch((err) => setLatestError(err))
            .finally(() => { setModalLoading(false); });
    }

    switch (step) {
        case STEPS.START:
            return <>
                <div className="horizontal-list flex-vertical-center">
                    <span className="title">{t("furpanel.room.order_flow.select_type")}</span>
                    <div className="spacer"></div>
                    <Button iconName={"REFRESH"}
                        onClick={() => setRoomsData(null)}
                        debounce={3000}>
                        {t("common.reload")}
                    </Button>
                </div>

                <div className="vertical-list gap-4mm room-container">
                    <NoticeBox theme={NoticeTheme.Warning}
                        title={t("furpanel.room.order_flow.messages.quota_warning.title")}>
                        {t("furpanel.room.order_flow.messages.quota_warning.description")}
                    </NoticeBox>
                    {modalLoading && <LoadingPanel />}
                    {/* Room type selection */}
                    {roomsData?.rooms?.map((roomInfo, index) =>
                        <a className={`room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m ${selectedType?.data.roomPretixItemId === roomInfo.data.roomPretixItemId ? "selected" : ""}`}
                            key={index} onClick={() => selectRoomType(roomInfo)}>
                            {selectedType?.data.roomPretixItemId === roomInfo.data.roomPretixItemId &&
                                <Icon className="large" icon={"CHECK_CIRCLE"}></Icon>}
                            <div className="vertical-list">
                                <span className="title">{translate(roomInfo.data.roomTypeNames, locale)}</span>
                                <span>
                                    {formatter.number(
                                        parseFloat(roomInfo.price) - parseFloat(roomsData.priceOfCurrentRoom ?? "0"),
                                        { style: 'currency', currency: EVENT_CURRENCY })}
                                </span>
                                <span className="descriptive color-subtitle">
                                    {t("furpanel.room.order_flow.quota_left", { size: getRemainingRoomType(roomInfo) })}
                                </span>
                            </div>
                        </a>
                    )}
                    {!roomsData?.rooms || roomsData?.rooms?.length == 0 && <span className="title">{t("furpanel.room.order_flow.no_room_type")}</span>}
                </div>
                <div className="horizontal-list gap-4mm">
                    <Button className="danger"
                        iconName={"CANCEL"}
                        busy={modalLoading}
                        onClick={() => close()}>
                        {t("common.cancel")}
                    </Button>
                    <div className="spacer" />
                    <Button iconName={"ARROW_FORWARD"}
                        disabled={!selectedType}
                        busy={modalLoading}
                        onClick={() => setStep(step + 1)}>
                        {t("common.next")}
                    </Button>
                </div>
            </>;
        case STEPS.REVIEW:
            return <>
                {latestError && <ModalError error={latestError} />}
                <span>{t("furpanel.room.order_flow.your_selection")}</span>
                <div className="room-container">
                    {selectedType && <a className={"room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m selected"}>
                        <div className="vertical-list">
                            <span className="title">{translate(selectedType.data.roomTypeNames, locale)}</span>
                            <span>{formatter.number(parseFloat(selectedType.price) - parseFloat(roomsData?.priceOfCurrentRoom ?? "0"), { style: 'currency', currency: EVENT_CURRENCY })}</span>
                            <span className="descriptive color-subtitle">{t("furpanel.room.order_flow.quota_left", { size: getRemainingRoomType(selectedType) })}</span>
                        </div>
                    </a>}
                </div>

                <div className="vertical-list gap-4mm">
                    <NoticeBox theme={NoticeTheme.Warning}
                        title={t("furpanel.room.order_flow.messages.order_notice.title")}>
                        <Checkbox onClick={(e, c) => setWarningAccepted(c)}>
                            {t("furpanel.room.order_flow.messages.order_notice.description")}
                        </Checkbox>
                    </NoticeBox>
                    <div className="horizontal-list gap-4mm">
                        <Button className="danger"
                            iconName={"ARROW_BACK"}
                            busy={modalLoading} onClick={() => {
                                setStep(step => step - 1);
                                setLatestError(undefined);
                            }}>
                            {t("common.back")}
                        </Button>
                        <div className="spacer"></div>
                        <Button iconName={"SHOPPING_CART_CHECKOUT"}
                            disabled={!selectedType || !warningAccepted}
                            busy={modalLoading} onClick={changeOrder}>
                            {t("furpanel.room.order_flow.complete_order")}
                        </Button>
                    </div>
                </div>
            </>;
    }
}