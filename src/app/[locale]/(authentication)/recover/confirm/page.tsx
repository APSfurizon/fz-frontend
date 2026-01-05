"use client"
import DataForm from "@/components/input/dataForm";
import Icon from "@/components/icon";
import FpInput from "@/components/input/fpInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useTitle from "@/components/hooks/useTitle";
import "@/styles/authentication/login.css";
import { ResetPasswordFormAction } from "@/lib/api/authentication/recover";
import Button from "@/components/input/button";

export default function RecoverConfirm() {
  const t = useTranslations();
  const [error, setError] = useState<string | undefined>(undefined);
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
      const errorMessage = errRes.errors.length > 0
        ? errRes.errors[0].code
        : t('authentication.login.errors.unknown_error');
      setError(errorMessage);
    }
  }

  const manageSuccess = () => {
    router.replace("/login");
  }

  useTitle(t("authentication.recover_confirm.title"));

  const passwordMatch = confirmPassword === password;

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon icon="DESIGN_SERVICES"/>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">
          {t('authentication.recover_confirm.title').toLowerCase()}
        </span>
      </span>
    </div>
    {error && <span className="error-container title small center">
      {t(`authentication.recover_confirm.errors.${(error ?? 'unknown_error').toLowerCase()}`)}
    </span>}

    <DataForm className="vertical-list login-form"
      loading={loading}
      setLoading={setLoading}
      action={new ResetPasswordFormAction}
      onFail={(err) => manageError(err)}
      onBeforeSubmit={onLoading}
      onSuccess={manageSuccess}
      hideSave>
        <input type="hidden"
          name="resetPwId"
          value={params.get("id") ?? ""}/>
        <FpInput fieldName="password"
          required
          inputType="password"
          busy={loading}
          label={t("authentication.recover_confirm.input.new_password.label")}
          placeholder={t("authentication.recover_confirm.input.new_password.placeholder")}
          helpText={t("authentication.recover_confirm.input.new_password.help")}
          onChange={(e) => setPassword(e.currentTarget.value)}/>
        <FpInput required
          inputType="password"
          busy={loading}
          label={t("authentication.recover_confirm.input.confirm_password.label")}
          placeholder={t("authentication.recover_confirm.input.confirm_password.placeholder")}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}/>
        <div className="horizontal-list flex-center">
          <Button type="submit"
            iconName="SAVE"
            disabled={!passwordMatch}>
              {t("common.CRUD.save")}
          </Button>
        </div>
    </DataForm>
  </>;
}
