'use client'
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Modal from "@/app/_components/modal";
import RoomInvite from "@/app/_components/_room/roomInvite";
import { RoomCreateApiAction, RoomCreateData, RoomCreateResponse, RoomDeleteAction, RoomEditData, RoomInfo, RoomInfoApiAction, RoomInfoResponse, RoomInvitation, RoomInviteFormAction, RoomRenameData, RoomRenameFormAction } from "@/app/_lib/api/room";
import UserPicture from "@/app/_components/userPicture";
import StatusBox from "@/app/_components/statusBox";
import DataForm from "@/app/_components/dataForm";
import JanInput from "@/app/_components/janInput";
import AutoInput from "@/app/_components/autoInput";
import { AutoInputDebugUserManager } from "@/app/_lib/components/autoInput";
import "../../../../styles/furpanel/room.css";
import { useUser } from "@/app/_lib/context/userProvider";
import { OrderStatus } from "@/app/_lib/api/order";
import ModalError from "@/app/_components/modalError";
import { translate } from "@/app/_lib/utils";

export default function RoomPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const formatter = useFormatter();
  const locale = useLocale();
  const {userData, userLoading} = useUser();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [showInviteTutorial, setShowInviteTutorial] = useState(false);
  const {showModal, hideModal} = useModalUpdate();
  useTitle(t("room.title"));

  // Room related states
  /* Room data */
  const [data, setData] = useState<RoomInfoResponse> ();

  useEffect(()=> {
    if (data) return;
    setLoading(true);
    runRequest(new RoomInfoApiAction())
    .then (result => setData(result as RoomInfoResponse))
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="room.errors"></ModalError>
    )).finally(()=>setLoading(false));
  }, [data])

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

  const promptRoomInvite = () => {
    if (!data) return;
    
    const modalBody = <>
    <DataForm action={new RoomInviteFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} hideSave className="vertical-list gap-2mm">
      {modalLoading && <Icon className='loading-animation small' iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
      <input type="hidden" name="roomId" value={data.currentRoomInfo.roomId}></input>
      <AutoInput fieldName="invitedUsers" manager={new AutoInputDebugUserManager()} multiple={true} 
      max={(data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length)} label={t("room.input.invite.label")}
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

  /* Room editing logic */
  // Room creation
  const createRoom = () => {
    if (userLoading) return;

    const roomData: RoomCreateData = {
      name: t("room.default_name", {name: userData?.fursonaName})
    };

    setActionLoading(true);

    runRequest(new RoomCreateApiAction(), roomData, undefined)
    .then((data) => {if ((data as RoomCreateResponse).roomId) setData(undefined);})
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
    ))
    .finally(()=>setActionLoading(false));
  }

  // Room Rename

  const renameRoomSuccess = () => {
    hideModal();
    setData(undefined)
  }

  const renameRoomFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
    );
  }

  const promptRoomRename = () => {
    if (!data) return;

    const modalBody = <>
    <DataForm action={new RoomRenameFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={renameRoomSuccess}
      onFail={renameRoomFail} hideSave className="vertical-list gap-2mm">
      {modalLoading && <Icon className='loading-animation small' iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
      <input type="hidden" name="roomId" value={data.currentRoomInfo.roomId}></input>
      <JanInput inputType="text" fieldName="name" maxLength={64} minLength={3} busy={modalLoading} label={t("room.input.rename_new_name.label")}
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

  // Room deletion
  const deleteRoom = (roomId: number) => {
    hideModal();
    const roomData: RoomEditData = {
      roomId: roomId
    };
    setActionLoading(true);
    runRequest(new RoomDeleteAction(), roomData, undefined)
    .then((data) => {if (data) setData(undefined);})
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
    ))
    .finally(()=>setActionLoading(false));
  }

  const promptRoomDelete = () => {
    if (!data) return;

    const modalDescription = t.rich("room.messages.confirm_delete.description", {
      roomName: data.currentRoomInfo.roomName,
      room: (chunks) => <b className="highlight">{chunks}</b>
    });

    const modalBody = <>
    <span className="descriptive small">{modalDescription}</span>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} onClick={()=>deleteRoom(data.currentRoomInfo.roomId)}>{t("room.actions.delete")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} onClick={()=>hideModal()}>{tcommon("cancel")}</Button>
      </div>
    </>;

    showModal(t("room.actions.delete"), modalBody);
  }

  return <>
    <div className="page">
      {loading && <>
        <span className="title horizontal-list gap-2mm flex-center">
          <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}
        </span>
      </>}
      {/* <NoticeBox theme={NoticeTheme.Warning} 
      title={t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.title`)}>
        {t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.description`, 
          {lockDate: formatter.dateTime(new Date(), {dateStyle: "medium"})})}
      </NoticeBox> */}
      {/* View when user has no room */}
      {!data || !data.currentRoomInfo && <>
        <div className="actions-panel rounded-m">
        <span className="title small horizontal-list gap-2mm flex-vertical-center">
          <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
          {t("room.no_room")}
        </span>
        <div className="horizontal-list flex-center flex-vertical-center gap-4mm" style={{marginTop: "1em"}}>
          {data && data.canCreateRoom == true 
            ?
              <Button iconName={ICONS.ADD_CIRCLE} busy={actionLoading} onClick={()=>createRoom()}>{t("room.actions.create_a_room")}</Button>
            : <>
              <Button iconName={ICONS.SHOPPING_CART} busy={actionLoading}>{t("room.actions.buy_a_room")}</Button>
              <span className="title small">{t("room.or")}</span>
              <Button iconName={ICONS.PERSON_ADD} onClick={()=>setShowInviteTutorial(true)}>{t("room.actions.join_a_room")}</Button> 
            </>
          }
        </div>
        </div>
      </>}
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
      {data?.currentRoomInfo && <>
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
                {data?.currentRoomInfo.roomName}
                <div className="spacer"></div>
                <Button iconName={ICONS.EDIT_SQUARE} onClick={()=>promptRoomRename()}>{t("room.actions.rename")}</Button>
                <Button className="danger" iconName={ICONS.DELETE} onClick={()=>promptRoomDelete()}>{t("room.actions.delete")}</Button>
            </span>
            <div className="room-guests horizontal-list gap-4mm flex-center flex-space-evenly">
                {data?.currentRoomInfo.guests.map ((guest, key) => <div key={key} className="guest-container vertical-list gap-2mm">
                  <UserPicture size={64} userData={guest.user} showNickname showFlag></UserPicture>
                  {data.currentRoomInfo.roomOwner.userId === guest.user.userId && <StatusBox>{t("room.status_owner")}</StatusBox>}
                  {[OrderStatus.CANCELED, OrderStatus.EXPIRED, OrderStatus.PENDING].includes(guest.orderStatus) && 
                    <StatusBox status="warning">{tcommon(`order_status.${guest.orderStatus}`)}</StatusBox>
                  }
                </div>)}
            </div>
            <div className="invite-toolbar horizontal-list gap-4mm">
                <StatusBox>{translate(data.currentRoomInfo.roomData.roomTypeNames, locale)}</StatusBox>
                <StatusBox>{t("room.room_number_left", {size: data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length})}</StatusBox>
                <div className="spacer"></div>
                <Button iconName={ICONS.PERSON_ADD} disabled={!data.currentRoomInfo.userIsOwner || !data.currentRoomInfo.canInvite}
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
