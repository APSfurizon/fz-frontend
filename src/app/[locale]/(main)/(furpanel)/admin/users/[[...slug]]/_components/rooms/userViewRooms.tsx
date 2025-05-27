import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { RoomInfoResponse } from "@/lib/api/room";
import { CellContext, createColumnHelper, Row } from "@tanstack/react-table";
import UserViewRoomDetails from "./userViewRoomDetails";
import { useMemo, useState } from "react";
import { ConventionEvent } from "@/lib/api/counts";
import { useLocale, useTranslations } from "next-intl";
import { translate } from "@/lib/translations";
import FpTable from "@/components/table/fpTable";
import Button from "@/components/input/button";
import { ICONS } from "@/components/icon";
import RemoveGuestModal from "./removeGuestModal";

const roomInfo = (obj: CellContext<RoomInfoResponse, unknown>) => obj.row.original.currentRoomInfo;

export default function UserViewRooms ({
    userData,
    reloadData
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: () => void
}>) {
    const t = useTranslations();
    const locale = useLocale();

    const events = useMemo(()=> {
        const eventRecord: Record<number, ConventionEvent> = {};
        userData.orders.map(o=>o.orderEvent).forEach(event => eventRecord[event.id] = event);
        return eventRecord
    }, [userData]);

    const roomRows = useMemo(()=> {
        const rooms = [...(userData.otherRooms || [])];
        if (userData.currentRoomdata) rooms.push (userData.currentRoomdata);
        return rooms.filter(rd => !!rd && rd.currentRoomInfo?.roomData.roomCapacity > 0)
        }, [userData.otherRooms, userData.currentRoomdata]);

    const getDetails = (row: Row<RoomInfoResponse>) => <UserViewRoomDetails data={row.original}/>
    
    const eventSort = (rowA: Row<RoomInfoResponse>, rowB: Row<RoomInfoResponse>): number => {
        const eventA = new Date(events[rowA.original.currentRoomInfo.eventId].dateFrom);
        const eventB = new Date(events[rowB.original.currentRoomInfo.eventId].dateFrom);
        if (eventA.getTime() == eventB.getTime()) return 0
        else return eventA.getTime() - eventB.getTime();
    }

    const getRoomType = (row: RoomInfoResponse) => {
        const info = row.currentRoomInfo;
        if (info.roomData.roomCapacity > 0) {
            return `${translate(info.roomData.roomTypeNames, locale)} ` +
                `(${info.roomData.roomCapacity})`;
        } else {
            return ""
        }
    }

    const roomColHelper = createColumnHelper<RoomInfoResponse>();
    const [roomColumns] = useState([
        roomColHelper.accessor(itm => translate(
            events[itm.currentRoomInfo.eventId].eventNames, locale), {
                id: "eventName",
                header: t("furpanel.admin.users.accounts.view.rooms_table.event_name"),
                sortingFn: eventSort
            }),
        roomColHelper.accessor("currentRoomInfo.roomName", {
            id: "roomName",
            header: t("furpanel.admin.users.accounts.view.rooms_table.room_name"),
        }),
        roomColHelper.accessor(itm => getRoomType(itm), {
            id: "roomType",
            header: t("furpanel.admin.users.accounts.view.orders_table.room_type"),
        }),
        roomColHelper.display({
            id: "actions",
            header: "",
            maxSize: 90,
            enableResizing: false,
            cell: props => 
                !events[props.row.original.currentRoomInfo.eventId].current
                ? undefined
                : <div className="horizontal-list gap-2mm">
                    <Button iconName={ICONS.PERSON_ADD}
                        title={t("furpanel.admin.users.accounts.view.rooms_table.actions.add_guest.title")}
                        disabled={roomInfo(props).guests.length >= roomInfo(props).roomData.roomCapacity}/>
                    <Button iconName={ICONS.PERSON_REMOVE}
                        className="danger"
                        title={t("furpanel.admin.users.accounts.view.rooms_table.actions.remove_guest.title")}
                        onClick={() => promptRemGuest(props.row.original)}
                        disabled={roomInfo(props).guests.length == 0}/>
                </div>
        })
    ]);

    // Guest removal logic
    const [remGuestModalOpen, setRemGuestModalOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState<RoomInfoResponse>();

    const promptRemGuest = (row: RoomInfoResponse) => {
        setCurrentRow(row);
        setRemGuestModalOpen(true);
    }

    const closeRemGuestModal = () => {
        setCurrentRow(undefined);
        setRemGuestModalOpen(false);
    }

    return <>
        <FpTable<RoomInfoResponse> rows={roomRows} columns={roomColumns}
            hasDetails={() => true} getDetails={getDetails} pinnedColumns={{right: ["actions"]}}/>
        <RemoveGuestModal roomInfo={currentRow} open={remGuestModalOpen} onClose={closeRemGuestModal}
            reloadData={reloadData}/>
    </>
} 