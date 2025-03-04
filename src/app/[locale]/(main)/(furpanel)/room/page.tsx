'use client'
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/lib/api/hooks/useTitle";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { useModalUpdate } from "@/lib/context/modalProvider";
import Modal from "@/components/modal";
import RoomInvite from "@/components/room/roomInvite";
import { GuestIdApiData, RoomCreateApiAction, RoomCreateData, RoomCreateResponse, RoomDeleteAction, RoomEditData, RoomExchangeFormAction, RoomGuest, RoomGuestHeader, RoomInfo, RoomInfoApiAction, RoomInfoResponse, RoomInvitation, RoomInviteAnswerAction, RoomInviteFormAction, RoomKickAction, RoomLeaveAction, RoomRenameData, RoomRenameFormAction, RoomSetShowInNosecountApiAction, RoomSetShowInNosecountData } from "@/lib/api/room";
import UserPicture from "@/components/userPicture";
import StatusBox from "@/components/statusBox";
import DataForm from "@/components/dataForm";
import JanInput from "@/components/janInput";
import AutoInput from "@/components/autoInput";
import "@/styles/furpanel/room.css";
import { useUser } from "@/lib/context/userProvider";
import { OrderStatus } from "@/lib/api/order";
import ModalError from "@/components/modalError";
import { translate } from "@/lib/utils";
import { AutoInputRoomInviteManager } from "@/lib/api/user";
import Checkbox from "@/components/checkbox";
import RoomOrderFlow from "@/components/room/roomOrderFlow";
import { Permissions } from "@/lib/api/permission";
import ToolLink from "@/components/toolLink";

export default function RoomPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const formatter = useFormatter();
  const locale = useLocale();
  const {userDisplay, userLoading} = useUser();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
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
      name: t("room.default_name", {name: userDisplay?.display?.fursonaName})
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

  // Room buy modal
  const [buyModalOpen, setBuyModalOpen ] = useState(false);

  // exchange room modal
  const [exchangeModalOpen, setExchangeModalOpen ] = useState(false);
  
  const promptRoomExchange = () => {
    if (!data) return;
    setExchangeModalOpen(true);
  }

  const roomExchangeSuccess = () => {
    const successBody = <span>
      {t("room.messages.exchange_invite_sent.description")}
    </span>;
    showModal(t("room.messages.exchange_invite_sent.title"), successBody, ICONS.CHECK_CIRCLE);
    commonSuccess();
  }

  // Room nosecount visibility
  const [showInNosecount, setShowInNosecount] = useState(false);

  const setVisibility = (newValue: boolean) => {
    if (!data?.currentRoomInfo?.userIsOwner) return;
    setLoading(true);
    const reqData: RoomSetShowInNosecountData = {
      showInNosecount: newValue
    };
    runRequest(new RoomSetShowInNosecountApiAction(), undefined, reqData)
    .then((res)=>setShowInNosecount(newValue))
    .catch((err)=>commonFail(err))
    .finally(()=>setLoading(false));
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
    setExchangeModalOpen(false);
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
    setExchangeModalOpen(false);
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
    .then (result => {
      const dataResult = result as RoomInfoResponse
      setShowInNosecount(dataResult.currentRoomInfo?.showInNosecount);
      setData(dataResult);
    }).catch((err)=>showModal(
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
            {lockDate: formatter.dateTime(new Date(data?.editingRoomEndTime), {dateStyle: "medium"})})}
        </NoticeBox>
      </>}

      
      {/* Your room */}
      <div className="actions-panel rounded-m vertical-list gap-2mm">
        <span className="title small horizontal-list gap-2mm flex-vertical-center flex-wrap">
          <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
          {t("room.your_room")}
          <div className="spacer"></div>
          {data?.currentRoomInfo?.userIsOwner &&
            <Button iconName={!showInNosecount ? ICONS.VISIBILITY : ICONS.VISIBILITY_OFF}
              title={!showInNosecount ? t("room.actions.show_in_nosecount") : t("room.actions.hide_in_nosecount")}
              debounce={500} onClick={()=>setVisibility(!showInNosecount)}>
            </Button>}
          {data && data.currentRoomInfo && !!data.buyOrUpgradeRoomSupported && !!data.canBuyOrUpgradeRoom &&
              <Button iconName={ICONS.SHOPPING_CART} busy={actionLoading} onClick={()=>setBuyModalOpen(true)}>
                {t("room.actions.upgrade_room")}
              </Button>
          }
          <Button iconName={ICONS.REFRESH} title={tcommon("reload")} onClick={()=>setData(undefined)} debounce={3000}></Button>
        </span>

        {/* Loading */}
        {loading && <>
          <span className="title horizontal-list gap-2mm flex-center">
            <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>{tcommon("loading")}
          </span>
        </>}

        {/* View when user has no room */}
        {data && !data.currentRoomInfo && <>
          <div className="room-invite actions-panel rounded-m">
          <span className="title small horizontal-list gap-2mm flex-vertical-center">
            <Icon iconName={ICONS.BEDROOM_PARENT}></Icon>
            {data.canCreateRoom ? t("room.can_create") : t("room.no_room")}
          </span>
          <div className="horizontal-list flex-center flex-vertical-center gap-4mm flex-wrap" style={{marginTop: "1em"}}>
            {data.canCreateRoom == true 
              ? <>
                  <Button iconName={ICONS.ADD_CIRCLE} busy={actionLoading} onClick={()=>createRoom()}>{t("room.actions.create_a_room")}</Button>
                  <span className="title small">{t("room.or")}</span>
                  <Button iconName={ICONS.SHOPPING_CART} busy={actionLoading} disabled={!data.buyOrUpgradeRoomSupported || !data.canBuyOrUpgradeRoom || !data.hasOrder} onClick={()=>setBuyModalOpen(true)}>{t("room.actions.upgrade_room")}</Button>
                  <span className="title small">{t("room.or")}</span>
                  <Button className="danger" iconName={ICONS.SEND} onClick={()=>promptRoomExchange()} 
                    disabled={!!data && !data.canExchange}>{t("room.actions.exchange")}</Button>
                </>
              : data.hasOrder 
              ? <>
                <Button iconName={ICONS.SHOPPING_CART} busy={actionLoading} disabled={!data.buyOrUpgradeRoomSupported || !data.canBuyOrUpgradeRoom || !data.hasOrder} onClick={()=>setBuyModalOpen(true)}>{t("room.actions.buy_a_room")}</Button>
                <span className="title small">{t("room.or_get_invited")}</span>
              </>
              : <>
                <span>{t("room.no_order")}</span>
                <ToolLink href={"/booking"} iconName={ICONS.LOCAL_ACTIVITY} className="active">{t("booking.title")}</ToolLink>
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
                <div className="actions-container horizontal-list flex-wrap gap-4mm">
                  <Button iconName={ICONS.EDIT_SQUARE} onClick={()=>promptRoomRename()}>{t("room.actions.rename")}</Button>
                  <Button className="danger" iconName={ICONS.DELETE} onClick={()=>promptRoomDelete()}>{t("room.actions.delete")}</Button>
                </div>
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
                {data.currentRoomInfo.confirmed === false ? data.currentRoomInfo.confirmationSupported && <>
                  <Button iconName={ICONS.CHECK_CIRCLE} disabled={!data.currentRoomInfo.canConfirm}
                    onClick={()=>promptRoomInvite()}>{t("room.actions.confirm_room")}</Button>
                </> : data.currentRoomInfo.confirmationSupported && <>
                <Button iconName={ICONS.CANCEL} disabled={!data.currentRoomInfo.canUnconfirm}
                    onClick={()=>promptRoomInvite()}>{t("room.actions.unconfirm_room")}</Button>
                </>}
                <Button className="danger" iconName={ICONS.SEND} onClick={()=>promptRoomExchange()} 
                  disabled={!!data && !data.canExchange}>
                    {t("room.actions.exchange")}
                </Button>
              </> : <>
              {/* Guest actions */}
                <Button iconName={ICONS.DOOR_OPEN} onClick={()=>promptRoomLeave()}>{t("room.actions.leave")}</Button>
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

    {/* Rename modal */}
    <Modal title={t("room.actions.rename")} icon={ICONS.EDIT_SQUARE} open={renameModalOpen} onClose={()=>setRenameModalOpen(false)} busy={modalLoading}>
    { data?.currentRoomInfo && <>
    <DataForm action={new RoomRenameFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={commonSuccess}
      onFail={commonFail} hideSave className="vertical-list gap-2mm" resetOnSuccess>
      <input type="hidden" name="roomId" value={data?.currentRoomInfo?.roomId ?? ""}></input>
      <JanInput inputType="text" fieldName="name" required busy={modalLoading} label={t("room.input.rename_new_name.label")}
      placeholder={t("room.input.rename_new_name.placeholder")} minLength={2} maxLength={254}></JanInput>
      <div className="horizontal-list gap-4mm">
        <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setRenameModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{tcommon("confirm")}</Button>
      </div>
    </DataForm>
    </>}
    </Modal>

    {/* Invite modal */}
    <Modal title={t("room.actions.invite")} icon={ICONS.PERSON_ADD} open={inviteModalOpen} onClose={()=>setInviteModalOpen(false)} busy={modalLoading}>
    {data?.currentRoomInfo && <>
    <DataForm action={new RoomInviteFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={commonSuccess}
      onFail={commonFail} hideSave className="vertical-list gap-2mm" resetOnSuccess shouldReset={!inviteModalOpen}>
      <input type="hidden" name="roomId" value={data?.currentRoomInfo?.roomId ?? ""}></input>
      <AutoInput fieldName="invitedUsers" manager={new AutoInputRoomInviteManager()} multiple={true} disabled={modalLoading}
        max={(data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length)} label={t("room.input.invite.label")}
        placeholder={t("room.input.invite.placeholder")} helpText={t("room.input.invite.help")} style={{maxWidth: "500px"}}
        required/>
      {
        userDisplay?.permissions?.includes(Permissions.CAN_MANAGE_ROOMS) && <>
        <Checkbox fieldName="force">{t("room.input.force_join.label")}</Checkbox>
        <Checkbox fieldName="forceExit">{t("room.input.force_exit.label")}</Checkbox>
        </>
      }
      <div className="horizontal-list gap-4mm">
        <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{tcommon("confirm")}</Button>
      </div>
    </DataForm>
    </>}
    </Modal>

    {/* Room invite accept */}
    <Modal title={t("room.messages.accept_invite.title")} className="gap-2mm" open={inviteAcceptModalOpen} busy={modalLoading} onClose={()=>{
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
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteAcceptModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button className="success" iconName={ICONS.CHECK} busy={modalLoading} onClick={()=>acceptInvite(currentInvitation.invitation.guestId)}>{tcommon("confirm")}</Button>
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
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteRefuseModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button iconName={ICONS.DO_NOT_DISTURB_ON} busy={modalLoading} onClick={()=>refuseInvite(currentInvitation.invitation.guestId)}>{t("room.actions.refuse")}</Button>
      </div>
      </>}
    </Modal>

    {/* Delete modal */}
    <Modal title={t("room.messages.confirm_delete.title")} icon={ICONS.DELETE} open={deleteModalOpen} onClose={()=>setDeleteModalOpen(false)} busy={modalLoading}>
    {data?.currentRoomInfo && <>
      <span className="descriptive small">{t.rich("room.messages.confirm_delete.description", {
        roomName: data.currentRoomInfo.roomName,
        room: (chunks) => <b className="highlight">{chunks}</b>
      })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setDeleteModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button className="success" iconName={ICONS.CHECK} busy={modalLoading} onClick={()=>deleteRoom(data.currentRoomInfo.roomId)}>{t("room.actions.delete")}</Button>
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
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setInviteCancelModalOpen(false)}>{tcommon("cancel")}</Button>      
        <div className="spacer"></div>
        <Button className="success" iconName={ICONS.CLOSE} busy={modalLoading} onClick={()=>cancelInvite(selectedGuest.roomGuest.guestId)}>{t("room.actions.revoke_invite")}</Button>
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
        <Button className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setKickModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button className="success" iconName={ICONS.CLOSE} busy={modalLoading} onClick={()=>kickGuest(selectedGuest.roomGuest.guestId)}>{t("room.actions.kick")}</Button>
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
        <Button iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setLeaveModalOpen(false)}>{tcommon("cancel")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CHECK} busy={modalLoading} onClick={()=>leaveRoom()}>{t("room.actions.leave")}</Button>
      </div>
    </>}
    </Modal>

    {/* Room buy modal */}
    <Modal icon={ICONS.BEDROOM_PARENT} open={buyModalOpen} title={data?.currentRoomInfo ? t("room.actions.upgrade_room") : t("room.actions.buy_a_room")} onClose={()=>setBuyModalOpen(false)} busy={modalLoading}>
      <RoomOrderFlow isOpen={buyModalOpen} modalLoading={modalLoading} setModalLoading={setModalLoading} close={()=>setBuyModalOpen(false)}></RoomOrderFlow>
    </Modal>

    {/* Room exchange modal */}
    <Modal icon={ICONS.SEND} open={exchangeModalOpen} title={t("room.actions.exchange_room")} onClose={()=>setExchangeModalOpen(false)} busy={modalLoading}>
      <DataForm action={new RoomExchangeFormAction} method="POST" loading={modalLoading} setLoading={setModalLoading} onSuccess={roomExchangeSuccess}
        onFail={commonFail} hideSave className="vertical-list gap-2mm" resetOnSuccess shouldReset={!exchangeModalOpen}>
        <input type="hidden" name="userId" value={userDisplay?.display?.userId ?? ""}></input>
        <AutoInput fieldName="recipientId" manager={new AutoInputRoomInviteManager()} multiple={false} disabled={modalLoading}
          label={t("room.input.exchange_user.label")} placeholder={t("room.input.exchange_user.placeholder")} style={{maxWidth: "500px"}}
          required/>
        <div className="horizontal-list gap-4mm">
          <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={modalLoading} onClick={()=>setExchangeModalOpen(false)}>{tcommon("cancel")}</Button>
          <div className="spacer"></div>
          <Button type="submit" className="success" iconName={ICONS.CHECK} busy={modalLoading}>{tcommon("confirm")}</Button>
        </div>
      </DataForm>
    </Modal>
  </>;
}
