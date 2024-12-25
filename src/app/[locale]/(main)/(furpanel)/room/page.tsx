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
import { GuestIdApiData, RoomCreateApiAction, RoomCreateData, RoomCreateResponse, RoomDeleteAction, RoomEditData, RoomGuest, RoomGuestHeader, RoomInfo, RoomInfoApiAction, RoomInfoResponse, RoomInvitation, RoomInviteAnswerAction, RoomInviteFormAction, RoomKickAction, RoomLeaveAction, RoomRenameData, RoomRenameFormAction } from "@/app/_lib/api/room";
import UserPicture from "@/app/_components/userPicture";
import StatusBox from "@/app/_components/statusBox";
import DataForm from "@/app/_components/dataForm";
import JanInput from "@/app/_components/janInput";
import AutoInput from "@/app/_components/autoInput";
import { AutoInputDebugUserManager, AutoInputFilter } from "@/app/_lib/components/autoInput";
import "../../../../styles/furpanel/room.css";
import { useUser } from "@/app/_lib/context/userProvider";
import { OrderStatus } from "@/app/_lib/api/order";
import ModalError from "@/app/_components/modalError";
import { translate } from "@/app/_lib/utils";
import { AutoInputRoomInviteManager } from "@/app/_lib/api/user";
import Checkbox from "@/app/_components/checkbox";

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

  /************************/
  /** Room editing logic **/
  /************************/

   // Room creation
   const createRoom = () => {
    if (userLoading) return;

    const roomData: RoomCreateData = {
      name: t("room.default_name", {name: userData?.fursonaName})
    };

    setActionLoading(true);

    runRequest(new RoomCreateApiAction(), undefined, roomData, undefined)
    .then((data) => {if ((data as RoomCreateResponse).roomId) setData(undefined);})
    .catch((err)=>commonFail(err))
    .finally(()=>setActionLoading(false));
  }
  
  // rename modal
  const [renameModalOpen, setRenameModalOpen] = useState(false);

  const promptRoomRename = () => {
    if (!data) return;
    setRenameModalOpen(true);
  }

  // delete room modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const promptRoomDelete = () => {
    if (!data) return;
    setDeleteModalOpen(true);
  }

  const deleteRoom = (roomId: number) => {
    const roomData: RoomEditData = {
      roomId: roomId
    };
    setModalLoading(true);
    runRequest(new RoomDeleteAction(), undefined, roomData, undefined)
    .then((data)=>commonSuccess())
    .catch((err)=>commonFail(err))
    .finally(()=>setModalLoading(false));
  }

  // invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const promptRoomInvite = () => {
    if (!data) return;
    setInviteModalOpen(true);
  }

  // invite accept / refuse
  const [currentInvitation, setCurrentInvitation] = useState<RoomInvitation>();
  const [inviteAcceptModalOpen, setInviteAcceptModalOpen] = useState(false);
  const [inviteRefuseModalOpen, setInviteRefuseModalOpen] = useState(false);

  const promptAcceptInvite = (invite: RoomInvitation) => {
    setCurrentInvitation(invite);
    setInviteAcceptModalOpen(true);
  }

  const acceptInvite = (guestId: number) => {
    const guestData: GuestIdApiData = {
      guestId: guestId
    };
    setModalLoading(true);
    runRequest(new RoomInviteAnswerAction(), ["accept"], guestData, undefined)
    .then((data)=>commonSuccess())
    .catch((err)=>commonFail(err))
    .finally(()=>setModalLoading(false));
  }

  const promptRefuseInvite = (invite: RoomInvitation) => {
    setCurrentInvitation(invite);
    setInviteRefuseModalOpen(true);
  }

  const refuseInvite = (guestId: number) => {
    const guestData: GuestIdApiData = {
      guestId: guestId
    };
    setModalLoading(true);
    runRequest(new RoomInviteAnswerAction(), ["refuse"], guestData, undefined)
    .then((data)=>commonSuccess())
    .catch((err)=>commonFail(err))
    .finally(()=>setModalLoading(false));
  }

  // cancel / kick invite modal
  const [selectedGuest, setSelectedGuest] = useState<RoomGuestHeader>();
  const [inviteCancelModalOpen, setInviteCancelModalOpen] = useState(false);
  const [kickModalOpen, setKickModalOpen] = useState(false);

  const promptKickGuest = (guest: RoomGuestHeader) => {
    setSelectedGuest(guest);
    setKickModalOpen(true);
  }

  const promptCancelInvite = (guest: RoomGuestHeader) => {
    setSelectedGuest(guest);
    setInviteCancelModalOpen(true);
  }

  const cancelInvite = (guestId: number) => {
    const guestData: GuestIdApiData = {
      guestId: guestId
    };
    setModalLoading(true);
    runRequest(new RoomInviteAnswerAction(), ["cancel"], guestData, undefined)
    .then((data)=>commonSuccess())
    .catch((err)=>commonFail(err))
    .finally(()=>setModalLoading(false));
  }

  const kickGuest = (guestId: number) => {
    const guestData: GuestIdApiData = {
      guestId: guestId
    };
    setModalLoading(true);
    runRequest(new RoomKickAction(), undefined, guestData, undefined)
    .then((data)=>commonSuccess())
    .catch((err)=>commonFail(err))
    .finally(()=>setModalLoading(false));
  }

  // leave room modal
  const [leaveModalOpen, setLeaveModalOpen ] = useState(false);

  const promptRoomLeave = () => {
    if (!data) return;
    setLeaveModalOpen(true);
  }

  const leaveRoom = () => {
    setModalLoading(true);
    runRequest(new RoomLeaveAction(), undefined, undefined, undefined)
    .then((data)=>commonSuccess())
    .catch((err)=>commonFail(err))
    .finally(()=>setModalLoading(false));
  }

  /******************/
  /** Common logic **/
  /******************/

  const commonSuccess = () => {
    setRenameModalOpen(false);
    setDeleteModalOpen(false);
    setInviteModalOpen(false);
    setCurrentInvitation(undefined);
    setInviteAcceptModalOpen(false);
    setInviteRefuseModalOpen(false);
    setSelectedGuest(undefined);
    setInviteCancelModalOpen(false);
    setKickModalOpen(false);
    setLeaveModalOpen(false);
    setData(undefined);
  }

  const commonFail = (err: ApiErrorResponse | ApiDetailedErrorResponse, translationRoot?: string, translationKey?: string) => {
    setRenameModalOpen(false);
    setDeleteModalOpen(false);
    setInviteModalOpen(false);
    setInviteAcceptModalOpen(false);
    setInviteRefuseModalOpen(false);
    setInviteCancelModalOpen(false);
    setKickModalOpen(false);
    setLeaveModalOpen(false);
    showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot={translationRoot ?? "furpanel"} translationKey={translationKey ?? "room.errors"}></ModalError>
    );
  }

  // Data loading
  useEffect(()=> {
    if (data) return;
    setLoading(true);
    runRequest(new RoomInfoApiAction())
    .then (result => setData(result as RoomInfoResponse))
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="room.errors"></ModalError>
    )).finally(()=>setLoading(false));
  }, [data]);


  /********************/
  /** Page Rendering **/
  /********************/

  return <>
    <div className="page">
      {/* Room deadline */}
      {data?.editingRoomEndTime && <>
        <NoticeBox theme={NoticeTheme.Warning} 
        title={t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.title`)}>
          {t(`room.messages.${true ? "room_edit_deadline" : "room_edit_deadline_end"}.description`, 
            {lockDate: formatter.dateTime(new Date(), {dateStyle: "medium"})})}
        </NoticeBox>
      </>}

      
      {/* Your room */}
      <div className="actions-panel rounded-m vertical-list gap-2mm">
        <span className="title small horizontal-list gap-2mm flex-vertical-center">
          <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
          {t("room.your_room")}
          <div className="spacer"></div>
          <Button iconName={ICONS.REFRESH} onClick={()=>setData(undefined)} debounce={3000}>{tcommon("reload")}</Button>
        </span>

        {/* Loading */}
        {loading && <>
          <span className="title horizontal-list gap-2mm flex-center">
            <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}
          </span>
        </>}

        {/* View when user has no room */}
        {!data || !data.currentRoomInfo && <>
          <div className="room-invite actions-panel rounded-m">
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

        {/* Room data */}
        {data?.currentRoomInfo && <>
        <div className="room-invite vertical-list gap-4mm rounded-s">
          <span className="invite-title semibold title small horizontal-list flex-vertical-center gap-2mm">
              <Icon iconName={ICONS.BED}></Icon>
              <span className="limit-view">{data?.currentRoomInfo.roomName}</span>
              <div className="spacer"></div>
              {
                data.currentRoomInfo.userIsOwner && <>
                <Button iconName={ICONS.EDIT_SQUARE} onClick={()=>promptRoomRename()}>{t("room.actions.rename")}</Button>
                {/*<Button className="danger" iconName={ICONS.LOGOUT} onClick={()=>promptRoomTransfer()}>{t("room.actions.transfer")}</Button>*/  }
                <Button className="danger" iconName={ICONS.DELETE} onClick={()=>promptRoomDelete()}>{t("room.actions.delete")}</Button>
                </>
              }
              
          </span>
          {/* Room guests */}
          <div className="room-guests horizontal-list gap-4mm flex-center flex-space-evenly">
              {data?.currentRoomInfo.guests.map ((guest, key) => <div key={key} 
                className={`guest-container vertical-list gap-2mm ${guest.roomGuest.confirmed === false ? "invited" : ""}`}>
                <UserPicture size={64} userData={guest.user} showNickname showFlag></UserPicture>
                {data.currentRoomInfo.roomOwner.userId === guest.user.userId && <StatusBox>{t("room.status_owner")}</StatusBox>}
                {[OrderStatus.CANCELED, OrderStatus.EXPIRED, OrderStatus.PENDING].includes(guest.orderStatus) && 
                  <StatusBox status="warning">{tcommon(`order_status.${guest.orderStatus}`)}</StatusBox>
                }
                {guest.roomGuest.confirmed === false && 
                  <StatusBox status="warning">{t("room.status_invited")}</StatusBox>
                }

                {data.currentRoomInfo.userIsOwner && guest.user.userId !== data.currentRoomInfo.roomOwner.userId && <>
                  <a className="action-kick" href="#" onClick={()=>{
                    if (guest.roomGuest.confirmed)
                      promptKickGuest(guest);
                    else
                      promptCancelInvite(guest)
                  }}>
                    <Icon className="medium" iconName={ICONS.CLOSE}></Icon>
                  </a>
                </>}
              </div>)}
          </div>
          <div className="invite-toolbar horizontal-list gap-4mm">
              <StatusBox>{translate(data.currentRoomInfo.roomData.roomTypeNames, locale)}</StatusBox>
              <StatusBox>{t("room.room_number_left", {size: data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length})}</StatusBox>
              <div className="spacer"></div>
              {data.currentRoomInfo.userIsOwner ? <>
              {/* Owner actions */}
                <Button iconName={ICONS.PERSON_ADD} disabled={!data.currentRoomInfo.canInvite}
                  onClick={()=>promptRoomInvite()}>{t("room.actions.invite")}</Button>
                  {data.currentRoomInfo.confirmed === false ? <>
                    <Button iconName={ICONS.CHECK_CIRCLE} disabled={!data.currentRoomInfo.canConfirm}
                      onClick={()=>promptRoomInvite()}>{t("room.actions.confirm_room")}</Button>
                  </> : <>
                  <Button iconName={ICONS.CANCEL} disabled={!data.currentRoomInfo.canUnconfirm}
                      onClick={()=>promptRoomInvite()}>{t("room.actions.unconfirm_room")}</Button>
                  </>}
              </> : <>
              {/* Guest actions */}
                <Button iconName={ICONS.PERSON_ADD} onClick={()=>promptRoomLeave()}>{t("room.actions.leave")}</Button>
              </>}
          </div>
        </div>
        </>}
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
    </div>

    {/* Invite modal */}
    <Modal open={showInviteTutorial} onClose={()=>setShowInviteTutorial(false)}>

    </Modal>

    {/* Rename modal */}
    <Modal title={t("room.actions.rename")} open={renameModalOpen} onClose={()=>setRenameModalOpen(false)} busy={modalLoading}>
    { data?.currentRoomInfo && <>
    <DataForm action={new RoomRenameFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={commonSuccess}
      onFail={commonFail} hideSave className="vertical-list gap-2mm">
      <input type="hidden" name="roomId" value={data?.currentRoomInfo?.roomId}></input>
      <JanInput inputType="text" fieldName="name" required busy={modalLoading} label={t("room.input.rename_new_name.label")}
      placeholder={t("room.input.rename_new_name.placeholder")}></JanInput>
      <div className="horizontal-list gap-4mm">
      <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{tcommon("confirm")}</Button>
      <div className="spacer"></div>
      <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setRenameModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
    </DataForm>
    </>}
    </Modal>

    {/* Invite modal */}
    <Modal title={t("room.actions.invite")} open={inviteModalOpen} onClose={()=>setInviteModalOpen(false)} busy={modalLoading}>
    {data?.currentRoomInfo && <>
    <DataForm action={new RoomInviteFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={commonSuccess}
      onFail={commonFail} hideSave className="vertical-list gap-2mm">
      <input type="hidden" name="roomId" value={data?.currentRoomInfo?.roomId}></input>
      <AutoInput fieldName="invitedUsers" manager={new AutoInputRoomInviteManager()} multiple={true} disabled={modalLoading}
        max={(data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length)} label={t("room.input.invite.label")}
        placeholder={t("room.input.invite.placeholder")} style={{maxWidth: "500px"}}/>
      { /* TODO: [ADMIN CHECK] */
        true && <>
        <Checkbox fieldName="force">{t("room.input.force_join.label")}</Checkbox>
        <Checkbox fieldName="forceExit">{t("room.input.force_exit.label")}</Checkbox>
        </>
      }
      <div className="horizontal-list gap-4mm">
        <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
    </DataForm>
    </>}
    </Modal>

    {/* Room invite accept */}
    <Modal title={t("room.messages.accept_invite.title")} open={inviteAcceptModalOpen} busy={modalLoading} onClose={()=>{
      setInviteAcceptModalOpen(false);
      setCurrentInvitation(undefined);
    }}>
      {currentInvitation && <>
      <span className="descriptive small">
        {t.rich("room.messages.accept_invite.description", {
        nickname: currentInvitation.room.roomOwner.fursonaName,
        roomName: currentInvitation.room.roomName,
        room: (chunks) => <b className="highlight">{chunks}</b>
        })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} busy={modalLoading} onClick={()=>acceptInvite(currentInvitation.invitation.guestId)}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteAcceptModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
      </>}
    </Modal>

    {/* Room invite refuse */}
    <Modal title={t("room.messages.refuse_invite.title")} open={inviteRefuseModalOpen} busy={modalLoading} onClose={()=>{
      setInviteRefuseModalOpen(false);
      setCurrentInvitation(undefined);
    }}>
      {currentInvitation && <>
      <span className="descriptive small">
        {t.rich("room.messages.refuse_invite.description", {
        nickname: currentInvitation.room.roomOwner.fursonaName,
        roomName: currentInvitation.room.roomName,
        room: (chunks) => <b className="highlight">{chunks}</b>
        })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button iconName={ICONS.DO_NOT_DISTURB_ON} busy={modalLoading} onClick={()=>refuseInvite(currentInvitation.invitation.guestId)}>{t("room.actions.refuse")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteRefuseModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
      </>}
    </Modal>

    {/* Delete modal */}
    <Modal title={t("room.messages.confirm_delete.title")} open={deleteModalOpen} onClose={()=>setDeleteModalOpen(false)} busy={modalLoading}>
    {data?.currentRoomInfo && <>
      <span className="descriptive small">{t.rich("room.messages.confirm_delete.description", {
        roomName: data.currentRoomInfo.roomName,
        room: (chunks) => <b className="highlight">{chunks}</b>
      })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} busy={modalLoading} onClick={()=>deleteRoom(data.currentRoomInfo.roomId)}>{t("room.actions.delete")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setDeleteModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
    </>}
    </Modal>
    
    {/* Cancel invite modal */}
    <Modal title={t("room.messages.confirm_invite_cancel.title")} open={inviteCancelModalOpen} 
      onClose={()=>{setSelectedGuest(undefined); setInviteCancelModalOpen(false);}} busy={modalLoading}>
    {selectedGuest && data?.currentRoomInfo && <>
      <span className="descriptive small">{t("room.messages.confirm_invite_cancel.description", {
        guestName: selectedGuest.user.fursonaName
      })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CLOSE} busy={modalLoading} onClick={()=>cancelInvite(selectedGuest.roomGuest.guestId)}>{t("room.actions.revoke_invite")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteCancelModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
    </>}
    </Modal>

    {/* Kick guest modal */}
    <Modal title={t("room.messages.confirm_kick.title")} open={kickModalOpen}
      onClose={()=>{setSelectedGuest(undefined); setKickModalOpen(false);}} busy={modalLoading}>
    {selectedGuest && data?.currentRoomInfo && <>
      <span className="descriptive small">{t("room.messages.confirm_kick.description", {
        guestName: selectedGuest.user.fursonaName
      })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CLOSE} busy={modalLoading} onClick={()=>kickGuest(selectedGuest.roomGuest.guestId)}>{t("room.actions.revoke_invite")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setKickModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
    </>}
    </Modal>

    {/* Leave modal */}
    <Modal title={t("room.messages.confirm_leave.title")} open={leaveModalOpen} onClose={()=>setLeaveModalOpen(false)} busy={modalLoading}>
    {data?.currentRoomInfo && <>
      <span className="descriptive small">{t.rich("room.messages.confirm_leave.description", {
        roomName: data.currentRoomInfo.roomName,
        room: (chunks) => <b className="highlight">{chunks}</b>
      })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="danger" iconName={ICONS.CHECK} busy={modalLoading} onClick={()=>leaveRoom()}>{t("room.actions.leave")}</Button>
        <div className="spacer"></div>
        <Button iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setLeaveModalOpen(false)}>{tcommon("cancel")}</Button>
      </div>
    </>}
    </Modal>
  </>;
}
