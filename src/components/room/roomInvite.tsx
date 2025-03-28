import { CSSProperties } from "react";
import Icon, { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import UserPicture from "@/components/userPicture";
import { useLocale, useTranslations } from "next-intl";
import StatusBox from "@/components/statusBox";
import { translate } from "@/lib/utils";
import { RoomInvitation } from "@/lib/api/room";

export default function RoomInvite ({style, className, busy, onAccept, onReject, disabled, inviteData}: Readonly<{
    style?: CSSProperties,
    className?: string,
    busy?: boolean,
    disabled?: boolean,
    inviteData: RoomInvitation,
    onAccept: (invite: RoomInvitation) => void,
    onReject: (invite: RoomInvitation) => void,
  }>) {
    const t = useTranslations("furpanel");
    const locale = useLocale();
    return <>
        <div className="room-invite vertical-list gap-4mm rounded-s">
            <span className="invite-title semibold title small horizontal-list flex-vertical-center gap-2mm">
                <UserPicture size={24} userData={inviteData.room.roomOwner} hideEffect={true}></UserPicture>
                {t.rich("room.invite.title", 
                    {
                        nickname: inviteData.room.roomOwner.fursonaName,
                        roomName: inviteData.room.roomName,
                        room: (chunks) => <b className="highlight">{chunks}</b>
                    },)
                }
            </span>
            <div className="room-guests horizontal-list gap-4mm flex-center flex-space-evenly">
                {inviteData.room.guests.filter(usr => usr.roomGuest.confirmed)
                .map ((usr, key) => <div key={key} className="guest-container vertical-list gap-2mm">
                    <UserPicture key={key} size={64} userData={usr.user} showNickname showFlag></UserPicture>
                    {inviteData.room.roomOwner.userId === usr.user.userId && <StatusBox>{t("room.status_owner")}</StatusBox>}
                </div>)}
            </div>
            <div className="invite-toolbar horizontal-list gap-4mm">
                <StatusBox>{translate(inviteData.room.roomData.roomTypeNames, locale)}</StatusBox>
                <div className="spacer"></div>
                <div className="horizontal-list gap-4mm">
                    <Button busy={busy} className="danger" iconName={ICONS.DO_NOT_DISTURB_ON} onClick={()=>onReject(inviteData)}>{t("room.actions.refuse")}</Button>
                    <Button busy={busy} className="success" iconName={ICONS.PERSON_ADD} onClick={()=>onAccept(inviteData)}>{t("room.actions.accept")}</Button>
                </div>
            </div>
        </div>
    </>
}