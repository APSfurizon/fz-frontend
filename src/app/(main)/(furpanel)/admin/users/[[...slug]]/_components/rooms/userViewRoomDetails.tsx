import StatusBox from "@/components/statusBox";
import UserPicture from "@/components/userPicture";
import { OrderStatus } from "@/lib/api/order";
import { RoomInfoResponse } from "@/lib/api/room";
import { useTranslations } from "next-intl";

export default function UserViewRoomDetails ({
    data
}: Readonly<{
    data: RoomInfoResponse
}>) {
    const t = useTranslations();
    return <div className="horizontal-list gap-4mm  flex-center flex-space-evenly" style={{flex: "1"}}>
        {data.currentRoomInfo.guests.map((guest, gi) => <div key={gi}
            className="vertical-list">
                <UserPicture size={64} userData={guest.user} showNickname showFlag/>
                {data.currentRoomInfo.roomOwner.userId === guest.user.userId &&
                    <StatusBox>{t("furpanel.room.status_owner")}</StatusBox>}
                {[OrderStatus.CANCELED, OrderStatus.EXPIRED, OrderStatus.PENDING].includes(guest.orderStatus) &&
                    <StatusBox status="warning">{t(`common.order_status.${guest.orderStatus}`)}</StatusBox>
                }
                {guest.roomGuest.confirmed === false &&
                    <StatusBox status="warning">{t("furpanel.room.status_invited")}</StatusBox>
                }
            </div>)}
    </div>
}