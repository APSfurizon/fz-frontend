import Button from "@/components/input/button";
import Modal from "@/components/modal";
import { EMPTY_ROOM_INFO, RoomDeleteAction, RoomEditData, RoomInfoResponse } from "@/lib/api/room";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useUserViewContext } from "../../page";
import { runRequest } from "@/lib/api/global";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";

export default function DeleteRoomModal({
    open,
    onClose,
    roomInfo = EMPTY_ROOM_INFO
}: Readonly<{
    open: boolean
    onClose: () => void,
    roomInfo?: RoomInfoResponse
}>) {
    const t = useTranslations();
    const { showModal } = useModalUpdate();
    const { reloadAll } = useUserViewContext();

    const [loading, setLoading] = useState(false);

    const onSuccess = () => {
        onClose();
        reloadAll();
    }

    const deleteRoom = (roomId: number) => {
        const roomData: RoomEditData = {
            roomId: roomId
        };
        setLoading(true);
        runRequest({
            action: new RoomDeleteAction(),
            body: roomData
        }).then(() => onSuccess())
            .catch(e => showModal(t("common.error"), <ErrorMessage error={e} />))
            .finally(() => {
                setLoading(false);
            });
    }

    return <Modal open={open}
        onClose={onClose}
        title={t("furpanel.admin.users.accounts.view.rooms_table.actions.delete.title")}
        icon="DELETE"
        busy={loading}>
        <p>
            {t("furpanel.admin.users.accounts.view.rooms_table.actions.delete.description", {
                roomName: roomInfo.currentRoomInfo.roomName
            })}
        </p>
        <div className="horizontal-list gap-4mm">
            <Button icon="CANCEL"
                onClick={onClose}
                busy={loading}>
                {t("common.cancel")}
            </Button>
            <div className="spacer"></div>
            <Button className="danger"
                icon="DELETE"
                onClick={() => deleteRoom(roomInfo.currentRoomInfo.roomId)}
                busy={loading}>
                {t("furpanel.admin.users.accounts.view.rooms_table.actions.delete.title")}
            </Button>
        </div>
    </Modal>
}