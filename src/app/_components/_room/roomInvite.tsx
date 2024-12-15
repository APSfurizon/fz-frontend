import { CSSProperties } from "react";
import Icon, { ICONS } from "../icon";
import Button from "../button";
import UserPicture from "../userPicture";
import { RoomInviteData } from "@/app/_lib/api/room";
import { useLocale, useTranslations } from "next-intl";
import StatusBox from "../statusBox";
import { translate } from "@/app/_lib/utils";

export default function RoomInvite ({style, className, busy, onAccept, onReject, disabled, inviteData}: Readonly<{
    style?: CSSProperties,
    className?: string,
    busy?: boolean,
    disabled?: boolean,
    inviteData: RoomInviteData,
    onAccept: (id: number) => void,
    onReject: (id: number) => void,
  }>) {
    const t = useTranslations("furpanel");
    const locale = useLocale();
    return <>
        <div className="room-invite vertical-list gap-4mm rounded-s">
            <span className="invite-title semibold title small horizontal-list flex-vertical-center gap-2mm">
                <UserPicture size={24} userData={inviteData.sender} hideEffect={true}></UserPicture>
                {t.rich("room.invite.title", 
                    {
                        nickname: inviteData.sender.nickname,
                        roomName: inviteData.room.roomName,
                        room: (chunks) => <b className="highlight">{chunks}</b>
                    },)
                }
            </span>
            <div className="room-guests horizontal-list gap-4mm flex-center flex-space-evenly">
                <div className="room-owner-container">
                    <UserPicture userData={inviteData.room.owner} size={64} showNickname showFlag></UserPicture>
                    <StatusBox>{t("room.status_owner")}</StatusBox>
                </div>
                {inviteData.room.guests.map ((usr, key) => <UserPicture key={key} size={64} userData={usr} showNickname showFlag></UserPicture>)}
            </div>
            <div className="invite-toolbar horizontal-list gap-4mm">
                <StatusBox>{translate(inviteData.room.roomTypeNames, locale)}</StatusBox>
                <div className="spacer"></div>
                <Button busy={busy} className="danger" iconName={ICONS.DO_NOT_DISTURB_ON} onClick={()=>onReject(inviteData.id)}>{t("room.actions.refuse")}</Button>
                <Button busy={busy} className="success" iconName={ICONS.PERSON_ADD} onClick={()=>onAccept(inviteData.id)}>{t("room.actions.accept")}</Button>
            </div>
        </div>
    </>
}