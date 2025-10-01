import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import ModalError from "@/components/modalError";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
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
                showModal(t("common.error"), <ModalError error={err} />, "ERROR");
                setRoomsData(undefined);
            }).finally(() => setModalLoading(false));
    }, [roomsData, isOpen]);

    return <>
        <div className="horizontal-list gap-4mm flex-vertical-center">
            <NoticeBox theme={NoticeTheme.FAQ}>
                {t("furpanel.room.quota_viewer.description")}
            </NoticeBox>
            <div className="spacer"></div>
            <div>
                <Button iconName={"REFRESH"}
                    onClick={() => setRoomsData(null)}
                    debounce={3000}
                    busy={modalLoading}>
                    {t("common.reload")}
                </Button>
            </div>

        </div>
        <div style={{ paddingLeft: '1em' }}>
            <ul className="vertical-list gap-4mm">
                {roomsData?.rooms?.map((roomInfo, index) =>
                    <li key={index}>
                        <a className="room-type-container horizontal-list gap-2mm flex-vertical-center rounded-m">
                            <div className="vertical-list">
                                <span className="title">{translate(roomInfo.data.roomTypeNames, locale)}</span>
                                <span className="descriptive color-subtitle">
                                    {t("furpanel.room.order_flow.quota_left", { size: getRemainingRoomType(roomInfo) })}
                                </span>
                            </div>
                        </a>
                    </li>
                )}
            </ul>
        </div>
    </>
}