"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { RecoverFormAction } from "@/lib/api/authentication/recover";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import "@/styles/authentication/login.css";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const t = useTranslations();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showModal } = useModalUpdate();
  const params = useSearchParams();

  const onLoading = () => {
    setSuccess(false);
  };

  const manageError = (err: ApiErrorResponse) => {
    showModal(t("common.error"), <ErrorMessage error={err} />, "ERROR");
  };

  const manageSuccess = () => {
    setSuccess(true);
  };

  useTitle(t("authentication.recover.title"));

  return (
    <>
      <div className="horizontal-list gap-4mm justify-content-center">
        <span className="title-pair">
          <Icon icon="DESIGN_SERVICES" />
          <span className="titular bold highlight">furpanel</span>
          <span> - </span>
          <span className="titular bold">{t("authentication.recover.title").toLowerCase()}</span>
        </span>
      </div>
      <p className="color-subtitle title small">{t("authentication.recover.instruction")}</p>
      {success && (
        <NoticeBox theme={NoticeTheme.Success} title={t("authentication.recover.messages.email_success.title")}>
          {t("authentication.recover.messages.email_success.description")}
        </NoticeBox>
      )}
      <DataForm
        className="vertical-list login-form"
        busy={loading}
        setBusy={setLoading}
        onSuccess={manageSuccess}
        action={new RecoverFormAction()}
        onFail={(err) => manageError(err)}
        onBeforeSubmit={onLoading}
        hideSave
      >
        <FpInput
          fieldName="email"
          required
          inputType="email"
          label={t("authentication.recover.input.email.label")}
          placeholder={t("authentication.login.placeholder_email")}
        />
        <div className="horizontal-list justify-content-center">
          <FpButton type="submit" icon="MAIL">
            {t("authentication.recover.actions.send_verification")}
          </FpButton>
        </div>
      </DataForm>
      <Link href={`/login?${params.toString()}`} className="suggestion title small center color-subtitle underlined">
        {t("common.back")}
      </Link>
    </>
  );
}
