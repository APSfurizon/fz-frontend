import { CSSProperties } from "react";
import Icon, { ICONS } from "../icon";
import Button from "../button";
import UserPicture from "../userPicture";
import { RoomInviteData } from "@/app/_lib/api/room";
import { useTranslations } from "next-intl";
import StatusBox from "../statusBox";

export default function RoomInvite ({style, className, busy, onAccept, disabled, inviteData}: Readonly<{
    style?: CSSProperties,
    className?: string,
    busy?: boolean,
    onAccept?: ()=>void,
    disabled?: boolean,
    inviteData: RoomInviteData,
  }>) {
    const t = useTranslations("furpanel");
    return <>
        <div>
            <span className="invite-title">
                <UserPicture userData={inviteData.recipient}></UserPicture>
                {t("room.invite.title", {nickname: inviteData.recipient.nickname, roomName: inviteData.room.roomName})}
            </span>
            <div className="room-guests horizontal-list gap-4mm">
                <div className="user-container">
                    <UserPicture userData={inviteData.room.owner} showNickname={true}></UserPicture>
                    <StatusBox>{t("room.status_owner")}</StatusBox>
                </div>
                {inviteData.room.guests.map ((usr, key) => <UserPicture key={key} userData={usr} showNickname={true}></UserPicture>)}
            </div>
        </div>
    </>
}