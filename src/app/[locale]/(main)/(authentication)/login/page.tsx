"use client"
import DataForm from "@/app/_components/dataForm";
import Icon, { ICONS } from "@/app/_components/icon";
import JanInput from "@/app/_components/janInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/app/_lib/api/global";
import { AuthenticationCodes, LoginFormAction } from "@/app/_lib/api/login";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useUser } from "@/app/_lib/context/userProvider";
import "../../../../styles/authentication/login.css";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";

export default function Login() {
  const t = useTranslations("authentication");
  const [error, setError] = useState <String | undefined> (undefined);
  const [loading, setLoading] = useState(false);
  const {updateUser, setUpdateUser} = useUser();
  const router = useRouter();
  const params = useSearchParams();
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
    setError(undefined);
    setTimeout(()=>{
      setUpdateUser(true);
      if (params) {
        router.replace(params.get("continue") ?? "/home");
      } else {
        router.replace("/home");
      }
    }, 200);
  }

  useTitle(t("login.title"));

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
          <Icon iconName="design_services"></Icon>
          <span className="titular bold highlight">furpanel</span>
          <span> - </span>
          <span className="titular bold">{t('login.title').toLowerCase()}</span>
      </span>
    </div>
    {error && <span className="error-container title small center">{t(`login.errors.${(error ?? 'unknown_error').toLowerCase()}`)}</span>}
    {params.get("register") && <NoticeBox theme={NoticeTheme.Success} title={t("login.messages.register_success.title")}>
      {t("login.messages.register_success.description")}
    </NoticeBox>}
    {Object.keys(AuthenticationCodes).includes(params.get("status") ?? "") && <NoticeBox theme={AuthenticationCodes[params.get("status") ?? "UNKNOWN"]} title={t(`login.messages.${params.get("status")}.title`)}>
      {t(`login.messages.${params.get("status")}.description`)}
    </NoticeBox>}
    <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading} action={new LoginFormAction} onSuccess={manageSuccess} onFail={(err) => manageError(err)} saveButton={{iconName: ICONS.KEY, text: t("login.login")}}>
      <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("login.label_email")} placeholder={t("login.placeholder_email")}/>
      <JanInput fieldName="password" minLength={6} required={true} inputType="password" busy={loading} label={t("login.label_password")} placeholder={t("login.placeholder_password")}/>
    </DataForm>
    <Link href={`/register?${params.toString()}`} className="suggestion title small center color-subtitle underlined">{t('login.register_here')}</Link>
    <Link href={`/recover?${params.toString()}`} className="suggestion title small center color-subtitle underlined">{t('login.recover')}</Link>
  </>;
}
  