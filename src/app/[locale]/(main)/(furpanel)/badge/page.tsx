'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useFormatter, useTranslations } from "next-intl";
import { BadgeStatusApiResponse, DeleteBadgeAction, FursonaNameChangeFormAction } from "@/app/_lib/api/badge";
import Upload from "@/app/_components/upload";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import StatusBox from "@/app/_components/statusBox";
import "../../../../styles/furpanel/badge.css";
import Modal from "@/app/_components/modal";
import DataForm from "@/app/_components/dataForm";
import JanInput from "@/app/_components/janInput";
import { runRequest } from "@/app/_lib/api/global";
import { UploadBadgeAction } from "@/app/_lib/api/badge";
import ModalError from "@/app/_components/modalError";
import { useUser } from "@/app/_lib/context/userProvider";

export default function BadgePage() {
  const tcommon = useTranslations("common");
  const t = useTranslations("furpanel");
  const formatter = useFormatter();
  const {showModal} = useModalUpdate();
  const {setUpdateUser} = useUser();
  const [loading, setLoading] = useState(false);
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatusApiResponse>();

  // Main logic

  // Badge upload
  const uploadBadge = (blob: Blob) => {
    const dataToUpload: FormData = new FormData();
    dataToUpload.append("image", blob);+
    setLoading(true);
    runRequest(new UploadBadgeAction(), undefined, dataToUpload)
    .then(()=>setUpdateUser(true))
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="components" translationKey="upload.errors"></ModalError>
    )).finally(()=>setLoading(false));
    setLoading(true);
  }

  // Badge deletion
  const deleteBadge = (id: number) => {
    setLoading(true);
    runRequest(new DeleteBadgeAction())
    .then(()=>setUpdateUser(true))
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"></ModalError>
    )).finally(()=>setLoading(false));
  }

  // Change name
  const [changeNameModalOpen, setChangeNameModalOpen] = useState(false);

  // First load
  useEffect(()=>{
    setLoading(true);
    // TODO: Run loading fetch
    setBadgeStatus({
      badgeEditingDeadline: "2025-05-24T00:00:00",
      badgeMedia: /*{
        id: 1,
        mediaType: "image/webp",
        relativePath: "/static/images/badges/1/8e99adfc-3e27-411c-95e4-ce8023f21cd2.webp"
      }*/undefined,
      fursonaName: "Drew",
      fursuits: []
    });
    setLoading(false);
  }, []);

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
      <div className="horizontal-list gap-4mm">
        <div className="vertical-list flex-vertical-center">
          <Upload initialMedia={badgeStatus?.badgeMedia} requireCrop loading={loading}
           setBlob={uploadBadge} onDelete={deleteBadge}></Upload>
        </div>
        <div className="vertical-list gap-2mm">
          <div className="fursona-change rounded-m horizontal-list flex-vertical-center gap-2mm">
            <span className="title bold">{t("badge.name")}: </span>
            <span className="title">{badgeStatus?.fursonaName}</span>
            <div className="spacer"></div>
            <Button busy={loading} iconName={ICONS.EDIT_SQUARE} onClick={()=>setChangeNameModalOpen (true)}>
              {t("badge.actions.edit_fursona_name")}
            </Button>
          </div>
          <NoticeBox theme={NoticeTheme.FAQ} title={t("badge.messages.what_to_upload.title")}>
            {t("badge.messages.what_to_upload.description")}
          </NoticeBox>
        </div>
      </div>
    </div>
    <Modal title={t("badge.actions.edit_fursona_name")} open={changeNameModalOpen} onClose={()=>setChangeNameModalOpen(false)}>
        <DataForm action={new FursonaNameChangeFormAction} loading={loading} setLoading={setLoading} hideSave>
          <JanInput inputType="text" fieldName="name" value={changeNameModalOpen ? badgeStatus?.fursonaName : ""}
          label={t("badge.input.new_name.label")} placeholder={t("badge.input.new_name.placeholder")}>
          </JanInput>
        </DataForm>
        <div className="horizontal-list gap-4mm">
          <Button type="submit" className="success" iconName={ICONS.CHECK} busy={loading}>{tcommon("confirm")}</Button>
          <div className="spacer"></div>
          <Button type="button" className="danger" iconName={ICONS.CANCEL} busy={loading} onClick={()=>setChangeNameModalOpen(false)}>
              {tcommon("cancel")}
          </Button>
        </div>
    </Modal>
    </>;
}
