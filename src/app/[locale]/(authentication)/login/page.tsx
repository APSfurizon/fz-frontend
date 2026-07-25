"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import {
  AdminSecondaryLoginResponse,
  AuthenticationCodes,
  LoginFormAction,
  LoginResponse,
} from "@/lib/api/authentication/login";
import { ApiErrorResponse, runRequest } from "@/lib/api/networking";
import { UserDisplayAction, UserDisplayResponse } from "@/lib/api/user";
import {
  API_MOBILE_URL,
  APP_VERSION,
  MOBILE_ADMIN_TOKEN_STORAGE_NAME,
  MOBILE_FURIZON_AUTH_HEADER,
  SESSION_DURATION,
  TOKEN_STORAGE_NAME,
} from "@/lib/constants";
import { setCookie } from "@/lib/utils";
import "@/styles/authentication/login.css";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showModal } = useModalUpdate();
  const router = useRouter();
  const params = useSearchParams();

  const manageError = (err: ApiErrorResponse) => {
    showModal(t("common.error"), <ErrorMessage error={err} />, "ERROR");
  };

  const isSecurityByPermission = (permission?: string) => {
    if (!permission) return false;
    const permesso = permission.toUpperCase().trim();
    return permesso === "SECURITY_STAFF";
  };

  const doSecondaryAdminLogin = async () => {
    if (!API_MOBILE_URL) {
      throw new Error("Mobile API base URL not configured");
    }

    const requestUrl = new URL("mail/sendMail", API_MOBILE_URL);
    const secondaryResponse = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(MOBILE_FURIZON_AUTH_HEADER ? { furizonauth: MOBILE_FURIZON_AUTH_HEADER } : {}),
      },
      body: JSON.stringify({
        username: email.trim().toLowerCase(),
        password: encodeURIComponent(password),
        platform: "web",
        versione: APP_VERSION,
      }),
      cache: "no-store",
    });

    if (!secondaryResponse.ok) {
      throw new Error(`Secondary login failed with status ${secondaryResponse.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: AdminSecondaryLoginResponse = await secondaryResponse.json();

    if (!response.accessToken) return;
    const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
    setCookie(MOBILE_ADMIN_TOKEN_STORAGE_NAME, response.accessToken, sessionExpiry);
  };

  const manageSuccess = async (body?: LoginResponse) => {
    if (!body) return;
    const sessionExpiry = new Date(new Date().getTime() + SESSION_DURATION * 24 * 60 * 60 * 1000);
    setCookie(TOKEN_STORAGE_NAME, body.accessToken, sessionExpiry);

    // Role check must happen after primary token is cached.
    try {
      const profile: UserDisplayResponse = await runRequest({ action: new UserDisplayAction() });
      const isSecurityUser = (profile.permissions ?? []).some((r) => isSecurityByPermission(r));
      if (isSecurityUser) {
        try {
          await doSecondaryAdminLogin();
        } catch (secondaryLoginError) {
          console.warn(t("authentication.login.errors.secondary_login_failed"), secondaryLoginError);
          showModal(
            t("authentication.login.errors.secondary_login_failed"),
            <span>{t("authentication.login.errors.secondary_login_failed_description")}</span>
          );
          // Keep primary login valid even if secondary auth endpoint is temporarily unavailable.
        }
      }
    } catch {
      // Fallback: do not block login redirection if role check fails.
      console.error(t("login.errors.secondary_login_failed_fetch"));
    }

    router.replace(`/logging?${params.toString()}`);
  };

  useTitle(t("authentication.login.title"));

  return (
    <>
      <div className="horizontal-list gap-4mm justify-content-center">
        <span className="title-pair">
          <Icon icon="DESIGN_SERVICES" />
          <span className="titular bold highlight">furpanel</span>
          <span> - </span>
          <span className="titular bold">{t("authentication.login.title").toLowerCase()}</span>
        </span>
      </div>
      <Link href={`/register?${params.toString()}`} className="suggestion title small center color-subtitle underlined">
        {t("authentication.login.create_an_account")}
      </Link>
      {params.get("register") && (
        <NoticeBox theme={NoticeTheme.Success} title={t("authentication.login.messages.register_success.title")}>
          {t("authentication.login.messages.register_success.description")}
        </NoticeBox>
      )}
      {Object.keys(AuthenticationCodes).includes(params.get("status") ?? "") && (
        <NoticeBox
          theme={AuthenticationCodes[params.get("status") ?? "UNKNOWN"]}
          title={t(`authentication.login.messages.${params.get("status")}.title`)}
        >
          {t(`authentication.login.messages.${params.get("status")}.description`)}
        </NoticeBox>
      )}
      <DataForm
        className="vertical-list login-form"
        action={new LoginFormAction()}
        onSuccess={(data) => manageSuccess(data as LoginResponse)}
        onFail={(err) => manageError(err)}
        hideSave
        resetOnFail={false}
        resetOnSuccess={false}
      >
        <FpInput
          fieldName="email"
          required
          inputType="email"
          label={t("authentication.login.label_email")}
          placeholder={t("authentication.login.placeholder_email")}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FpInput
          fieldName="password"
          minLength={6}
          required
          inputType="password"
          label={t("authentication.login.label_password")}
          placeholder={t("authentication.login.placeholder_password")}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="toolbar-bottom">
          <FpButton type="submit" icon="KEY">
            {t("authentication.login.login")}
          </FpButton>
        </div>
      </DataForm>
      <div className="horizontal-list">
        <Link
          style={{ width: "100%" }}
          href={`/recover?${params.toString()}`}
          className="suggestion title small center color-subtitle underlined"
        >
          {t("authentication.login.recover")}
        </Link>
      </div>
    </>
  );
}
