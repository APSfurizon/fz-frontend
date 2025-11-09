'use client'
import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import { useEffect, useMemo, useState } from "react";
import useTitle from "@/components/hooks/useTitle";
import { useFormatter, useTranslations } from "next-intl";
import { BadgeStatusApiResponse, DeleteBadgeAction, BadgeDataChangeFormAction, GetBadgeStatusAction }
  from "@/lib/api/badge/badge";
import Upload from "@/components/input/upload";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import Modal from "@/components/modal";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { UploadBadgeAction } from "@/lib/api/badge/badge";
import ModalError from "@/components/modalError";
import { useUser } from "@/components/context/userProvider";
import { getFlagEmoji } from "@/lib/components/userPicture";
import AutoInput from "@/components/input/autoInput";
import { AutoInputCountriesManager } from "@/lib/api/geo";
import "@/styles/furpanel/badge.css";
import { AddFursuitFormAction, DeleteFursuitApiAction, EditFursuitFormAction, Fursuit } from "@/lib/api/badge/fursuits";
import Checkbox from "@/components/input/checkbox";
import { EMPTY_PROFILE_PICTURE_SRC, EVENT_NAME } from "@/lib/constants";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import Icon from "@/components/icon";

export default function BadgePage() {
  const t = useTranslations();
  const formatter = useFormatter();
  const { showModal, hideModal } = useModalUpdate();
  const { setUpdateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatusApiResponse | null | undefined>();
  const isEditExpired = useMemo(() =>
    badgeStatus && new Date(badgeStatus.badgeEditingDeadline).getTime() - Date.now() < 0, [badgeStatus]);

  // Main logic

  // Badge upload
  const uploadBadge = (blob?: Blob) => {
    if (!blob) return;
    const dataToUpload: FormData = new FormData();
    dataToUpload.append("image", blob);
    setLoading(true);
    runRequest(new UploadBadgeAction(), undefined, dataToUpload)
      .then(() => {
        setUpdateUser(true);
        setBadgeStatus(undefined);
      }).catch((err) => showModal(t("common.error"), <ModalError error={err} />))
      .finally(() => setLoading(false));
    setLoading(true);
  }

  // Badge deletion
  const promptBadgeDelete = () => {
    showModal(t("furpanel.badge.messages.confirm_deletion.title"),
      <div className="vertical-list gap-2mm">
        <span>{t("furpanel.badge.messages.confirm_deletion.description")}</span>
        <div className="horizontal-list">
          <Button type="button" className="danger" iconName={"CANCEL"}
            onClick={hideModal}>{t("common.cancel")}</Button>
          <div className="spacer"></div>
          <Button type="submit" className="success" iconName={"CHECK"}
            onClick={() => deleteBadge()}>{t("common.confirm")}</Button>
        </div>
      </div>,
      "DELETE"
    );
  }

  const deleteBadge = () => {
    hideModal();
    setLoading(true);
    runRequest(new DeleteBadgeAction())
      .then(() => {
        setUpdateUser(true);
        setBadgeStatus(undefined);
      }).catch((err) => showModal(t("common.error"), <ModalError error={err} />))
      .finally(() => setLoading(false));
  }

  // Change data
  const [changeDataModalOpen, setChangeDataModalOpen] = useState(false);

  const onChangeSuccess = () => {
    setUpdateUser(true);
    setBadgeStatus(undefined);
    setChangeDataModalOpen(false);
  }

  const onChangeFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => showModal(t("common.error"), <ModalError error={err} />);

  // Fursuits
  // Add fursuit
  const [addFursuitModalOpen, setAddFursuitModalOpen] = useState(false);
  const [fursuitBlob, setFursuitBlob] = useState<Blob>();
  const promptAddFursuit = () => {
    setAddFursuitModalOpen(true);
  }

  // Edit fursuit
  const [editMode, setEditMode] = useState(false);
  const [currentFursuit, setCurrentFursuit] = useState<Fursuit>();
  const [deleteFursuitImage, setDeleteFursuitImage] = useState(false);
  const promptEditFursuit = (f: Fursuit) => {
    setEditMode(true);
    setCurrentFursuit(f);
    setAddFursuitModalOpen(true);
  }

  const editFursuitFormData = (e: FormData): FormData => {
    e.append("image", fursuitBlob ?? '')
    if (editMode) {
      e.append("delete-image", "" + (deleteFursuitImage && !fursuitBlob))
    }
    return e;
  }

  const removeCurrentImage = () => {
    setDeleteFursuitImage(editMode);
    setFursuitBlob(undefined)
  }

  const closeAddFursuitModal = () => {
    setFursuitBlob(undefined);
    setAddFursuitModalOpen(false);
    setEditMode(false);
    setDeleteFursuitImage(false);
    setCurrentFursuit(undefined);
  }

  const onFursuitAddEditSuccess = () => {
    closeAddFursuitModal();
    setBadgeStatus(undefined);
  }

  const onFursuitAddEditFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    closeAddFursuitModal();
    onChangeFail(err);
  }

  // Delete fursuit
  const [deleteFursuitModalOpen, setDeleteFursuitModalOpen] = useState(false);

  const promptDeleteFursuit = (f: Fursuit) => {
    setCurrentFursuit(f);
    setDeleteFursuitModalOpen(true);
  }

  const deleteFursuit = () => {
    if (!currentFursuit) {
      closeDeleteFursuit();
      return;
    }
    setLoading(true);
    runRequest(new DeleteFursuitApiAction(), [String(currentFursuit.fursuit.id)])
      .then(() => {
        setBadgeStatus(undefined);
      }).catch((err) => showModal(t("common.error"), <ModalError error={err} />))
      .finally(() => {
        closeDeleteFursuit();
        setLoading(false);
      })
  }

  const closeDeleteFursuit = () => {
    setCurrentFursuit(undefined);
    setDeleteFursuitModalOpen(false);
  }

  // First load
  useEffect(() => {
    if (badgeStatus) return;
    setLoading(true);
    closeAddFursuitModal();
    closeDeleteFursuit();
    runRequest(new GetBadgeStatusAction())
      .then((data) => setBadgeStatus(data))
      .catch((err) => {
        showModal(t("common.error"), <ModalError error={err} />);
        setBadgeStatus(null);
      }).finally(() => setLoading(false));
  }, [badgeStatus]);

  useTitle("Badge");

  return <>
    <div className="page">
      {/* Badge deadline */}
      {badgeStatus?.badgeEditingDeadline && <>
        <NoticeBox theme={NoticeTheme.Warning}
          title={isEditExpired
            ? t("furpanel.badge.messages.badge_edit_deadline_end.title")
            : t("furpanel.badge.messages.badge_edit_deadline.title")}>
          {isEditExpired
            ? t(`furpanel.badge.messages.badge_edit_deadline_end.description`,
              { lockDate: formatter.dateTime(new Date(badgeStatus?.badgeEditingDeadline), { dateStyle: "medium" }) })
            : t(`furpanel.badge.messages.badge_edit_deadline.description`,
              { lockDate: formatter.dateTime(new Date(badgeStatus?.badgeEditingDeadline), { dateStyle: "medium" }) })
          }
        </NoticeBox>
      </>}
      <span className="title medium horizontal-list gap-2mm">
        {t("furpanel.badge.your_badges")}
        {loading && <Icon icon={"PROGRESS_ACTIVITY"} className="loading-animation"></Icon>}
      </span>
      {/* Generic badge */}
      <div className="badge-container gap-4mm">
        <div className="vertical-list flex-vertical-center">
          <DataForm hideSave loading={loading} setLoading={setLoading}>
            <Upload initialMedia={badgeStatus?.mainBadge?.propic} requireCrop busy={loading}
              setBlob={uploadBadge} onDelete={promptBadgeDelete} viewSize={130}
              readonly={!badgeStatus?.allowedModifications}>
            </Upload>
          </DataForm>
        </div>
        <div className="vertical-list gap-2mm">
          <div className="fursona-change rounded-m horizontal-list flex-vertical-center gap-2mm flex-wrap">
            <div className="vertical-list">
              <span className="title"><b>{t("furpanel.badge.name")}</b>: {badgeStatus?.mainBadge?.fursonaName}</span>
              <span className="title bold">
                <b>{t("furpanel.badge.locale")}</b>:&nbsp;
                {badgeStatus?.mainBadge?.locale && getFlagEmoji(badgeStatus?.mainBadge?.locale)}
              </span>
            </div>
            <div className="spacer"></div>
            <Button busy={loading} iconName={"EDIT_SQUARE"} onClick={() => setChangeDataModalOpen(true)}
              disabled={!badgeStatus?.allowedModifications}>
              {t("furpanel.badge.actions.edit_badge")}
            </Button>
          </div>
          <div className="spacer"></div>
          <NoticeBox theme={NoticeTheme.FAQ} title={t("furpanel.badge.messages.what_to_upload.title")}>
            {t("furpanel.badge.messages.what_to_upload.description")}
          </NoticeBox>
        </div>
      </div>
      {/* Fursuits */}
      <div className="fursuit-section rounded-m vertical-list gap-2mm">
        <div className="fursuit-header rounded-s horizontal-list flex-vertical-center gap-2mm flex-wrap">
          <Icon icon={"PETS"}></Icon>
          <span className="title average">
            {t("furpanel.badge.your_fursuits", { amount: badgeStatus?.fursuits.length ?? 0 })}
          </span>
          {loading && <Icon icon={"PROGRESS_ACTIVITY"} className="loading-animation"></Icon>}
          <div className="spacer"></div>
          <Button iconName={"ADD_CIRCLE"} title={t("common.CRUD.add")} onClick={promptAddFursuit}>
            {t("common.CRUD.add")}</Button>
        </div>
        <div className="fursuit-container flex-wrap gap-2mm ">
          {/* Fursuit badge rendering */}
          {badgeStatus?.fursuits.map((fursuitData: Fursuit, index: number) =>
            <div key={index} className="fursuit gap-2mm rounded-l">
              <div className="main-data gap-2mm">
                <Image unoptimized className="fursuit-image rounded-s" width={500} height={500} alt="" quality={100}
                  src={getImageUrl(fursuitData.fursuit.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}>
                </Image>
                <div className="details vertical-list gap-2mm">
                  <div className="vertical-list">
                    <span className="title average bold">{fursuitData.fursuit.name}</span>
                    <span className="title small color-subtitle">{fursuitData.fursuit.species}</span>
                    <hr></hr>
                  </div>
                  <div className="vertical-list gap-2mm">
                    {fursuitData.bringingToEvent && <span className="title tiny">
                      <Icon className="average" icon={"CHECK_CIRCLE"}></Icon>
                      {t("furpanel.badge.input.bring_to_event.label", { eventName: EVENT_NAME })}
                    </span>}
                    {fursuitData.showInFursuitCount && <span className="title tiny">
                      <Icon className="average" icon={"CHECK_CIRCLE"}></Icon>
                      {t("furpanel.badge.input.show_in_fursuit_count.label", { eventName: EVENT_NAME })}
                    </span>}
                    {fursuitData.showOwner && <span className="title tiny">
                      <Icon className="average" icon={"CHECK_CIRCLE"}></Icon>
                      {t("furpanel.badge.input.show_owner.label", { eventName: EVENT_NAME })}
                    </span>}
                  </div>
                </div>
              </div>
              <div className="spacer"></div>
              <div className="fursuit-actions gap-2mm">
                <Button className="danger" iconName={"DELETE"} busy={loading}
                  onClick={() => promptDeleteFursuit(fursuitData)}
                  title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", { name: fursuitData.fursuit.name })}
                  disabled={!badgeStatus.allowedModifications}>
                  {t("common.CRUD.delete")}
                </Button>
                <div className="spacer"></div>
                <Button iconName={"EDIT_SQUARE"} onClick={() => promptEditFursuit(fursuitData)}
                  busy={loading} title={t("furpanel.badge.actions.edit_fursuit", { name: fursuitData.fursuit.name })}
                  disabled={!badgeStatus.allowedModifications}>
                  {t("common.CRUD.edit")}
                </Button>
              </div>
            </div>)}
        </div>
        <NoticeBox theme={NoticeTheme.FAQ} title={t("furpanel.badge.messages.fursuit_badge.title")}>
          {t.rich("furpanel.badge.messages.fursuit_badge.description",
            {
              eventName: EVENT_NAME,
              maxFursuits: badgeStatus?.maxFursuits ?? 0,
              b: (chunks) => <b className="highlight">{chunks}</b>
            })}
        </NoticeBox>
      </div>
    </div>

    {/* Badge data edit modal */}
    <Modal title={t("furpanel.badge.actions.edit_badge")}
      open={changeDataModalOpen}
      onClose={() => setChangeDataModalOpen(false)}
      busy={loading}>
      <DataForm action={new BadgeDataChangeFormAction} loading={loading} setLoading={setLoading} hideSave
        className="gap-2mm" onFail={onChangeFail} onSuccess={onChangeSuccess} >
        <FpInput inputType="text"
          fieldName="fursonaName"
          initialValue={changeDataModalOpen ? badgeStatus?.mainBadge?.fursonaName : ""}
          label={t("furpanel.badge.input.new_name.label")}
          placeholder={t("furpanel.badge.input.new_name.placeholder")} />
        <AutoInput fieldName="locale" required={true} minDecodeSize={2}
          manager={new AutoInputCountriesManager}
          label={t("furpanel.badge.input.new_locale.label")}
          placeholder={t("furpanel.badge.input.new_locale.placeholder")}
          helpText={t("furpanel.badge.input.new_locale.help")}
          initialData={badgeStatus?.mainBadge?.locale ? [badgeStatus?.mainBadge?.locale] : undefined} />
        <div className="horizontal-list gap-4mm">
          <Button type="button" className="danger" iconName={"CANCEL"} busy={loading}
            onClick={() => setChangeDataModalOpen(false)}>{t("common.cancel")}</Button>
          <div className="spacer"></div>
          <Button type="submit" className="success" iconName={"CHECK"} busy={loading}>
            {t("common.confirm")}</Button>
        </div>
      </DataForm>
    </Modal>

    {/* Add / Edit fursuit modal */}
    <Modal title={editMode
      ? t("furpanel.badge.actions.edit_fursuit", { name: currentFursuit?.fursuit.name })
      : t("furpanel.badge.actions.add_fursuit")}
      open={addFursuitModalOpen}
      onClose={closeAddFursuitModal}
      busy={loading}>
      <DataForm action={editMode ? new EditFursuitFormAction : new AddFursuitFormAction}
        restPathParams={editMode ? ["" + currentFursuit?.fursuit.id, "update-with-image"] : undefined}
        loading={loading}
        setLoading={setLoading}
        editFormData={editFursuitFormData}
        hideSave
        className="gap-2mm"
        onFail={onFursuitAddEditFail}
        onSuccess={onFursuitAddEditSuccess}
        shouldReset={!addFursuitModalOpen}
        resetOnSuccess>
        <Upload initialMedia={editMode ?
          deleteFursuitImage
            ? undefined
            : currentFursuit?.fursuit.propic
          : undefined}
          requireCrop
          setBlob={setFursuitBlob} onDelete={removeCurrentImage}
          label={t("furpanel.badge.input.fursuit_image.label")}
          helpText={t("furpanel.badge.input.fursuit_image.help")} />
        <FpInput inputType="text"
          fieldName="name"
          initialValue={editMode ? currentFursuit?.fursuit.name : ""}
          label={t("furpanel.badge.input.fursuit_name.label")}
          placeholder={t("furpanel.badge.input.fursuit_name.placeholder")} />
        <FpInput inputType="text"
          fieldName="species"
          initialValue={editMode ? currentFursuit?.fursuit.species : ""}
          label={t("furpanel.badge.input.fursuit_species.label")}
          placeholder={t("furpanel.badge.input.fursuit_species.placeholder")} />
        <Checkbox fieldName="bring-to-current-event"
          disabled={!(editMode && currentFursuit?.bringingToEvent) &&
            !badgeStatus?.canBringFursuitsToEvent ||
            !badgeStatus?.allowEditBringFursuitToEvent}
          initialValue={editMode ? currentFursuit?.bringingToEvent : false}>
          {t("furpanel.badge.input.bring_to_event.label", { eventName: EVENT_NAME })}
        </Checkbox>
        <Checkbox fieldName="show-in-fursuit-count"
          initialValue={editMode ? currentFursuit?.showInFursuitCount : true}>
          {t("furpanel.badge.input.show_in_fursuit_count.label", { eventName: EVENT_NAME })}
        </Checkbox>
        <Checkbox fieldName="show-owner"
          initialValue={editMode ? currentFursuit?.showOwner : true}>
          {t("furpanel.badge.input.show_owner.label", { eventName: EVENT_NAME })}
        </Checkbox>
        <div className="horizontal-list gap-4mm margin-top-2mm">
          <Button type="button" className="danger" iconName={"CANCEL"} busy={loading}
            onClick={closeAddFursuitModal}>
            {t("common.cancel")}
          </Button>
          <div className="spacer"></div>
          <Button type="submit" className="success" iconName={"CHECK"} busy={loading}>
            {t("common.confirm")}</Button>
        </div>
      </DataForm>
    </Modal>
    <Modal open={deleteFursuitModalOpen} onClose={closeDeleteFursuit}
      title={t("furpanel.badge.messages.confirm_fursuit_deletion.title",
        { name: currentFursuit?.fursuit.name })
      } busy={loading}>
      <span>
        {t("furpanel.badge.messages.confirm_fursuit_deletion.description", { name: currentFursuit?.fursuit.name })}
      </span>
      <div className="horizontal-list gap-4mm">
        <Button className="danger" iconName={"CANCEL"} busy={loading} onClick={closeDeleteFursuit}>
          {t("common.cancel")}</Button>
        <div className="spacer"></div>
        <Button className="success" iconName={"CHECK"} busy={loading} onClick={deleteFursuit}>
          {t("common.confirm")}</Button>
      </div>
    </Modal>
  </>;
}
