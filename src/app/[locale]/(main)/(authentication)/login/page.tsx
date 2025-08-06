"use client"
import DataForm from "@/components/input/dataForm";
import Icon from "@/components/icon";
import FpInput from "@/components/input/fpInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError } from "@/lib/api/global";
import { AuthenticationCodes, LoginFormAction, LoginResponse } from "@/lib/api/authentication/login";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/components/hooks/useTitle";
import "@/styles/authentication/login.css";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { SESSION_DURATION, TOKEN_STORAGE_NAME } from "@/lib/constants";
import { setCookie } from "@/lib/utils";
import Button from "@/components/input/button";

export default function Login() {
  const t = useTranslations("authentication");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const onLoad = () => setError(undefined);

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if (!isDetailedError(err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('login.errors.unknown_error');
      if (errorMessage.toLowerCase().trim() === "already_logged_in") {
        router.replace('/home');
        return;
      }
      setError(errorMessage);
    }
  }

  const manageSuccess = (body?: LoginResponse) => {
    if (!body) return;
    const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
    setCookie(TOKEN_STORAGE_NAME, body.accessToken, sessionExpiry);
    router.replace(`/logging?${params.toString()}`);
  }

  useTitle(t("login.title"));

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon icon="DESIGN_SERVICES"></Icon>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('login.title').toLowerCase()}</span>
      </span>
    </div>
    <Link href={`/register?${params.toString()}`}
      className="suggestion title small center color-subtitle underlined">
        {t('login.create_an_account')}
    </Link>
    {error && <span className="error-container title small center">
      {t(`login.errors.${(error ?? 'unknown_error').toLowerCase()}`)}  
    </span>}
    {params.get("register") &&
      <NoticeBox theme={NoticeTheme.Success} title={t("login.messages.register_success.title")}>
        {t("login.messages.register_success.description")}
    </NoticeBox>}
    {Object.keys(AuthenticationCodes).includes(params.get("status") ?? "") &&
      <NoticeBox theme={AuthenticationCodes[params.get("status") ?? "UNKNOWN"]}
        title={t(`login.messages.${params.get("status")}.title`)}>
          {t(`login.messages.${params.get("status")}.description`)}
      </NoticeBox>}
    <DataForm className="vertical-list login-form"
      loading={loading}
      setLoading={setLoading}
      action={new LoginFormAction}
      onBeforeSubmit={() => onLoad()}
      onSuccess={(data) => manageSuccess(data as LoginResponse)}
      onFail={(err) => manageError(err)} hideSave
      resetOnFail={false}
      resetOnSuccess={false}>
        <FpInput fieldName="email"
          required
          inputType="email"
          label={t("login.label_email")}
          placeholder={t("login.placeholder_email")}/>
        <FpInput fieldName="password"
          minLength={6}
          required
          inputType="password"
          label={t("login.label_password")}
          placeholder={t("login.placeholder_password")}/>
        <div className="toolbar-bottom">
          <Button type="submit"
            iconName={"KEY"}
            busy={loading}>
              {t("login.login")}
          </Button>
        </div>
    </DataForm>
    <div className="horizontal-list">
      <Link style={{width: '100%'}} href={`/recover?${params.toString()}`}
        className="suggestion title small center color-subtitle underlined">
          {t('login.recover')}
      </Link>
    </div>
  </>;
}
