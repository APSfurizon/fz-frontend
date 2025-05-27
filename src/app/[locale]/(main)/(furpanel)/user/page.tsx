'use client'
import { useModalUpdate } from "@/components/context/modalProvider";
import Icon, { ICONS } from "@/components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/components/hooks/useTitle";
import { useTranslations } from "next-intl";
import DataForm from "@/components/input/dataForm";
import { GetPersonalInfoAction, UserPersonalInfo } from "@/lib/api/user";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import ModalError from "@/components/modalError";
import FpInput from "@/components/input/fpInput";
import { ResetPasswordFormAction } from "@/lib/api/authentication/recover";
import LoadingPanel from "@/components/loadingPanel";
import "@/styles/furpanel/user.css";
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
    runRequest(new GetPersonalInfoAction(), undefined, undefined, undefined)
      .then((result) => setPersonalInformation(result))
      .catch((err) => showModal(
        t("common.error"),
        <ModalError error={err} translationRoot="furpanel" translationKey="user.errors"></ModalError>
      ));
  }, [personalInformation])

  // Password change logic
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const passwordMatch = confirmPassword === password;
  const passwordChangeError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => showModal(
    t("common.error"),
    <ModalError error={err} translationRoot="authentication" translationKey="login.errors"></ModalError>,
    ICONS.ERROR
  );

  useTitle(t("furpanel.user.title"));

  return <>
    <div className="page">
      {/* User area */}
      <div className="section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.PERSON}></Icon>
          <span className="title medium">{t("furpanel.user.sections.user")}</span>
        </div>
        {/* Personal info manager */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("furpanel.user.sections.user_info")}
            </span>
          </div>
          {personalInformation 
            ? <UserViewPersonalInfo personalInformation={personalInformation}
                reloadData={()=>setPersonalInformation(undefined)}/>
            : <LoadingPanel/>}
        </div>
      </div>
      {/* User area */}
      <div className="section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.SECURITY}></Icon>
          <span className="title medium">{t("furpanel.user.sections.security")}</span>
        </div>
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("furpanel.user.sections.sessions")}
            </span>
          </div>
          <UserSessions/>
        </div>
        {/* New password */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("furpanel.user.sections.security_password")}
            </span>
          </div>
          <DataForm className="login-form gap-4mm"
            loading={passwordChangeLoading}
            setLoading={setPasswordChangeLoading}
            action={new ResetPasswordFormAction}
            onFail={(err) => passwordChangeError(err)}
            disableSave={!passwordMatch}>
              <FpInput fieldName="password"
                required
                inputType="password"
                busy={passwordChangeLoading}
                label={t("authentication.recover_confirm.input.new_password.label")}
                placeholder={t("authentication.recover_confirm.input.new_password.placeholder")}
                helpText={t("authentication.recover_confirm.input.new_password.help")}
                onChange={(e) => setPassword(e.currentTarget.value)}
                autocomplete="new-password"/>
              <FpInput inputType="password"
                required busy={passwordChangeLoading}
                label={t("authentication.recover_confirm.input.confirm_password.label")}
                placeholder={t("authentication.recover_confirm.input.confirm_password.placeholder")}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                autocomplete="new-password"/>
          </DataForm>
        </div>
      </div>
    </div>
  </>;
}
