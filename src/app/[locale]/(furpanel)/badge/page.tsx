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
import { AutoInputCountriesManager } from "@/lib/api/geo";
import { runRequest } from "@/lib/api/networking/main";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import { getFlagEmoji } from "@/lib/components/userPicture";
import "@/styles/furpanel/badge.scss";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { BadgeProvider } from "./_components/badgeProvider";
import FursuitBringList from "./_components/fursuit/fursuitBringList";

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

  const refresh = () => {
    setBadgeStatus(undefined);
  };

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

  // First load
  useEffect(() => {
    if (badgeStatus) return;
    setLoading(true);
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
        <BadgeProvider badgeData={badgeStatus} isEditExpired={isEditExpired} refresh={refresh}>
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
    </>
  );
}
