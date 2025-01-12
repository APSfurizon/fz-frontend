"use client"
import DataForm from "@/app/_components/dataForm";
import Icon, { ICONS } from "@/app/_components/icon";
import JanInput from "@/app/_components/janInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/app/_lib/api/global";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useUser } from "@/app/_lib/context/userProvider";
import "../../../../../styles/authentication/login.css";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { ResetPasswordFormAction } from "@/app/_lib/api/authentication/recover";

export default function Login() {
  const t = useTranslations("authentication");
  const tcommon = useTranslations("common");
  const [error, setError] = useState <String | undefined> (undefined);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const router = useRouter();
  const params = useSearchParams();

  const onLoading = () => {
    setError(undefined);
  }

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if(!isDetailedError (err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('login.errors.unknown_error');
      setError(errorMessage);
    }
  }

  const manageSuccess = () => {
    router.replace("/login");
  }

  useTitle(t("recover_confirm.title"));

  const passwordMatch = confirmPassword === password;

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon iconName="design_services"></Icon>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('recover_confirm.title').toLowerCase()}</span>
      </span>
    </div>
    {error && <span className="error-container title small center">{t(`recover_confirm.errors.${(error ?? 'unknown_error').toLowerCase()}`)}</span>}
    
    <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading}
      action={new ResetPasswordFormAction} onFail={(err) => manageError(err)} onBeforeSubmit={onLoading} 
      onSuccess={manageSuccess} disableSave={!passwordMatch}>
      <input type="hidden" name="resetPwId" value={params.get("id") ?? ""}></input>
      <JanInput fieldName="password" required={true} inputType="password" busy={loading} label={t("recover_confirm.input.new_password.label")}
        placeholder={t("recover_confirm.input.new_password.placeholder")} helpText={t("recover_confirm.input.new_password.help")}
        onChange={(e) => setPassword(e.currentTarget.value)}/>
      <JanInput required={true} inputType="password" busy={loading} label={t("recover_confirm.input.confirm_password.label")}
          placeholder={t("recover_confirm.input.confirm_password.placeholder")} onChange={(e) => setConfirmPassword(e.currentTarget.value)}/>
    </DataForm>
  </>;
}
  