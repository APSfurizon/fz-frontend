"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import LoadingPanel from "@/components/loadingPanel";
import { ChangePasswordFormAction } from "@/lib/api/authentication/recover";
import { runRequest } from "@/lib/api/networking/main";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import { GetPersonalInfoAction, UserPersonalInfo } from "@/lib/api/user";
import "@/styles/furpanel/user.css";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import UserViewPersonalInfo from "../admin/users/[[...slug]]/_components/userViewPersonalInfo";
import UserSessions from "./_components/userSessions";

export default function UserPage() {
  const t = useTranslations();
  const { showModal } = useModalUpdate();

  // Main logic

  // Personal info logic
  const [personalInformation, setPersonalInformation] = useState<UserPersonalInfo>();

  useEffect(() => {
    if (personalInformation) return;
    runRequest({ action: new GetPersonalInfoAction() })
      .then((result) => setPersonalInformation(result))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />));
  }, [personalInformation]);

  // Password change logic
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const passwordMatch = confirmPassword === password;
  const passwordChangeError = (err: ApiErrorResponse) =>
    showModal(t("common.error"), <ErrorMessage error={err} />, "ERROR");

  useTitle(t("furpanel.user.title"));

  return (
    <>
      <div className="page">
        {/* User area */}
        <div className="section vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm align-items-center">
            <Icon className="x-large" icon="PERSON" />
            <span className="title medium">{t("furpanel.user.sections.user")}</span>
          </div>
          {/* Personal info manager */}
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm align-items-center">
              <span className="title average">{t("furpanel.user.sections.user_info")}</span>
            </div>
            {personalInformation ? (
              <UserViewPersonalInfo
                personalInformation={personalInformation}
                reloadData={() => setPersonalInformation(undefined)}
              />
            ) : (
              <LoadingPanel />
            )}
          </div>
        </div>
        {/* User area */}
        <div className="section vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm align-items-center">
            <Icon className="x-large" icon="SECURITY" />
            <span className="title medium">{t("furpanel.user.sections.security")}</span>
          </div>
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm align-items-center">
              <span className="title average">{t("furpanel.user.sections.sessions")}</span>
            </div>
            <UserSessions />
          </div>
          {/* New password */}
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm align-items-center">
              <span className="title average">{t("furpanel.user.sections.security_password")}</span>
            </div>
            <DataForm
              className="login-form gap-4mm"
              busy={passwordChangeLoading}
              setBusy={setPasswordChangeLoading}
              action={new ChangePasswordFormAction()}
              onFail={(err) => passwordChangeError(err)}
              disableSave={!passwordMatch}
            >
              <FpInput
                fieldName="password"
                required
                inputType="password"
                busy={passwordChangeLoading}
                label={t("authentication.recover_confirm.input.new_password.label")}
                placeholder={t("authentication.recover_confirm.input.new_password.placeholder")}
                helpText={t("authentication.recover_confirm.input.new_password.help")}
                onChange={(e) => setPassword(e.currentTarget.value)}
                autocomplete="new-password"
              />
              <FpInput
                inputType="password"
                required
                busy={passwordChangeLoading}
                label={t("authentication.recover_confirm.input.confirm_password.label")}
                placeholder={t("authentication.recover_confirm.input.confirm_password.placeholder")}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                autocomplete="new-password"
              />
            </DataForm>
          </div>
        </div>
      </div>
    </>
  );
}
