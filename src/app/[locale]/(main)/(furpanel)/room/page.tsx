'use client'
import { runRequest } from "@/app/_lib/api/global";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import "../../../../styles/furpanel/room.css";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Modal from "@/app/_components/modal";
import RoomInvite from "@/app/_components/_room/roomInvite";
import { RoomInfoApiAction, RoomInfoResponse, RoomInvitation, RoomInviteFormAction, RoomRenameFormAction } from "@/app/_lib/api/room";
import UserPicture from "@/app/_components/userPicture";
import StatusBox from "@/app/_components/statusBox";
import { getErrorBody, translate } from "@/app/_lib/utils";
import DataForm from "@/app/_components/dataForm";
import JanInput from "@/app/_components/janInput";
import AutoInput from "@/app/_components/autoInput";
import { AutoInputDebugUserManager } from "@/app/_lib/components/autoInput";

export default function RoomPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const formatter = useFormatter();  
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [showInviteTutorial, setShowInviteTutorial] = useState(false);
  const {showModal, hideModal} = useModalUpdate();
  useTitle(t("room.title"));
  const locale = useLocale();

  // Room related states
  /* Room data */
  const [data, setData] = useState<RoomInfoResponse> ();

  /* Room invites logic */

  const acceptInvite = (invite: RoomInvitation) => {
    hideModal();

  }

  const promptAcceptInvite = (invite: RoomInvitation) => {
    const modalDescription = t.rich("room.messages.confirm_invite.description", {
      nickname: invite.room.roomOwner.fursonaName,
      roomName: invite.room.roomName,
      room: (chunks) => <b className="highlight">{chunks}</b>
    });

    const modalBody = <>
      <span className="descriptive small">{modalDescription}</span>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} onClick={()=>acceptInvite(invite)}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} onClick={()=>hideModal()}>{tcommon("cancel")}</Button>
      </div>
    </>

    showModal(t("room.messages.confirm_invite.title"), modalBody);
  }

  const refuseInvite = (invite: RoomInvitation) => {
    hideModal();
  }

  const promptRefuseInvite = (invite: RoomInvitation) => {
    const modalDescription = t.rich("room.messages.refuse_invite.description", {
      nickname: invite.room.roomOwner.fursonaName,
      roomName: invite.room.roomName,
      room: (chunks) => <b className="highlight">{chunks}</b>
    });

    const modalBody = <>
      <span className="descriptive small">{modalDescription}</span>
      <div className="horizontal-list gap-4mm">
        <Button iconName={ICONS.DO_NOT_DISTURB_ON} onClick={()=>refuseInvite(invite)}>{t("room.actions.refuse")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} onClick={()=>hideModal()}>{tcommon("cancel")}</Button>
      </div>
    </>

    showModal(t("room.messages.refuse_invite.title"), modalBody);
  }

  /* Room editing logic */

  const promptRoomRename = () => {
    if (!data) return;

    const modalBody = <>
    <DataForm action={new RoomRenameFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} hideSave className="vertical-list gap-2mm">
      {modalLoading && <Icon className='loading-animation small' iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
      <input type="hidden" name="roomId" value={data.roomInfo.roomId}></input>
      <JanInput inputType="text" fieldName="newName" maxLength={64} minLength={3} busy={modalLoading} label={t("room.input.rename_new_name.label")}
        placeholder={t("room.input.rename_new_name.placeholder")}></JanInput>
      <div className="horizontal-list gap-4mm">
        <Button type="submit" className="success" iconName={ICONS.CHECK}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button type="button" className="danger" iconName={ICONS.CANCEL} onClick={()=>hideModal()}>{tcommon("cancel")}</Button>
      </div>
    </DataForm>
    </>;

    showModal(t("room.actions.rename"), modalBody);
  }

  /* Room invite logic */

  const promptRoomInvite = () => {
    if (!data) return;
    
    const modalBody = <>
    <DataForm action={new RoomInviteFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} hideSave className="vertical-list gap-2mm">
      {modalLoading && <Icon className='loading-animation small' iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
      <input type="hidden" name="roomId" value={data.roomInfo.roomId}></input>
      <AutoInput fieldName="invitedUsers" manager={new AutoInputDebugUserManager()} multiple={true} 
      max={(data.roomInfo.roomData.roomCapacity - data.roomInfo.guests.length)} label={t("room.input.invite.label")}
      placeholder={t("room.input.invite.placeholder")} style={{maxWidth: "500px"}}/>
      <div className="horizontal-list gap-4mm">
        <Button type="submit" className="success" iconName={ICONS.CHECK}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button type="button" className="danger" iconName={ICONS.CANCEL} onClick={()=>hideModal()}>{tcommon("cancel")}</Button>
      </div>
    </DataForm>
    </>;

    showModal(t("room.actions.invite"), modalBody);
  }

  useEffect(()=> {
    setLoading(true);
    runRequest(new RoomInfoApiAction())
    .then (result => setData(result as RoomInfoResponse))
    .catch((err)=>showModal(
        tcommon("error"), 
        <span className='error'>{getErrorBody(err) ?? tcommon("unknown_error")}</span>
    )).finally(()=>setLoading(false));
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
      <NoticeBox theme={NoticeTheme.Warning} 
      title={t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.title`)}>
        {t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.description`, 
          {lockDate: formatter.dateTime(new Date(), {dateStyle: "medium"})})}
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
      { data?.invitations && data.invitations.length > 0 && <>
        <div className="actions-panel rounded-m vertical-list gap-2mm">
          <span className="title small horizontal-list gap-2mm flex-vertical-center">
            <Icon iconName={ICONS.MAIL}></Icon>
            {t("room.invite.header", {amount: 1})}
          </span>
          {
            data?.invitations?.map((invite, index) => <RoomInvite key={index} inviteData={invite}
            busy={loading} onAccept={promptAcceptInvite} onReject={promptRefuseInvite}></RoomInvite>)
          }
        </div>
      </> }
      {/* Your room */}
      {data?.roomInfo && <>
        <div className="actions-panel rounded-m vertical-list gap-2mm">
          <span className="title small horizontal-list gap-2mm flex-vertical-center">
            <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
            {t("room.your_room")}
            <div className="spacer"></div>
          </span>
          {/* Room data */}
          <div className="room-invite vertical-list gap-4mm rounded-s">
            <span className="invite-title semibold title small horizontal-list flex-vertical-center gap-2mm">
                <Icon iconName={ICONS.BED}></Icon>
                {data?.roomInfo.roomName}
                <div className="spacer"></div>
                <Button iconName={ICONS.EDIT_SQUARE} onClick={()=>promptRoomRename()}>{t("room.actions.rename")}</Button>
            </span>
            <div className="room-guests horizontal-list gap-4mm flex-center flex-space-evenly">
                {/* <div className="room-owner-container">
                    <UserPicture userData={data.roomInfo.roomOwner} size={64} showNickname showFlag></UserPicture>
                    <StatusBox>{t("room.status_owner")}</StatusBox>
                </div> */}
                {data?.roomInfo.guests.map ((guest, key) => <UserPicture key={key} size={64} userData={guest.user} showNickname showFlag></UserPicture>)}
            </div>
            <div className="invite-toolbar horizontal-list gap-4mm">
                <StatusBox>{translate(data.roomInfo.roomData.roomTypeNames, locale)}</StatusBox>
                <StatusBox>{t("room.room_number_left", {size: data.roomInfo.roomData.roomCapacity - data.roomInfo.guests.length})}</StatusBox>
                <div className="spacer"></div>
                <Button iconName={ICONS.PERSON_ADD} disabled={!data.roomInfo.userIsOwner || !data.roomInfo.canInvite}
                  onClick={()=>promptRoomInvite()}>{t("room.actions.invite")}</Button>
            </div>
          </div>
        </div>
      </>}
    </div>
    <Modal open={showInviteTutorial} onClose={()=>setShowInviteTutorial(false)}>

    </Modal>
  </>;
}
