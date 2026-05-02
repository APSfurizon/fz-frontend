"use client"
import DataForm from "@/components/input/dataForm";
import Icon from "@/components/icon";
import FpInput from "@/components/input/fpInput";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError, runRequest } from "@/lib/api/global";
import {
  AdminSecondaryLoginResponse,
  AuthenticationCodes,
  LoginFormAction,
  LoginResponse
} from "@/lib/api/authentication/login";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/components/hooks/useTitle";
import "@/styles/authentication/login.css";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import {
  ADMIN_TOKEN_STORAGE_NAME,
  API_MOBILE_URL,
  APP_VERSION,
  MOBILE_FURIZON_AUTH_HEADER,
  SESSION_DURATION,
  TOKEN_STORAGE_NAME
} from "@/lib/constants";
import { setCookie } from "@/lib/utils";
import Button from "@/components/input/button";
import { UserDisplayAction } from "@/lib/api/user";
import { useModalUpdate } from "@/components/context/modalProvider";

export default function Login() {
  const t = useTranslations("authentication");
  const [error, setError] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showModal } = useModalUpdate();
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

  const isSecurityByPermission = (permission?: string) => {
    if (!permission) return false;
    const permesso = permission.toUpperCase().trim();
    return permesso === "SECURITY_STAFF";
  }

  const doSecondaryAdminLogin = async () => {
    if (!API_MOBILE_URL) {
      throw new Error("Mobile API base URL not configured");
    }

    const requestUrl = new URL("mail/sendMail", API_MOBILE_URL);
    const secondaryResponse = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(MOBILE_FURIZON_AUTH_HEADER
          ? { furizonauth: MOBILE_FURIZON_AUTH_HEADER }
          : {})
      },
      body: JSON.stringify({
        username: email.trim().toLowerCase(),
        password: encodeURIComponent(password),
        platform: "web",
        versione: APP_VERSION
      }),
      cache: "no-store"
    });

    if (!secondaryResponse.ok) {
      throw new Error(`Secondary login failed with status ${secondaryResponse.status}`);
    }

    const response: AdminSecondaryLoginResponse = await secondaryResponse.json();

    if (!response.accessToken) return;
    const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
    setCookie(ADMIN_TOKEN_STORAGE_NAME, response.accessToken, sessionExpiry);
  }

  const manageSuccess = async (body?: LoginResponse) => {
    if (!body) return;
    const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
    setCookie(TOKEN_STORAGE_NAME, body.accessToken, sessionExpiry);

    // Role check must happen after primary token is cached.
    try {
      const profile = await runRequest({ action: new UserDisplayAction() });
      const isSecurityUser = (profile.permissions ?? []).some((r) => isSecurityByPermission(r));
      if (isSecurityUser) {
        try {
          await doSecondaryAdminLogin();
        } catch (secondaryLoginError) {
          console.warn("Secondary admin login failed", secondaryLoginError);
          showModal("Attenzione", <span>Secondo login admin non riuscito. Continui con il login standard.</span>);
          // Keep primary login valid even if secondary auth endpoint is temporarily unavailable.
        }
      }
    } catch {
      // Fallback: do not block login redirection if role check fails.
    }

    router.replace(`/logging?${params.toString()}`);
  }

  useTitle(t("login.title"));

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon icon="DESIGN_SERVICES" />
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
      action={new LoginFormAction}
      onBeforeSubmit={() => onLoad()}
      onSuccess={(data) => manageSuccess(data as LoginResponse)}
      onFail={(err) => manageError(err)} hideSave
      resetOnFail={false}
      resetOnSuccess={false}>
      <FpInput fieldName="email"
        required
        inputType="email"
        onChange={(e) => setEmail(e.target.value ?? "")}
        label={t("login.label_email")}
        placeholder={t("login.placeholder_email")} />
      <FpInput fieldName="password"
        minLength={6}
        required
        inputType="password"
        onChange={(e) => setPassword(e.target.value ?? "")}
        label={t("login.label_password")}
        placeholder={t("login.placeholder_password")} />
      <div className="toolbar-bottom">
        <Button type="submit" icon="KEY">
          {t("login.login")}
        </Button>
      </div>
    </DataForm>
    <div className="horizontal-list">
      <Link style={{ width: '100%' }} href={`/recover?${params.toString()}`}
        className="suggestion title small center color-subtitle underlined">
        {t('login.recover')}
      </Link>
    </div>
  </>;
}
