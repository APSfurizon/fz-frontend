import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import Modal from "@/components/modal";
import { EMPTY_ROOM_INFO, RoomInfoResponse, RoomInviteFormAction, RoomRenameFormAction } from "@/lib/api/room";
import { AutoInputRoomInviteManager } from "@/lib/api/user";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useUserViewContext } from "../../page";
import FpInput from "@/components/input/fpInput";

export default function RenameRoomModal({
    open,
    onClose,
    roomInfo = EMPTY_ROOM_INFO
}: Readonly<{
    open: boolean
    onClose: () => void,
    roomInfo?: RoomInfoResponse
}>) {
    const t = useTranslations();
    const {reloadAll} = useUserViewContext();

    const onSuccess = () => {
        onClose();
        reloadAll();
    }

    return <Modal open={open}
        onClose={onClose}
        title={t("furpanel.admin.users.accounts.view.rooms_table.actions.rename.title")}
        icon="EDIT" >
        <DataForm action={new RoomRenameFormAction}
            resetOnSuccess
            resetOnFail
            onSuccess={onSuccess}
            shouldReset={!open}
            hideSave>
            <input type="hidden" name="roomId" value={String(roomInfo.currentRoomInfo.roomId)} />
            <FpInput inputType="text"
                fieldName="name"
                required
                label={t("furpanel.room.input.rename_new_name.label")}
                placeholder={t("furpanel.room.input.rename_new_name.placeholder")}
                initialValue={roomInfo.currentRoomInfo.roomName}
                minLength={2}
                maxLength={254} />
            <div className="horizontal-list gap-4mm">
                <Button icon="CANCEL" onClick={onClose}>{t("common.cancel")}</Button>
                <div className="spacer"></div>
                <Button type="submit" icon="EDIT">
                    {t("furpanel.admin.users.accounts.view.rooms_table.actions.rename.title")}
                </Button>
            </div>
        </DataForm>
    </Modal>
}