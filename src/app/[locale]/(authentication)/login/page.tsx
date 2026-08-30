"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useAppForm } from "@/components/form";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { FieldGroup } from "@/components/ui/field";
import { AdminSecondaryLoginResponse, AuthenticationCodes, LoginResponse } from "@/lib/api/authentication/login";
import { runRequest } from "@/lib/api/networking";
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
import z from "zod";

export default function Login() {
  const t = useTranslations();
  const { showModal } = useModalUpdate();
  const router = useRouter();
  const params = useSearchParams();

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

  const loginForm = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: z.object({
        email: z.email(),
        password: z.string().min(6),
      }),
    },
    onSubmit: ({ value }) => {
      console.log("basu");
      alert(value);
      console.log(value);
    },
  });

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
      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          loginForm.handleSubmit();
        }}
      >
        <FieldGroup>
          <loginForm.AppField
            name="email"
            children={(field) => (
              <field.TextField
                label={t("authentication.login.label_email")}
                placeholder={t("authentication.login.placeholder_email")}
              />
            )}
          />
          <loginForm.AppField
            name="password"
            children={(field) => (
              <field.TextField
                type="password"
                label={t("authentication.login.label_password")}
                placeholder={t("authentication.login.placeholder_password")}
              />
            )}
          />
        </FieldGroup>
        <loginForm.AppForm>
          <loginForm.Button type="submit" form="login-form">
            <Icon icon="KEY" data-icon="inline-end" />
            Login
          </loginForm.Button>
        </loginForm.AppForm>
      </form>

      <Link
        style={{ width: "100%" }}
        href={`/recover?${params.toString()}`}
        className="suggestion title small center color-subtitle underlined"
      >
        {t("authentication.login.recover")}
      </Link>
      <Link href={`/register?${params.toString()}`} className="suggestion title small center color-subtitle underlined">
        {t("authentication.login.create_an_account")}
      </Link>
    </>
  );
}
