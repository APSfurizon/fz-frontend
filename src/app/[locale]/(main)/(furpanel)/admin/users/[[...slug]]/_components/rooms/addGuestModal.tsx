import { ICONS } from "@/components/icon";
import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import Modal from "@/components/modal";
import { AutoInputCustomUserManager } from "@/lib/api/admin/userView";
import { EMPTY_ROOM_INFO, RoomInfoResponse, RoomKickFormAction } from "@/lib/api/room";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

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

    const manager = useMemo (() => new AutoInputCustomUserManager(
        roomInfo.currentRoomInfo.guests
        .filter (guest => guest.user.userId !== roomInfo.currentRoomInfo.roomOwner.userId)
        .map(guest => guest.user)), [roomInfo]);

    const editFormData = (data: FormData): FormData => {
        const userId = parseInt(data.get("userId")?.toString() ?? "0");
        const guestId = roomInfo.currentRoomInfo.guests.find(guest => guest.user.userId === userId)?.roomGuest.guestId;
        const toReturn = new FormData();
        toReturn.set("guestId", String(guestId));
        return toReturn;
    }

    const onSuccess = () => {
        onClose();
        reloadData();
    }

    return <Modal open={open}
        onClose={onClose}
        title={t("furpanel.admin.users.accounts.view.rooms_table.actions.remove_guest.title")}
        icon={ICONS.PERSON_REMOVE}
        busy={loading}>
            <DataForm action={new RoomKickFormAction}
                resetOnSuccess
                resetOnFail
                setLoading={setLoading}
                loading={loading}
                editFormData={editFormData}
                onSuccess={onSuccess}
                hideSave>
                <AutoInput fieldName="userId"
                    manager={manager}
                    label={t("furpanel.admin.users.accounts.view.rooms_table.actions.remove_guest.select_guest.label")}
                    minDecodeSize={0}/>
                <div className="horizontal-list gap-4mm">
                    <Button iconName={ICONS.CANCEL} busy={loading} onClick={onClose}>{t("common.cancel")}</Button>
                    <div className="spacer"></div>
                    <Button className="danger" type="submit" iconName={ICONS.CHECK} busy={loading}>
                        {t("furpanel.room.actions.kick")}
                    </Button>
                </div>
            </DataForm>
        </Modal>
}