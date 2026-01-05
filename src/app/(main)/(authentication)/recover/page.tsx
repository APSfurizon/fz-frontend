"use client"
import DataForm from "@/components/input/dataForm";
import Icon from "@/components/icon";
import FpInput from "@/components/input/fpInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import useTitle from "@/components/hooks/useTitle";
import "@/styles/authentication/login.css";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { RecoverFormAction } from "@/lib/api/authentication/recover";
import Button from "@/components/input/button";

export default function Login() {
  const t = useTranslations();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();

  const onLoading = () => {
    setError(undefined);
    setSuccess(false);
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
    setSuccess(true);
  }

  useTitle(t("authentication.recover.title"));

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon icon="DESIGN_SERVICES"/>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('authentication.recover.title').toLowerCase()}</span>
      </span>
    </div>
    <p className="color-subtitle title small">
      {t('authentication.recover.instruction')}
    </p>
    {error &&
      <span className="error-container title small center">
        {t(`login.errors.${(error ?? 'unknown_error').toLowerCase()}`)}
    </span>}
    {success && <NoticeBox theme={NoticeTheme.Success} title={t("authentication.recover.messages.email_success.title")}>
      {t("authentication.recover.messages.email_success.description")}
    </NoticeBox>}
    <DataForm className="vertical-list login-form"
      loading={loading}
      setLoading={setLoading}
      onSuccess={manageSuccess}
      action={new RecoverFormAction}
      onFail={(err) => manageError(err)}
      onBeforeSubmit={onLoading}
      hideSave>
        <FpInput fieldName="email"
          required
          inputType="email"
          label={t("authentication.recover.input.email.label")}
          placeholder={t("authentication.login.placeholder_email")}/>
        <div className="horizontal-list flex-center">
          <Button type="submit"
            iconName="MAIL">
              {t("authentication.recover.actions.send_verification")}
          </Button>
        </div>
    </DataForm>
    <Link href={`/login?${params.toString()}`}
      className="suggestion title small center color-subtitle underlined">
        {t('common.back')}
    </Link>
  </>;
}
