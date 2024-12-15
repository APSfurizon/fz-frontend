'use client'
import { runRequest } from "@/app/_lib/api/global";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useFormatter, useTranslations } from "next-intl";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import "../../../../styles/furpanel/room.css";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Modal from "@/app/_components/modal";
import { getRoom, getRoomInvites } from "@/app/_lib/debug";
import RoomInvite from "@/app/_components/_room/roomInvite";
import { RoomInviteFetchResponse, UserRoom } from "@/app/_lib/api/room";

export default function RoomPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const formatter = useFormatter();  
  const [loading, setLoading] = useState(false);
  const [showInviteTutorial, setShowInviteTutorial] = useState(false);
  const {showModal} = useModalUpdate();
  useTitle(t("room.title"));

  // Room related states
  /* Room invites */
  const [invites, setInvites] = useState<RoomInviteFetchResponse> ();
  /* Room data */
  const [room, setRoom] = useState<UserRoom> ();

  const acceptInvite = (id: number) => {
    setLoading(true);
  }

  const refuseInvite = (id: number) => {
    setLoading(true);
  }

  useEffect(()=> {
    setLoading(true);
    setInvites(getRoomInvites());
    setRoom(getRoom());
    setLoading(false);
  }, [])

  /*useEffect(()=>{
    setLoading(true);
    runRequest(new BookingOrderApiAction())
    .then((result)=>setBookingData(result as BookingOrderResponse))
    .catch((err)=>showModal(
        tcommon("error"), 
        <span className='error'>{getErrorBody(err) ?? tcommon("unknown_error")}</span>
    )).finally(()=>setLoading(false));
  }, []);*/

  return <>
    <div className="page">
      <span className="title medium">{t("room.your_room")}</span>
      <NoticeBox theme={NoticeTheme.Warning} 
      title={t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.title`)}>
        {t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.description`, {lockDate: formatter.dateTime(new Date(), {dateStyle: "medium"})})}
      </NoticeBox>
      {/* TODO: View when user has no room */}
      <div className="actions-panel rounded-m">
        <span className="title small horizontal-list gap-2mm flex-vertical-center">
          <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
          {t("room.no_room")}
        </span>
        <div className="horizontal-list flex-center flex-vertical-center gap-4mm" style={{marginTop: "1em"}}>
          <Button iconName={ICONS.SHOPPING_CART}>{t("room.actions.buy_a_room")}</Button>
          <span className="title small">{t("room.or")}</span>
          <Button iconName={ICONS.PERSON_ADD} onClick={()=>setShowInviteTutorial(true)}>{t("room.actions.join_a_room")}</Button>
        </div>
      </div>
      {/* Invites */}
      <div className="actions-panel rounded-m vertical-list gap-2mm">
        <span className="title small horizontal-list gap-2mm flex-vertical-center">
          <Icon iconName={ICONS.MAIL}></Icon>
          {t("room.invite.header", {amount: 1})}
        </span>
        {
          invites?.roomInvites?.map((invite, index) => <RoomInvite key={index} inviteData={invite} busy={loading} onAccept={acceptInvite} onReject={refuseInvite}></RoomInvite>)
        }
      </div>
      {/* Your room */}
      <div className="actions-panel rounded-m vertical-list gap-2mm">
        <span className="title small horizontal-list gap-2mm flex-vertical-center">
          <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
          {room?.roomName}
          <div className="spacer"></div>
          <Button iconName={ICONS.EDIT_SQUARE}>{t("room.actions.rename")}</Button>
        </span>
      </div>
    </div>
    <Modal  open={showInviteTutorial} onClose={()=>setShowInviteTutorial(false)}>

    </Modal>
  </>;
}
