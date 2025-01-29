'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useFormatter, useTranslations } from "next-intl";
import { BadgeStatusApiResponse, DeleteBadgeAction, BadgeDataChangeFormAction, GetBadgeStatusAction } from "@/app/_lib/api/badge/badge";
import Upload from "@/app/_components/upload";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import StatusBox from "@/app/_components/statusBox";
import Modal from "@/app/_components/modal";
import DataForm from "@/app/_components/dataForm";
import JanInput from "@/app/_components/janInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import { UploadBadgeAction } from "@/app/_lib/api/badge/badge";
import ModalError from "@/app/_components/modalError";
import { useUser } from "@/app/_lib/context/userProvider";
import { getFlagEmoji } from "@/app/_lib/components/userPicture";
import AutoInput from "@/app/_components/autoInput";
import { AutoInputCountriesManager } from "@/app/_lib/components/autoInput";
import "../../../../styles/furpanel/badge.css";
import { AddFursuitFormAction, DeleteFursuitApiAction, EditFursuitFormAction, Fursuit } from "@/app/_lib/api/badge/fursuits";
import Checkbox from "@/app/_components/checkbox";
import { EMPTY_PROFILE_PICTURE_SRC, EVENT_NAME } from "@/app/_lib/constants";
import Image from "next/image";
import { getImageUrl } from "@/app/_lib/utils";

export default function BadgePage() {
  const tcommon = useTranslations("common");
  const t = useTranslations("furpanel");
  const formatter = useFormatter();
  const {showModal, hideModal} = useModalUpdate();
  const {setUpdateUser} = useUser();
  const [loading, setLoading] = useState(false);
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatusApiResponse | null | undefined>();

  // Main logic

  // Badge upload
  const uploadBadge = (blob?: Blob) => {
    if (!blob) return;
    const dataToUpload: FormData = new FormData();
    dataToUpload.append("image", blob);+
    setLoading(true);
    runRequest(new UploadBadgeAction(), undefined, dataToUpload)
    .then(()=>{
      setUpdateUser(true);
      setBadgeStatus(undefined);
    }).catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"></ModalError>
    )).finally(()=>setLoading(false));
    setLoading(true);
  }

  // Badge deletion
  const promptBadgeDelete = (id: number) => {
    showModal(t("badge.messages.confirm_deletion.title"),
      <div className="vertical-list gap-2mm">
        <span>{t("badge.messages.confirm_deletion.description")}</span>
        <div className="horizontal-list">
          <Button type="button" className="danger" iconName={ICONS.CANCEL}
            onClick={hideModal}>{tcommon("cancel")}</Button>
          <div className="spacer"></div>
          <Button type="submit" className="success" iconName={ICONS.CHECK}
            onClick={()=>deleteBadge(id)}>{tcommon("confirm")}</Button>
        </div>
      </div>,
      ICONS.DELETE
    );
  }

  const deleteBadge = (id: number) => {
    hideModal();
    setLoading(true);
    runRequest(new DeleteBadgeAction())
    .then(()=>{
      setUpdateUser(true);
      setBadgeStatus(undefined);
    }).catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"></ModalError>
    )).finally(()=>setLoading(false));
  }

  // Change data
  const [changeDataModalOpen, setChangeDataModalOpen] = useState(false);

  const onChangeSuccess = () => {
    setUpdateUser(true);
    setBadgeStatus(undefined);
    setChangeDataModalOpen(false);
  }

  const onChangeFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors">
      </ModalError>
    )
  }

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
      e.append("delete-image", ""+(deleteFursuitImage && !fursuitBlob))
    }
    return e;
  }

  const checkFursuitBadge = (e: FormData, form: HTMLFormElement): boolean => {
    return true;
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
    runRequest(new DeleteFursuitApiAction(), [""+currentFursuit.fursuit.id])
    .then (()=>{
      setBadgeStatus(undefined);
    }).catch((err)=>{
      showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"></ModalError>);
    }).finally(()=>{
      closeDeleteFursuit();
      setLoading(false);
    })
  }

  const closeDeleteFursuit = () => {
    setCurrentFursuit(undefined);
    setDeleteFursuitModalOpen(false);
  }

  // First load
  useEffect(()=>{
    if (badgeStatus) return;
    setLoading(true);
    closeAddFursuitModal();
    closeDeleteFursuit();
    runRequest(new GetBadgeStatusAction())
    .then((data)=>setBadgeStatus(data as BadgeStatusApiResponse))
    .catch((err)=>{
      showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"></ModalError>);
        setBadgeStatus(null);
    }).finally(()=>setLoading(false));
  }, [badgeStatus]);

  useTitle("Badge");

  return <>
    <div className="page">
      <span className="title medium horizontal-list gap-2mm">
        {t("badge.your_badges")}
        {badgeStatus && <StatusBox status="warning">
          {t("badge.deadline", {badgeDeadline: formatter.dateTime(new Date(badgeStatus.badgeEditingDeadline), {dateStyle: "medium"})})}
          </StatusBox>
        }
        {loading && <Icon iconName={ICONS.PROGRESS_ACTIVITY} className="loading-animation"></Icon>}
      </span>
      {/* Generic badge */}
      <div className="badge-container gap-4mm">
        <div className="vertical-list flex-vertical-center">
          <DataForm hideSave loading={loading} setLoading={setLoading}>
            <Upload initialMedia={badgeStatus?.mainBadge?.propic} requireCrop loading={loading}
            setBlob={uploadBadge} onDelete={promptBadgeDelete} viewSize={130} helpText={t("badge.badge_limits")}>
            </Upload>
          </DataForm>
        </div>
        <div className="vertical-list gap-2mm">
          <div className="fursona-change rounded-m horizontal-list flex-vertical-center gap-2mm flex-wrap">
            <div className="vertical-list">
              <span className="title"><b>{t("badge.name")}</b>: {badgeStatus?.mainBadge?.fursonaName}</span>
              <span className="title bold"><b>{t("badge.locale")}</b>: {badgeStatus?.mainBadge?.locale && getFlagEmoji(badgeStatus?.mainBadge?.locale)}</span>
            </div>
            <div className="spacer"></div>
            <Button busy={loading} iconName={ICONS.EDIT_SQUARE} onClick={()=>setChangeDataModalOpen (true)}>
              {t("badge.actions.edit_badge")}
            </Button>
          </div>
          <div className="spacer"></div>
          <NoticeBox theme={NoticeTheme.FAQ} title={t("badge.messages.what_to_upload.title")}>
            {t("badge.messages.what_to_upload.description")}
          </NoticeBox>
        </div>
      </div>
      {/* Fursuits */}
      <div className="fursuit-section rounded-m vertical-list gap-2mm">
        <div className="fursuit-header rounded-s horizontal-list flex-vertical-center gap-2mm flex-wrap">
          <Icon iconName={ICONS.PETS}></Icon>
          <span className="title average">{t("badge.your_fursuits", {amount: badgeStatus?.fursuits.length ?? 0})}</span>
          {loading && <Icon iconName={ICONS.PROGRESS_ACTIVITY} className="loading-animation"></Icon>}
          <div className="spacer"></div>
          <Button iconName={ICONS.ADD_CIRCLE} title={tcommon("CRUD.add")} onClick={promptAddFursuit}>
            {tcommon("CRUD.add")}</Button>
        </div>
        <div className="fursuit-container flex-wrap gap-2mm ">
          {/* Fursuit badge rendering */}
          {badgeStatus?.fursuits.map((fursuitData: Fursuit, index: number)=><div key={index} className="fursuit gap-2mm rounded-s">
            <div className="main-data vertical-list">
              <Image unoptimized className="fursuit-image rounded-s" width={500} height={500} alt="" quality={100} src={getImageUrl(fursuitData.fursuit.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}>
              </Image>
              <span className="title average bold">{fursuitData.fursuit.name}</span>
              <span className="title small color-subtitle">{fursuitData.fursuit.species}</span>
              <hr></hr>
              {fursuitData.bringingToEvent && <span className="title tiny">
                <Icon className="average" iconName={ICONS.CHECK_CIRCLE}></Icon>
                {t("badge.input.bring_to_event.label", {eventName: EVENT_NAME})}
              </span>}
              {fursuitData.showInFursuitCount && <span className="title tiny">
                <Icon className="average" iconName={ICONS.CHECK_CIRCLE}></Icon>
                {t("badge.input.show_in_fursuit_count.label", {eventName: EVENT_NAME})}
              </span>}
            </div>
            <div className="spacer"></div>
            <div className="fursuit-actions gap-2mm">
              <Button className="danger" iconName={ICONS.DELETE} busy={loading}
                onClick={()=>promptDeleteFursuit(fursuitData)} 
                title={t("badge.messages.confirm_fursuit_deletion.title", {name: fursuitData.fursuit.name})}>
                </Button>
              <div className="spacer"></div>
              <Button iconName={ICONS.EDIT_SQUARE} onClick={()=>promptEditFursuit(fursuitData)}
                busy={loading} title={t("badge.actions.edit_fursuit", {name: fursuitData.fursuit.name})}></Button>
            </div>
          </div>)}
        </div>
        <NoticeBox theme={NoticeTheme.FAQ} title={t("badge.messages.fursuit_badge.title")}>
          {t.rich("badge.messages.fursuit_badge.description",
            {eventName: EVENT_NAME, maxFursuits: badgeStatus?.maxFursuits ?? 0, b: (chunks)=><b className="highlight">{chunks}</b>})}
        </NoticeBox>
      </div>
    </div>

    {/* Badge data edit modal */}
    <Modal title={t("badge.actions.edit_badge")} open={changeDataModalOpen} onClose={()=>setChangeDataModalOpen(false)} busy={loading}>
        <DataForm action={new BadgeDataChangeFormAction} loading={loading} setLoading={setLoading} hideSave
          className="gap-2mm" onFail={onChangeFail} onSuccess={onChangeSuccess} >
          <JanInput inputType="text" fieldName="fursonaName" initialValue={changeDataModalOpen ? badgeStatus?.mainBadge?.fursonaName : ""}
            label={t("badge.input.new_name.label")} placeholder={t("badge.input.new_name.placeholder")}>
          </JanInput>
          <AutoInput fieldName="locale" required={true} minDecodeSize={2}
            manager={new AutoInputCountriesManager} label={t("badge.input.new_locale.label")} 
            placeholder={t("badge.input.new_locale.placeholder")} helpText={t("badge.input.new_locale.help")}
            initialData={badgeStatus?.mainBadge?.locale ? [badgeStatus?.mainBadge?.locale] : undefined}/>
          <div className="horizontal-list gap-4mm">
            <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={loading} 
              onClick={()=>setChangeDataModalOpen(false)}>{tcommon("cancel")}</Button>
            <div className="spacer"></div>
            <Button type="submit" className="success" iconName={ICONS.CHECK} busy={loading}>
              {tcommon("confirm")}</Button>
          </div>
        </DataForm>
    </Modal>

    {/* Add / Edit fursuit modal */}
    <Modal title={editMode ? t("badge.actions.edit_fursuit", {name: currentFursuit?.fursuit.name}) : t("badge.actions.add_fursuit")} 
      open={addFursuitModalOpen} onClose={closeAddFursuitModal} busy={loading}>
        <DataForm action={editMode ? new EditFursuitFormAction : new AddFursuitFormAction} 
          restPathParams={editMode ? [""+currentFursuit?.fursuit.id, "update-with-image"] : undefined}
          loading={loading} setLoading={setLoading} editFormData={editFursuitFormData}
          hideSave className="gap-2mm" onFail={onFursuitAddEditFail} onSuccess={onFursuitAddEditSuccess} shouldReset={!addFursuitModalOpen} resetOnSuccess>
          <Upload initialMedia={editMode ? deleteFursuitImage ? undefined : currentFursuit?.fursuit.propic : undefined} requireCrop loading={loading}
            setBlob={setFursuitBlob} onDelete={removeCurrentImage}
            label={t("badge.input.fursuit_image.label")}
            helpText={t("badge.input.fursuit_image.help")}></Upload>
          <JanInput inputType="text" fieldName="name" initialValue={editMode ? currentFursuit?.fursuit.name : ""}
            label={t("badge.input.fursuit_name.label")} placeholder={t("badge.input.fursuit_name.placeholder")}>
          </JanInput>
          <JanInput inputType="text" fieldName="species" initialValue={editMode ? currentFursuit?.fursuit.species : ""}
            label={t("badge.input.fursuit_species.label")} placeholder={t("badge.input.fursuit_species.placeholder")}>
          </JanInput>
          <Checkbox fieldName="bring-to-current-event" disabled={!(editMode && currentFursuit?.bringingToEvent) && !badgeStatus?.canBringFursuitsToEvent}
            initialValue={editMode ? currentFursuit?.bringingToEvent : false}>
            {t("badge.input.bring_to_event.label", {eventName: EVENT_NAME})}
          </Checkbox>
          <Checkbox fieldName="show-in-fursuit-count" 
            initialValue={editMode ? currentFursuit?.showInFursuitCount : true}>
            {t("badge.input.show_in_fursuit_count.label", {eventName: EVENT_NAME})}
          </Checkbox>
          <div className="horizontal-list gap-4mm margin-top-2mm">
            <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={loading}
              onClick={closeAddFursuitModal}>
                {tcommon("cancel")}
            </Button>
            <div className="spacer"></div>
            <Button type="submit" className="success" iconName={ICONS.CHECK} busy={loading}>
              {tcommon("confirm")}</Button>
          </div>
        </DataForm>
    </Modal>
    <Modal open={deleteFursuitModalOpen} onClose={closeDeleteFursuit} 
      title={t("badge.messages.confirm_fursuit_deletion.title", {name: currentFursuit?.fursuit.name})} busy={loading}>
        <span>{t("badge.messages.confirm_fursuit_deletion.description", {name: currentFursuit?.fursuit.name})}</span>
        <div className="horizontal-list gap-4mm">
          <Button className="danger" iconName={ICONS.CANCEL} busy={loading} onClick={closeDeleteFursuit}>
            {tcommon("cancel")}</Button>
          <div className="spacer"></div>
          <Button className="success" iconName={ICONS.CHECK} busy={loading} onClick={deleteFursuit}>
            {tcommon("confirm")}</Button>
        </div>
    </Modal>
    </>;
}
