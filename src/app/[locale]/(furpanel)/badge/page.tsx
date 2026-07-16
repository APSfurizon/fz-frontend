"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useUser } from "@/components/context/userProvider";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import AutoInput from "@/components/input/autoInput";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import Upload from "@/components/input/upload";
import Modal from "@/components/modal";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import {
  BadgeDataChangeFormAction,
  BadgeStatusApiResponse,
  DeleteBadgeAction,
  GetBadgeStatusAction,
  UploadBadgeAction,
} from "@/lib/api/badge/badge";
import { DeleteFursuitApiAction, Fursuit } from "@/lib/api/badge/fursuits";
import { AutoInputCountriesManager } from "@/lib/api/geo";
import { runRequest } from "@/lib/api/networking/main";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import { getFlagEmoji } from "@/lib/components/userPicture";
import "@/styles/furpanel/badge.css";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { BadgeProvider } from "./_components/badgeProvider";
import FursuitBringList from "./_components/fursuit/fursuitBringList";
import EditFursuit from "./_components/fursuit/modals/editFursuit";

export default function BadgePage() {
  const t = useTranslations();
  const formatter = useFormatter();
  const { showModal, hideModal } = useModalUpdate();
  const { setUpdateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatusApiResponse | null | undefined>();
  const [now] = useState(() => Date.now());
  const isEditExpired = useMemo(
    () => badgeStatus && new Date(badgeStatus.badgeEditingDeadline).getTime() - now < 0,
    [badgeStatus]
  );

  // Main logic

  // Badge upload
  const uploadBadge = (blob?: Blob) => {
    if (!blob) return;
    const dataToUpload: FormData = new FormData();
    dataToUpload.append("image", blob);
    setLoading(true);
    runRequest({
      action: new UploadBadgeAction(),
      body: dataToUpload,
    })
      .then(() => {
        setUpdateUser(true);
        setBadgeStatus(undefined);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setLoading(false));
    setLoading(true);
  };

  // Badge deletion
  const promptBadgeDelete = () => {
    showModal(
      t("furpanel.badge.messages.confirm_deletion.title"),
      <div className="vertical-list gap-2mm">
        <span>{t("furpanel.badge.messages.confirm_deletion.description")}</span>
        <div className="horizontal-list">
          <FpButton type="button" className="danger" icon="CANCEL" onClick={hideModal}>
            {t("common.cancel")}
          </FpButton>
          <div className="spacer"></div>
          <FpButton type="submit" className="success" icon="CHECK" onClick={() => deleteBadge()}>
            {t("common.confirm")}
          </FpButton>
        </div>
      </div>,
      "DELETE"
    );
  };

  const deleteBadge = () => {
    hideModal();
    setLoading(true);
    runRequest({ action: new DeleteBadgeAction() })
      .then(() => {
        setUpdateUser(true);
        setBadgeStatus(undefined);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setLoading(false));
  };

  // Change data
  const [changeDataModalOpen, setChangeDataModalOpen] = useState(false);

  const onChangeSuccess = () => {
    setUpdateUser(true);
    setBadgeStatus(undefined);
    setChangeDataModalOpen(false);
  };

  const onChangeFail = (err: ApiErrorResponse) => showModal(t("common.error"), <ErrorMessage error={err} />);

  // Fursuits
  // Add fursuit
  const [addFursuitModalOpen, setAddFursuitModalOpen] = useState(false);
  const [fursuitBlob, setFursuitBlob] = useState<Blob>();
  const promptAddFursuit = () => {
    setAddFursuitModalOpen(true);
  };

  // Edit fursuit
  const [editMode, setEditMode] = useState(false);
  const [currentFursuit, setCurrentFursuit] = useState<Fursuit>();
  const [deleteFursuitImage, setDeleteFursuitImage] = useState(false);
  const promptEditFursuit = (f: Fursuit) => {
    setEditMode(true);
    setCurrentFursuit(f);
    setAddFursuitModalOpen(true);
  };

  const editFursuitFormData = (e: FormData): FormData => {
    e.append("image", fursuitBlob ?? "");
    if (editMode) {
      e.append("delete-image", "" + (deleteFursuitImage && !fursuitBlob));
    }
    return e;
  };

  const removeCurrentImage = () => {
    setDeleteFursuitImage(editMode);
    setFursuitBlob(undefined);
  };

  const closeAddFursuitModal = () => {
    setFursuitBlob(undefined);
    setAddFursuitModalOpen(false);
    setEditMode(false);
    setDeleteFursuitImage(false);
    setCurrentFursuit(undefined);
  };

  const onFursuitAddEditSuccess = () => {
    closeAddFursuitModal();
    setBadgeStatus(undefined);
  };

  const onFursuitAddEditFail = (err: ApiErrorResponse) => {
    closeAddFursuitModal();
    onChangeFail(err);
  };

  // Delete fursuit
  const [deleteFursuitModalOpen, setDeleteFursuitModalOpen] = useState(false);

  const promptDeleteFursuit = (f: Fursuit) => {
    setCurrentFursuit(f);
    setDeleteFursuitModalOpen(true);
  };

  const deleteFursuit = () => {
    if (!currentFursuit) {
      closeDeleteFursuit();
      return;
    }
    setLoading(true);
    runRequest({
      action: new DeleteFursuitApiAction(),
      pathParams: { id: currentFursuit.fursuit.id },
    })
      .then(() => {
        setBadgeStatus(undefined);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => {
        closeDeleteFursuit();
        setLoading(false);
      });
  };

  const closeDeleteFursuit = () => {
    setCurrentFursuit(undefined);
    setDeleteFursuitModalOpen(false);
  };

  // First load
  useEffect(() => {
    if (badgeStatus) return;
    setLoading(true);
    closeAddFursuitModal();
    closeDeleteFursuit();
    runRequest({ action: new GetBadgeStatusAction() })
      .then((data) => setBadgeStatus(data))
      .catch((err) => {
        showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />);
        setBadgeStatus(null);
      })
      .finally(() => setLoading(false));
  }, [badgeStatus]);

  useTitle("Badge");

  return (
    <>
      <div className="page">
        {/* Badge deadline */}
        {badgeStatus?.badgeEditingDeadline && (
          <>
            <NoticeBox
              theme={NoticeTheme.Warning}
              title={
                isEditExpired
                  ? t("furpanel.badge.messages.badge_edit_deadline_end.title")
                  : t("furpanel.badge.messages.badge_edit_deadline.title")
              }
            >
              {isEditExpired
                ? t(`furpanel.badge.messages.badge_edit_deadline_end.description`, {
                    lockDate: formatter.dateTime(new Date(badgeStatus?.badgeEditingDeadline), { dateStyle: "medium" }),
                  })
                : t(`furpanel.badge.messages.badge_edit_deadline.description`, {
                    lockDate: formatter.dateTime(new Date(badgeStatus?.badgeEditingDeadline), { dateStyle: "medium" }),
                  })}
            </NoticeBox>
          </>
        )}
        <span className="title medium horizontal-list gap-2mm">
          {t("furpanel.badge.your_badges")}
          {loading && <Icon icon="PROGRESS_ACTIVITY" className="loading-animation" />}
        </span>
        {/* Generic badge */}
        <div className="badge-container gap-4mm">
          <div className="vertical-list align-items-center">
            <DataForm hideSave busy={loading} setBusy={setLoading}>
              <Upload
                initialMedia={badgeStatus?.mainBadge?.propic}
                requireCrop
                busy={loading}
                setBlob={uploadBadge}
                onDelete={promptBadgeDelete}
                viewSize={130}
                readonly={!badgeStatus?.allowedModifications}
              ></Upload>
            </DataForm>
          </div>
          <div className="vertical-list gap-2mm">
            <div className="fursona-change rounded-m horizontal-list align-items-center gap-2mm flex-wrap">
              <div className="vertical-list">
                <span className="title">
                  <b>{t("furpanel.badge.name")}</b>: {badgeStatus?.mainBadge?.fursonaName}
                </span>
                <span className="title bold">
                  <b>{t("furpanel.badge.locale")}</b>:&nbsp;
                  {badgeStatus?.mainBadge?.locale && getFlagEmoji(badgeStatus?.mainBadge?.locale)}
                </span>
              </div>
              <div className="spacer"></div>
              <FpButton
                busy={loading}
                icon="EDIT_SQUARE"
                onClick={() => setChangeDataModalOpen(true)}
                disabled={!badgeStatus?.allowedModifications}
              >
                {t("furpanel.badge.actions.edit_badge")}
              </FpButton>
            </div>
            <div className="spacer"></div>
            <NoticeBox theme={NoticeTheme.FAQ} title={t("furpanel.badge.messages.what_to_upload.title")}>
              {t("furpanel.badge.messages.what_to_upload.description")}
            </NoticeBox>
          </div>
        </div>
        {/* Fursuits */}
        <BadgeProvider badgeData={badgeStatus} isEditExpired={isEditExpired}>
          <FursuitBringList />
        </BadgeProvider>
      </div>

      {/* Badge data edit modal */}
      <Modal
        title={t("furpanel.badge.actions.edit_badge")}
        open={changeDataModalOpen}
        onClose={() => setChangeDataModalOpen(false)}
        busy={loading}
      >
        <DataForm
          action={new BadgeDataChangeFormAction()}
          busy={loading}
          setBusy={setLoading}
          hideSave
          className="gap-2mm"
          onFail={onChangeFail}
          onSuccess={onChangeSuccess}
        >
          <FpInput
            inputType="text"
            fieldName="fursonaName"
            initialValue={changeDataModalOpen ? badgeStatus?.mainBadge?.fursonaName : ""}
            label={t("furpanel.badge.input.new_name.label")}
            placeholder={t("furpanel.badge.input.new_name.placeholder")}
          />
          <AutoInput
            fieldName="locale"
            required
            minDecodeSize={2}
            manager={new AutoInputCountriesManager()}
            label={t("furpanel.badge.input.new_locale.label")}
            placeholder={t("furpanel.badge.input.new_locale.placeholder")}
            helpText={t("furpanel.badge.input.new_locale.help")}
            initialData={badgeStatus?.mainBadge?.locale ? [badgeStatus?.mainBadge?.locale] : undefined}
          />
          <div className="horizontal-list gap-4mm">
            <FpButton
              type="button"
              className="danger"
              icon="CANCEL"
              busy={loading}
              onClick={() => setChangeDataModalOpen(false)}
            >
              {t("common.cancel")}
            </FpButton>
            <div className="spacer"></div>
            <FpButton type="submit" className="success" icon="CHECK" busy={loading}>
              {t("common.confirm")}
            </FpButton>
          </div>
        </DataForm>
      </Modal>

      {/* Add / Edit fursuit modal */}
      <Modal
        title={
          editMode
            ? t("furpanel.badge.actions.edit_fursuit", { name: currentFursuit?.fursuit.name ?? "" })
            : t("furpanel.badge.actions.add_fursuit")
        }
        open={addFursuitModalOpen}
        onClose={closeAddFursuitModal}
        busy={loading}
      >
        <EditFursuit editMode={editMode} currentFursuit={currentFursuit} />
      </Modal>
      <Modal
        open={deleteFursuitModalOpen}
        onClose={closeDeleteFursuit}
        title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", {
          name: currentFursuit?.fursuit.name ?? "",
        })}
        busy={loading}
      >
        <span>
          {t("furpanel.badge.messages.confirm_fursuit_deletion.description", {
            name: currentFursuit?.fursuit.name ?? "",
          })}
        </span>
        <div className="horizontal-list gap-4mm">
          <FpButton className="danger" icon="CANCEL" busy={loading} onClick={closeDeleteFursuit}>
            {t("common.cancel")}
          </FpButton>
          <div className="spacer"></div>
          <FpButton className="success" icon="CHECK" busy={loading} onClick={deleteFursuit}>
            {t("common.confirm")}
          </FpButton>
        </div>
      </Modal>
    </>
  );
}
