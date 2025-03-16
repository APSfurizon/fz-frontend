"use client"
import DataForm from "@/components/dataForm";
import Icon, { ICONS } from "@/components/icon";
import JanInput from "@/components/janInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/lib/api/hooks/useTitle";
import { useUser } from "@/components/context/userProvider";
import "@/styles/authentication/login.css";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { RecoverFormAction } from "@/lib/api/authentication/recover";

export default function Login() {
  const t = useTranslations();
  const [error, setError] = useState <String | undefined> (undefined);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const {updateUser, setUpdateUser} = useUser();
  const router = useRouter();
  const params = useSearchParams();

  const onLoading = () => {
    setError(undefined);
    setSuccess(false);
  }

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if(!isDetailedError (err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('authentication.login.errors.unknown_error');
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
          <Icon iconName="design_services"></Icon>
          <span className="titular bold highlight">furpanel</span>
          <span> - </span>
          <span className="titular bold">{t('authentication.recover.title').toLowerCase()}</span>
      </span>
    </div>
    {error && <span className="error-container title small center">{t(`login.errors.${(error ?? 'unknown_error').toLowerCase()}`)}</span>}
    {success && <NoticeBox theme={NoticeTheme.Success} title={t("authentication.recover.messages.email_success.title")}>
      {t("authentication.recover.messages.email_success.description")}
    </NoticeBox>}
    <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading} onSuccess={manageSuccess}
      action={new RecoverFormAction} onFail={(err) => manageError(err)} onBeforeSubmit={onLoading}
      saveButton={{iconName: ICONS.MAIL, text: t("authentication.recover.actions.send_verification")}}>
      <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("authentication.recover.input.email.label")} placeholder={t("authentication.login.placeholder_email")}/>
    </DataForm>
    <Link href={`/login?${params.toString()}`} className="suggestion title small center color-subtitle underlined">{t('common.back')}</Link>
  </>;
}
  