"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import { ChangePasswordFormAction } from "@/lib/api/authentication/recover";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import "@/styles/authentication/login.css";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RecoverConfirm() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const { showModal } = useModalUpdate();
  const router = useRouter();
  const params = useSearchParams();

  const manageError = (err: ApiErrorResponse) => {
    showModal(t("common.error"), <ErrorMessage error={err} />, "ERROR");
  };

  const manageSuccess = () => {
    router.replace("/login");
  };

  useTitle(t("authentication.recover_confirm.title"));

  const passwordMatch = confirmPassword === password;

  return (
    <>
      <div className="horizontal-list gap-4mm justify-content-center">
        <span className="title-pair">
          <Icon icon="DESIGN_SERVICES" />
          <span className="titular bold highlight">furpanel</span>
          <span> - </span>
          <span className="titular bold">{t("authentication.recover_confirm.title").toLowerCase()}</span>
        </span>
      </div>

      <DataForm
        className="vertical-list login-form"
        busy={loading}
        setBusy={setLoading}
        action={new ChangePasswordFormAction()}
        onFail={(err) => manageError(err)}
        onSuccess={manageSuccess}
        hideSave
      >
        <input type="hidden" name="resetPwId" value={params.get("id") ?? ""} />
        <FpInput
          fieldName="password"
          required
          inputType="password"
          busy={loading}
          label={t("authentication.recover_confirm.input.new_password.label")}
          placeholder={t("authentication.recover_confirm.input.new_password.placeholder")}
          helpText={t("authentication.recover_confirm.input.new_password.help")}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <FpInput
          required
          inputType="password"
          busy={loading}
          label={t("authentication.recover_confirm.input.confirm_password.label")}
          placeholder={t("authentication.recover_confirm.input.confirm_password.placeholder")}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        />
        <div className="horizontal-list justify-content-center">
          <FpButton type="submit" icon="SAVE" disabled={!passwordMatch}>
            {t("common.CRUD.save")}
          </FpButton>
        </div>
      </DataForm>
    </>
  );
}
