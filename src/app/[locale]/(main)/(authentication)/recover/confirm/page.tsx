"use client"
import DataForm from "@/components/input/dataForm";
import Icon, { ICONS } from "@/components/icon";
import FpInput from "@/components/input/fpInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/components/hooks/useTitle";
import "@/styles/authentication/login.css";
import { ResetPasswordFormAction } from "@/lib/api/authentication/recover";

export default function RecoverConfirm() {
  const t = useTranslations("authentication");
  const [error, setError] = useState<String | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const router = useRouter();
  const params = useSearchParams();

  const onLoading = () => {
    setError(undefined);
  }

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if (!isDetailedError(err)) {
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
        <Icon icon={ICONS.DESIGN_SERVICES}></Icon>
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
      <FpInput fieldName="password" required={true} inputType="password" busy={loading} label={t("recover_confirm.input.new_password.label")}
        placeholder={t("recover_confirm.input.new_password.placeholder")} helpText={t("recover_confirm.input.new_password.help")}
        onChange={(e) => setPassword(e.currentTarget.value)} />
      <FpInput required={true} inputType="password" busy={loading} label={t("recover_confirm.input.confirm_password.label")}
        placeholder={t("recover_confirm.input.confirm_password.placeholder")} onChange={(e) => setConfirmPassword(e.currentTarget.value)} />
    </DataForm>
  </>;
}
