import { ICONS } from "@/components/icon";
import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import Modal from "@/components/modal";
import { EMPTY_ROOM_INFO, RoomInfoResponse, RoomInviteFormAction } from "@/lib/api/room";
import { AutoInputRoomInviteManager } from "@/lib/api/user";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function AddGuestModal ({
    open,
    onClose,
    roomInfo = EMPTY_ROOM_INFO,
    reloadData
}: Readonly<{
    open: boolean
    onClose: () => void,
    roomInfo?: RoomInfoResponse,
    reloadData: ()=> void
}>) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);

    const onSuccess = () => {
        onClose();
        reloadData();
    }

    return <Modal open={open}
        onClose={onClose}
        title={t("furpanel.admin.users.accounts.view.rooms_table.actions.add_guest.title")}
        icon={ICONS.PERSON_ADD}
        busy={loading}>
            <DataForm action={new RoomInviteFormAction}
                resetOnSuccess
                resetOnFail
                setLoading={setLoading}
                loading={loading}
                onSuccess={onSuccess}
                hideSave>
                    <input type="hidden" name="roomId" value={String(roomInfo.currentRoomInfo.roomId)}/>
                    <AutoInput fieldName="invitedUsers"
                        manager={new AutoInputRoomInviteManager}
                        multiple
                        disabled={loading}
                        max={roomInfo.currentRoomInfo.roomData.roomCapacity - roomInfo.currentRoomInfo.guests.length}
                        label={t("furpanel.admin.users.accounts.view.rooms_table.actions.add_guest.select_guest.label")}/>
                    <input type="hidden" name="force" value="true"/>
                    <input type="hidden" name="forceExit" value="true"/>
                    <div className="horizontal-list gap-4mm">
                        <Button iconName={ICONS.CANCEL} busy={loading} onClick={onClose}>{t("common.cancel")}</Button>
                        <div className="spacer"></div>
                        <Button className="danger" type="submit" iconName={ICONS.CHECK} busy={loading}>
                            {t("furpanel.admin.users.accounts.view.rooms_table.actions.add_guest.title")}
                        </Button>
                    </div>
                </DataForm>
        </Modal>
}