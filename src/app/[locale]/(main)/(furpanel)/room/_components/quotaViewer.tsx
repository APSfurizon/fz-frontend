import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import ModalError from "@/components/modalError";
import { getRemainingRoomType, RoomStoreItemsApiAction, RoomStoreItemsApiResponse } from "@/lib/api/flows/roomOrderFlow";
import { runRequest } from "@/lib/api/global";
import { translate } from "@/lib/translations";
import { useLocale, useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function QuotaViewer({ isOpen, modalLoading, setModalLoading, close }: Readonly<{
    isOpen: boolean,
    modalLoading: boolean,
    setModalLoading: Dispatch<SetStateAction<boolean>>,
    close: () => void
}>) {

    const t = useTranslations();
    const locale = useLocale();
    const { showModal } = useModalUpdate();

    /* Data about rooms availability */
    const [roomsData, setRoomsData] = useState<RoomStoreItemsApiResponse | null>();

    /* Rooms data refresh */
    useEffect(() => {
        if (roomsData || !isOpen) return;
        setModalLoading(true);
        runRequest(new RoomStoreItemsApiAction(), undefined, undefined, undefined)
            .then(data => setRoomsData(data))
            .catch((err) => {
                showModal(
                    t("common.error"),
                    <ModalError error={err} translationRoot="furpanel" translationKey="room.errors"></ModalError>,
                    "ERROR"
                );
                setRoomsData(undefined);
            }).finally(() => setModalLoading(false));
    }, [roomsData, isOpen]);

    return <>
        <div className="horizontal-list flex-vertical-center">
            <span className="title">{t("furpanel.room.quota_viewer.available_types")}</span>
            <div className="spacer"></div>
            <Button iconName={"REFRESH"}
                onClick={() => setRoomsData(null)}
                debounce={3000}>
                {t("common.reload")}
            </Button>
        </div>
        <div className="vertical-list gap-4mm">
            {roomsData?.rooms?.map((roomInfo, index) =>
                <a className="room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m"
                    key={index}>
                    <div className="vertical-list">
                        <span className="title">{translate(roomInfo.data.roomTypeNames, locale)}</span>
                        <span className="descriptive color-subtitle">
                            {t("furpanel.room.order_flow.quota_left", { size: getRemainingRoomType(roomInfo) })}
                        </span>
                    </div>
                </a>
            )}
        </div>
    </>
}