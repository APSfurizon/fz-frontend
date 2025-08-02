'use client'
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import Button from "@/components/input/button";
import Icon from "@/components/icon";
import { useEffect, useMemo, useState } from "react";
import useTitle from "@/components/hooks/useTitle";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { useModalUpdate } from "@/components/context/modalProvider";
import Modal from "@/components/modal";
import RoomInvite from "@/components/room/roomInvite";
import {
  EMPTY_ROOM_INFO,
  GuestIdApiData, RoomConfirmAction, RoomCreateApiAction, RoomCreateData,
  RoomDeleteAction, RoomEditData, RoomExchangeFormAction, RoomGuestHeader,
  RoomInfoApiAction, RoomInfoResponse, RoomInvitation, RoomInviteAnswerAction,
  RoomInviteFormAction, RoomKickAction, RoomLeaveAction, RoomRenameFormAction,
  RoomSetShowInNosecountApiAction, RoomSetShowInNosecountData,
  RoomUnconfirmAction
} from "@/lib/api/room";
import UserPicture from "@/components/userPicture";
import StatusBox from "@/components/statusBox";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import AutoInput from "@/components/input/autoInput";
import "@/styles/furpanel/room.css";
import { useUser } from "@/components/context/userProvider";
import { OrderStatus } from "@/lib/api/order";
import ModalError from "@/components/modalError";
import { translate } from "@/lib/translations";
import { AutoInputRoomInviteManager } from "@/lib/api/user";
import Checkbox from "@/components/input/checkbox";
import RoomOrderFlow from "@/components/room/roomOrderFlow";
import { Permissions } from "@/lib/api/permission";
import ToolLink from "@/components/toolLink";
import LoadingPanel from "@/components/loadingPanel";
import { cssClass } from "@/lib/utils";

export default function RoomPage() {
  const t = useTranslations();
  const formatter = useFormatter();
  const locale = useLocale();
  const { userDisplay, userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const { showModal } = useModalUpdate();
  useTitle(t("furpanel.room.title"));

  // Room related states
  /* Room data */
  const [data, setData] = useState<RoomInfoResponse>();
  const isEditExpired = useMemo(() => data && new Date(data.editingRoomEndTime ?? "0").getTime() - Date.now() < 0,
    [data]);

  /************************/
  /** Room editing logic **/
  /************************/

  // Room creation
  const createRoom = () => {
    if (userLoading) return;
    const roomName = t("furpanel.room.default_name", { name: userDisplay?.display?.fursonaName }).substring(0, 63);
    const roomData: RoomCreateData = {
      name: roomName
    };

    setActionLoading(true);

    runRequest(new RoomCreateApiAction(), undefined, roomData)
      .then((data) => { if (data.roomId) setData(undefined); })
      .catch((err) => commonFail(err))
      .finally(() => setActionLoading(false));
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
    runRequest(new RoomDeleteAction(), undefined, roomData)
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
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
    runRequest(new RoomInviteAnswerAction(), ["accept"], guestData)
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
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
    runRequest(new RoomInviteAnswerAction(), ["refuse"], guestData)
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
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
    runRequest(new RoomInviteAnswerAction(), ["cancel"], guestData)
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
  }

  const kickGuest = (guestId: number) => {
    const guestData: GuestIdApiData = {
      guestId: guestId
    };
    setModalLoading(true);
    runRequest(new RoomKickAction(), undefined, guestData)
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
  }

  // leave room modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const promptRoomLeave = () => {
    if (!data) return;
    setLeaveModalOpen(true);
  }

  const leaveRoom = () => {
    setModalLoading(true);
    runRequest(new RoomLeaveAction())
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
  }

  // Room buy modal
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  // exchange room modal
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);

  const promptRoomExchange = () => {
    if (!data) return;
    setExchangeModalOpen(true);
  }

  const roomExchangeSuccess = () => {
    const successBody = <span>
      {t("furpanel.room.messages.exchange_invite_sent.description")}
    </span>;
    showModal(t("furpanel.room.messages.exchange_invite_sent.title"), successBody, "CHECK_CIRCLE");
    commonSuccess();
  }

  // confirm room modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const promptRoomConfirm = () => {
    if (!data) return;
    setConfirmModalOpen(true);
  }

  const confirmRoom = () => {
    setModalLoading(true);
    runRequest(new RoomConfirmAction())
      .then(() => commonSuccess())
      .catch((err) => commonFail(err))
      .finally(() => setModalLoading(false));
  }

  // un-confirm room modal
  const [unconfirmModalOpen, setUnconfirmModalOpen] = useState(false);

  const promptRoomUnconfirm = () => {
    if (!data) return;
    setUnconfirmModalOpen(true);
  }

  const unconfirmRoom = () => {
  setModalLoading(true);
  runRequest(new RoomUnconfirmAction())
    .then(() => commonSuccess())
    .catch((err) => commonFail(err))
    .finally(() => setModalLoading(false));
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
      .then(() => setShowInNosecount(newValue))
      .catch((err) => commonFail(err))
      .finally(() => setLoading(false));
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
    setConfirmModalOpen(false);
    setUnconfirmModalOpen(false);
    setData(undefined);
  }

  const commonFail = (err: ApiErrorResponse | ApiDetailedErrorResponse,
    translationRoot?: string, translationKey?: string) => {
      setRenameModalOpen(false);
      setDeleteModalOpen(false);
      setInviteModalOpen(false);
      setInviteAcceptModalOpen(false);
      setInviteRefuseModalOpen(false);
      setInviteCancelModalOpen(false);
      setKickModalOpen(false);
      setLeaveModalOpen(false);
      setExchangeModalOpen(false);
      setConfirmModalOpen(false);
      setUnconfirmModalOpen(false);
      showModal(
        t("common.error"),
        <ModalError error={err}
          translationRoot={translationRoot ?? "furpanel"}
          translationKey={translationKey ?? "room.errors"}/>
      );
  }

  // Data loading
  useEffect(() => {
    if (data) return;
    setLoading(true);
    runRequest(new RoomInfoApiAction())
      .then(result => {
        setShowInNosecount(result.currentRoomInfo?.showInNosecount);
        setData(result);
      }).catch((err) => {
        showModal(
          t("common.error"),
          <ModalError error={err}
            translationRoot="furpanel"
            translationKey="room.errors"/>);
          setData(EMPTY_ROOM_INFO);
        }).finally(() => setLoading(false));
  }, [data]);

  /********************/
  /** Page Rendering **/
  /********************/

  return <>
    <div className="page">
      {/* Room deadline */}
      {data?.editingRoomEndTime && <>
        <NoticeBox theme={NoticeTheme.Warning}
          title={isEditExpired 
            ? t("furpanel.room.messages.room_edit_deadline_end.title")
            : t("furpanel.room.messages.room_edit_deadline.title")}>
          {isEditExpired
            ? t(`furpanel.room.messages.room_edit_deadline_end.description`,
              { lockDate: formatter.dateTime(new Date(data?.editingRoomEndTime), { dateStyle: "medium" }) })
            : t(`furpanel.room.messages.room_edit_deadline.description`,
              { lockDate: formatter.dateTime(new Date(data?.editingRoomEndTime), { dateStyle: "medium" }) })
          }
        </NoticeBox>
      </>}


      {/* Your room */}
      <div className="actions-panel rounded-m vertical-list gap-2mm">
        <span className="title small horizontal-list gap-2mm flex-vertical-center flex-wrap">
          <Icon icon={"BEDROOM_PARENT"}></Icon>
          {t("furpanel.room.your_room")}
          <div className="spacer"></div>
          {data?.currentRoomInfo?.userIsOwner &&
            <Button iconName={!showInNosecount ? "VISIBILITY" : "VISIBILITY_OFF"}
              title={!showInNosecount
                ? t("furpanel.room.actions.show_in_nosecount")
                : t("furpanel.room.actions.hide_in_nosecount")}
              debounce={500} onClick={() => setVisibility(!showInNosecount)}
              disabled={!data?.allowedModifications}>
            </Button>}
          {data && data.currentRoomInfo && !!data.buyOrUpgradeRoomSupported && !!data.canBuyOrUpgradeRoom &&
            <Button iconName={"SHOPPING_CART"} busy={actionLoading} onClick={() => setBuyModalOpen(true)}>
              {t("furpanel.room.actions.upgrade_room")}
            </Button>
          }
          <Button iconName={"REFRESH"}
            title={t("common.reload")}
            onClick={() => setData(undefined)}
            debounce={3000}/>
        </span>

        {/* Loading */}
        {loading && <LoadingPanel />}

        {/* View when user has no room */}
        {data && !data.currentRoomInfo && <>
          <div className="room-invite actions-panel rounded-m">
            <span className="title small horizontal-list gap-2mm flex-vertical-center">
              <Icon icon={"BEDROOM_PARENT"}></Icon>
              {data.canCreateRoom ? t("furpanel.room.can_create") : t("furpanel.room.no_room")}
            </span>
            <div className="horizontal-list flex-center flex-vertical-center gap-4mm flex-wrap"
              style={{ marginTop: "1em" }}>
              {data.canCreateRoom == true
                ? <>
                  <Button iconName={"ADD_CIRCLE"}
                    busy={actionLoading}
                    onClick={() => createRoom()}>
                      {t("furpanel.room.actions.create_a_room")}
                  </Button>
                  <span className="title small">{t("furpanel.room.or")}</span>
                  <Button iconName={"SHOPPING_CART"}
                    busy={actionLoading}
                    disabled={!data.buyOrUpgradeRoomSupported || !data.canBuyOrUpgradeRoom || !data.hasOrder}
                    onClick={() => setBuyModalOpen(true)}>
                      {t("furpanel.room.actions.upgrade_room")}
                  </Button>
                  {data.exchangeSupported && <>
                  <span className="title small">{t("furpanel.room.or")}</span>
                  <Button className="danger" iconName={"SEND"} onClick={() => promptRoomExchange()}
                    disabled={!!data && !data.canExchange}>{t("furpanel.room.actions.exchange")}</Button>
                    </>}
                </>
                : data.hasOrder
                  ? <>
                    <Button iconName={"SHOPPING_CART"}
                      busy={actionLoading}
                      disabled={!data.buyOrUpgradeRoomSupported || !data.canBuyOrUpgradeRoom || !data.hasOrder}
                      onClick={() => setBuyModalOpen(true)}>
                        {t("furpanel.room.actions.buy_a_room")}
                    </Button>
                    <span className="title small">
                      {t("furpanel.room.or_get_invited")}
                    </span>
                  </>
                  : <>
                    <span>{t("furpanel.room.no_order")}</span>
                    <ToolLink href={"/booking"}
                      iconName={"LOCAL_ACTIVITY"}
                      className="active">
                        {t("furpanel.booking.title")}
                    </ToolLink>
                  </>
              }
            </div>
          </div>
        </>}

        {/* Room data */}
        {data?.currentRoomInfo && <>
          <div className="room-invite vertical-list gap-4mm rounded-s">
            <span className="invite-title semibold title small horizontal-list flex-vertical-center gap-2mm">
              <Icon icon={"BED"}></Icon>
              <span className="limit-view">{data?.currentRoomInfo.roomName}</span>
              <div className="spacer" style={{ flexGrow: "300" }}></div>
              {
                data.currentRoomInfo.userIsOwner && <>
                  <div className="actions-container horizontal-list flex-wrap gap-4mm flex-space-between"
                    style={{ flexGrow: "1" }}>
                    <Button iconName={"EDIT_SQUARE"}
                      onClick={() => promptRoomRename()}
                      disabled={!data.allowedModifications}>
                        {t("furpanel.room.actions.rename")}
                    </Button>
                    <Button className="danger"
                      iconName={"DELETE"}
                      onClick={() => promptRoomDelete()}
                      disabled={!data.allowedModifications}>
                        {t("furpanel.room.actions.delete")}
                    </Button>
                  </div>
                </>
              }

            </span>
            {/* Room guests */}
            <div className="room-guests horizontal-list gap-4mm flex-center flex-space-evenly">
              {data?.currentRoomInfo.guests.map((guest, key) => <div key={key}
                className={"guest-container vertical-list gap-2mm"
                  + cssClass({"invited": !!!guest.roomGuest.confirmed})}>
                <UserPicture size={64} userData={guest.user} showNickname showFlag/>
                {data.currentRoomInfo.roomOwner.userId === guest.user.userId && <StatusBox>
                  {t("furpanel.room.status_owner")}
                </StatusBox>}
                {[OrderStatus.CANCELED, OrderStatus.EXPIRED, OrderStatus.PENDING].includes(guest.orderStatus) &&
                  <StatusBox status="warning">{t(`common.order_status.${guest.orderStatus}`)}</StatusBox>
                }
                {guest.roomGuest.confirmed === false &&
                  <StatusBox status="warning">{t("furpanel.room.status_invited")}</StatusBox>
                }

                {data.currentRoomInfo.userIsOwner && guest.user.userId !== data.currentRoomInfo.roomOwner.userId && 
                  data.allowedModifications && <>
                    <a className="action-kick" href="#" onClick={() => {
                      if (guest.roomGuest.confirmed)
                        promptKickGuest(guest);
                      else
                        promptCancelInvite(guest)
                    }}>
                      <Icon className="medium" icon={"CLOSE"}></Icon>
                    </a>
                  </>}
              </div>)}
            </div>
            <div className="invite-toolbar horizontal-list gap-4mm">
              {Object.keys (data.currentRoomInfo.roomData.roomTypeNames).length > 0
                && <StatusBox>
                    {translate(data.currentRoomInfo.roomData.roomTypeNames, locale)}
              </StatusBox>}
              <StatusBox>
                {t("furpanel.room.room_number_left",
                  { size: data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length })}
              </StatusBox>
              {data.currentRoomInfo.extraDays !== "NONE" && <StatusBox status={"normal"}>
                {t("furpanel.booking.items.extra_days")}:&nbsp;
                {t(`furpanel.booking.items.extra_days_${data.currentRoomInfo.extraDays}`)}
              </StatusBox>}
              <div className="spacer" style={{ flexGrow: "300" }}></div>
              <div className="horizontal-list flex-space-between gap-4mm" style={{ flexGrow: "1" }}>
                {data.currentRoomInfo.userIsOwner ? <>
                  {/* Owner actions */}
                  <Button iconName={"PERSON_ADD"} disabled={!data.currentRoomInfo.canInvite}
                    onClick={() => promptRoomInvite()}>{t("furpanel.room.actions.invite")}</Button>
                  {data.currentRoomInfo.confirmationSupported &&
                    !data.currentRoomInfo.confirmed &&
                    <Button iconName={"CHECK_CIRCLE"}
                      disabled={!data.currentRoomInfo.canConfirm}
                      onClick={() => promptRoomConfirm()}>
                        {t("furpanel.room.actions.confirm_room")}
                    </Button>}
                  {data.currentRoomInfo.unconfirmationSupported &&
                    data.currentRoomInfo.confirmed &&
                    <Button iconName={"CANCEL"}
                      disabled={!data.currentRoomInfo.canUnconfirm}
                      onClick={() => promptRoomUnconfirm()}>
                        {t("furpanel.room.actions.unconfirm_room")}
                    </Button>}
                  {data.exchangeSupported && <Button className="danger"
                    iconName={"SEND"}
                    onClick={() => promptRoomExchange()}
                    disabled={!!data && !data.canExchange}>
                      {t("furpanel.room.actions.exchange")}
                  </Button>}
                </> : <>
                  {/* Guest actions */}
                  <Button iconName={"DOOR_OPEN"}
                    onClick={() => promptRoomLeave()}>
                      {t("furpanel.room.actions.leave")}
                  </Button>
                </>}
              </div>
            </div>
          </div>
        </>}
      </div>


      {/* Invites */}
      {data?.invitations && data.invitations.length > 0 && <>
        <div className="actions-panel rounded-m vertical-list gap-2mm">
          <span className="title small horizontal-list gap-2mm flex-vertical-center">
            <Icon icon={"MAIL"}></Icon>
            {t("furpanel.room.invite.header", { amount: 1 })}
          </span>
          {
            data?.invitations?.map((invite, index) => <RoomInvite key={index} inviteData={invite}
              busy={loading} onAccept={promptAcceptInvite} onReject={promptRefuseInvite}></RoomInvite>)
          }
        </div>
      </>}
    </div>

    {/* Rename modal */}
    <Modal title={t("furpanel.room.actions.rename")}
      icon={"EDIT_SQUARE"} open={renameModalOpen}
      onClose={() => setRenameModalOpen(false)} busy={modalLoading}>
        {data?.currentRoomInfo && <>
          <DataForm action={new RoomRenameFormAction}
            loading={modalLoading}
            setLoading={setModalLoading}
            onSuccess={commonSuccess}
            onFail={commonFail}
            hideSave
            className="vertical-list gap-2mm"
            resetOnSuccess>
              <input type="hidden" name="roomId" value={data?.currentRoomInfo?.roomId ?? ""}/>
              <FpInput inputType="text"
                fieldName="name"
                required
                label={t("furpanel.room.input.rename_new_name.label")}
                placeholder={t("furpanel.room.input.rename_new_name.placeholder")}
                minLength={2}
                maxLength={254}/>
              <div className="horizontal-list gap-4mm">
                <Button type="button"
                  className="danger"
                  iconName={"CANCEL"}
                  busy={modalLoading}
                  onClick={() => setRenameModalOpen(false)}>
                    {t("common.cancel")}
                </Button>
                <div className="spacer"/>
                <Button type="submit"
                  className="success"
                  iconName={"CHECK"}
                  busy={modalLoading}>
                    {t("common.confirm")}
                </Button>
              </div>
          </DataForm>
        </>}
    </Modal>

    {/* Invite modal */}
    <Modal title={t("furpanel.room.actions.invite")}
      icon={"PERSON_ADD"}
      open={inviteModalOpen}
      onClose={() => setInviteModalOpen(false)}
      busy={modalLoading}>
        {data?.currentRoomInfo && <>
          <DataForm action={new RoomInviteFormAction}
            loading={modalLoading}
            setLoading={setModalLoading}
            onSuccess={commonSuccess}
            onFail={commonFail}
            hideSave
            className="vertical-list gap-2mm"
            resetOnSuccess
            shouldReset={!inviteModalOpen}>
              <input type="hidden"
                name="roomId"
                value={data?.currentRoomInfo?.roomId ?? ""}/>
              <AutoInput fieldName="invitedUsers"
                manager={new AutoInputRoomInviteManager()}
                multiple={true}
                disabled={modalLoading}
                max={(data.currentRoomInfo.roomData.roomCapacity - data.currentRoomInfo.guests.length)}
                label={t("furpanel.room.input.invite.label")}
                placeholder={t("furpanel.room.input.invite.placeholder")}
                helpText={t("furpanel.room.input.invite.help")}
                style={{ maxWidth: "500px" }}
                required/>
              {
                userDisplay?.permissions?.includes(Permissions.CAN_MANAGE_ROOMS) && <>
                  <Checkbox fieldName="force">{t("furpanel.room.input.force_join.label")}</Checkbox>
                  <Checkbox fieldName="forceExit">{t("furpanel.room.input.force_exit.label")}</Checkbox>
                </>
              }
              <div className="horizontal-list gap-4mm">
                <Button type="button"
                  className="danger"
                  iconName={"CANCEL"}
                  busy={modalLoading}
                  onClick={() => setInviteModalOpen(false)}>
                    {t("common.cancel")}
                </Button>
                <div className="spacer"/>
                <Button type="submit"
                  className="success"
                  iconName={"CHECK"}
                  busy={modalLoading}>
                    {t("common.confirm")}
                </Button>
              </div>
          </DataForm>
        </>}
    </Modal>

    {/* Room invite accept */}
    <Modal title={t("furpanel.room.messages.accept_invite.title")}
      className="gap-2mm"
      open={inviteAcceptModalOpen}
      busy={modalLoading}
      onClose={() => {
        setInviteAcceptModalOpen(false);
        setCurrentInvitation(undefined);
    }}>
      {currentInvitation && <>
        <span className="descriptive small">
          {t.rich("furpanel.room.messages.accept_invite.description", {
            nickname: currentInvitation.room.roomOwner.fursonaName,
            roomName: currentInvitation.room.roomName,
            room: (chunks) => <b className="highlight">{chunks}</b>
          })}
        </span>
        <div className="horizontal-list gap-4mm">
          <Button className="danger"
            iconName={"CANCEL"}
            busy={modalLoading}
            onClick={() => setInviteAcceptModalOpen(false)}>
              {t("common.cancel")}
          </Button>
          <div className="spacer"/>
          <Button className="success"
            iconName={"CHECK"}
            busy={modalLoading}
            onClick={() => acceptInvite(currentInvitation.invitation.guestId)}>
              {t("common.confirm")}
          </Button>
        </div>
      </>}
    </Modal>

    {/* Room invite refuse */}
    <Modal title={t("furpanel.room.messages.refuse_invite.title")}
      open={inviteRefuseModalOpen}
      busy={modalLoading}
      onClose={() => {
        setInviteRefuseModalOpen(false);
        setCurrentInvitation(undefined);
    }}>
      {currentInvitation && <>
        <span className="descriptive small">
          {t.rich("furpanel.room.messages.refuse_invite.description", {
            nickname: currentInvitation.room.roomOwner.fursonaName,
            roomName: currentInvitation.room.roomName,
            room: (chunks) => <b className="highlight">{chunks}</b>
          })}
        </span>
        <div className="horizontal-list gap-4mm">
          <Button className="danger"
            iconName={"CANCEL"}
            busy={modalLoading}
            onClick={() => setInviteRefuseModalOpen(false)}>
              {t("common.cancel")}
          </Button>
          <div className="spacer"/>
          <Button iconName={"DO_NOT_DISTURB_ON"}
            busy={modalLoading}
            onClick={() => refuseInvite(currentInvitation.invitation.guestId)}>
              {t("furpanel.room.actions.refuse")}
          </Button>
        </div>
      </>}
    </Modal>

    {/* Delete modal */}
    <Modal title={t("furpanel.room.messages.confirm_delete.title")}
      icon={"DELETE"}
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      busy={modalLoading}>
        {data?.currentRoomInfo && <>
          <span className="descriptive small">{t.rich("furpanel.room.messages.confirm_delete.description", {
            roomName: data.currentRoomInfo.roomName,
            room: (chunks) => <b className="highlight">{chunks}</b>
          })}
          </span>
          <div className="horizontal-list gap-4mm">
            <Button className="danger"
              iconName={"CANCEL"}
              busy={modalLoading}
              onClick={() => setDeleteModalOpen(false)}>
                {t("common.cancel")}
            </Button>
            <div className="spacer"></div>
            <Button className="success"
              iconName={"CHECK"}
              busy={modalLoading}
              onClick={() => deleteRoom(data.currentRoomInfo.roomId)}>
                {t("furpanel.room.actions.delete")}
            </Button>
          </div>
        </>}
    </Modal>

    {/* Cancel invite modal */}
    <Modal title={t("furpanel.room.messages.confirm_invite_cancel.title")} open={inviteCancelModalOpen}
      onClose={() => { setSelectedGuest(undefined); setInviteCancelModalOpen(false); }} busy={modalLoading}>
      {selectedGuest && data?.currentRoomInfo && <>
        <span className="descriptive small">{t("furpanel.room.messages.confirm_invite_cancel.description", {
          guestName: selectedGuest.user.fursonaName
        })}
        </span>
        <div className="horizontal-list gap-4mm">
          <Button className="danger"
            iconName={"CANCEL"}
            busy={modalLoading}
            onClick={() => setInviteCancelModalOpen(false)}>
              {t("common.cancel")}
          </Button>
          <div className="spacer"></div>
          <Button className="success"
            iconName={"CLOSE"}
            busy={modalLoading}
            onClick={() => cancelInvite(selectedGuest.roomGuest.guestId)}>
              {t("furpanel.room.actions.revoke_invite")}
          </Button>
        </div>
      </>}
    </Modal>

    {/* Kick guest modal */}
    <Modal title={t("furpanel.room.messages.confirm_kick.title")} open={kickModalOpen}
      onClose={() => { setSelectedGuest(undefined); setKickModalOpen(false); }} busy={modalLoading}>
      {selectedGuest && data?.currentRoomInfo && <>
        <span className="descriptive small">{t("furpanel.room.messages.confirm_kick.description", {
          guestName: selectedGuest.user.fursonaName
        })}
        </span>
        <div className="horizontal-list gap-4mm">
          <Button className="danger"
            iconName={"CANCEL"}
            busy={modalLoading}
            onClick={() => setKickModalOpen(false)}>
              {t("common.cancel")}
          </Button>
          <div className="spacer"></div>
          <Button className="success"
            iconName={"CLOSE"}
            busy={modalLoading}
            onClick={() => kickGuest(selectedGuest.roomGuest.guestId)}>
              {t("furpanel.room.actions.kick")}
          </Button>
        </div>
      </>}
    </Modal>

    {/* Leave modal */}
    <Modal title={t("furpanel.room.messages.confirm_leave.title")}
      open={leaveModalOpen}
      onClose={() => setLeaveModalOpen(false)}
      busy={modalLoading}>
        {data?.currentRoomInfo && <>
          <span className="descriptive small">{t.rich("furpanel.room.messages.confirm_leave.description", {
            roomName: data.currentRoomInfo.roomName,
            room: (chunks) => <b className="highlight">{chunks}</b>
          })}
          </span>
          <div className="horizontal-list gap-4mm">
            <Button iconName={"CANCEL"}
              busy={modalLoading}
              onClick={() => setLeaveModalOpen(false)}>
                {t("common.cancel")}
            </Button>
            <div className="spacer"/>
            <Button className="danger"
              iconName={"CHECK"}
              busy={modalLoading}
              onClick={() => leaveRoom()}>
                {t("furpanel.room.actions.leave")}
            </Button>
          </div>
        </>}
    </Modal>

    {/* Room buy modal */}
    <Modal icon={"BEDROOM_PARENT"}
      open={buyModalOpen}
      title={data?.currentRoomInfo ? t("furpanel.room.actions.upgrade_room") : t("furpanel.room.actions.buy_a_room")}
      onClose={() => setBuyModalOpen(false)} busy={modalLoading}>
        <RoomOrderFlow isOpen={buyModalOpen}
          modalLoading={modalLoading}
          setModalLoading={setModalLoading}
          close={() => setBuyModalOpen(false)}/>
    </Modal>

    {/* Room exchange modal */}
    <Modal icon={"SEND"}
      open={exchangeModalOpen}
      title={t("furpanel.room.actions.exchange_room")}
      onClose={() => setExchangeModalOpen(false)}
      busy={modalLoading}>
        <DataForm action={new RoomExchangeFormAction}
          loading={modalLoading}
          setLoading={setModalLoading}
          onSuccess={roomExchangeSuccess}
          onFail={commonFail}
          hideSave
          className="vertical-list gap-2mm"
          resetOnSuccess
          shouldReset={!exchangeModalOpen}>
            <input type="hidden"
              name="userId"
              value={userDisplay?.display?.userId ?? ""}/>
            <AutoInput fieldName="recipientId"
              manager={new AutoInputRoomInviteManager()}
              multiple={false}
              disabled={modalLoading}
              label={t("furpanel.room.input.exchange_user.label")}
              placeholder={t("furpanel.room.input.exchange_user.placeholder")}
              style={{ maxWidth: "500px" }}
              required/>
            <div className="horizontal-list gap-4mm">
              <Button type="button"
                className="danger"
                iconName={"CANCEL"}
                busy={modalLoading}
                onClick={() => setExchangeModalOpen(false)}>
                  {t("common.cancel")}
              </Button>
              <div className="spacer"></div>
              <Button type="submit"
                className="success"
                iconName={"CHECK"}
                busy={modalLoading}>
                  {t("common.confirm")}
              </Button>
            </div>
        </DataForm>
    </Modal>

    {/* Room confirm modal */}
    <Modal icon={"CHECK_CIRCLE"}
      open={confirmModalOpen}
      title={t("furpanel.room.actions.confirm_room")}
      onClose={() => setConfirmModalOpen(false)}
      busy={modalLoading}>
        {data?.currentRoomInfo && <>
          <span className="descriptive small">
            {t.rich("furpanel.room.messages.confirm_confirmation.description", {
              roomName: data.currentRoomInfo.roomName,
              room: (chunks) => <b className="highlight">{chunks}</b>
            })}
          </span>
          <div className="horizontal-list gap-4mm">
            <Button iconName={"CANCEL"}
              busy={modalLoading}
              onClick={() => setConfirmModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <div className="spacer"/>
            <Button className="success"
              iconName={"CHECK"}
              busy={modalLoading}
              onClick={() => confirmRoom()}>
                {t("furpanel.room.actions.confirm_room")}
            </Button>
          </div>
        </>}
    </Modal>

    {/* Room unconfirm modal */}
    <Modal icon={"CHECK_CIRCLE"}
      open={unconfirmModalOpen}
      title={t("furpanel.room.actions.confirm_room")}
      onClose={() => setUnconfirmModalOpen(false)}
      busy={modalLoading}>
        {data?.currentRoomInfo && <>
          <span className="descriptive small">
            {t.rich("furpanel.room.messages.confirm_unconfirmation.description", {
              roomName: data.currentRoomInfo.roomName,
              room: (chunks) => <b className="highlight">{chunks}</b>
            })}
          </span>
          <div className="horizontal-list gap-4mm">
            <Button iconName={"CANCEL"}
              busy={modalLoading}
              onClick={() => setUnconfirmModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <div className="spacer"/>
            <Button className="danger"
              iconName={"CHECK"}
              busy={modalLoading}
              onClick={() => unconfirmRoom()}>
                {t("furpanel.room.actions.unconfirm_room")}
            </Button>
          </div>
        </>}
    </Modal>
  </>;
}
