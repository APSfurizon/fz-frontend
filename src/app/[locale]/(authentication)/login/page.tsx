"use client";
import { toast } from "@/components/common";
import { useUser } from "@/components/context/userProvider";
import { useAppForm } from "@/components/form";
import Icon from "@/components/icon";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { FieldGroup } from "@/components/ui/field";
import { AuthenticationCodes, LoginAction, LoginData } from "@/lib/api/authentication/login";
import { runRequest } from "@/lib/api/networking";
import { PASSWORD_MINIMUM_SIZE } from "@/lib/constants";
import "@/styles/authentication/login.css";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import z from "zod";

export default function Login() {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const { setUpdateUser } = useUser();

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) =>
      runRequest({
        action: new LoginAction(),
        body: data,
      }),
    onSuccess() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toast.add({
        id: "welcome",
        type: "success",
        title: t("authentication.login.success_toast_title"),
      });
      setUpdateUser(true);
      router.push("/reservation");
    },
  });

  const loginForm = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: z.object({
        email: z.email(),
        password: z.string().min(PASSWORD_MINIMUM_SIZE, {
          error: t("authentication.login.errors.validation.password_too_small", { number: PASSWORD_MINIMUM_SIZE }),
        }),
      }),
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <>
      <div className="horizontal-list gap-4mm justify-content-center mb-6">
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
        className="mb-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          loginForm.handleSubmit();
        }}
      >
        <FieldGroup className="mb-6">
          <loginForm.AppField
            name="email"
            children={(field) => (
              <field.TextField
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
              />
            )}
          />
        </FieldGroup>
        <div className="flex items-center justify-between">
          <Link
            style={{ width: "100%" }}
            href={`/recover?${params.toString()}`}
            className="suggestion title small color-subtitle underlined"
          >
            {t("authentication.login.recover")}
          </Link>
          <loginForm.AppForm>
            <loginForm.Button type="submit" form="login-form" disabled={loginMutation.isPending}>
              <Icon icon="KEY" data-icon="inline-end" />
              Login
            </loginForm.Button>
          </loginForm.AppForm>
        </div>
      </form>
      <Link href={`/register?${params.toString()}`} className="suggestion title small center color-subtitle underlined">
        {t("authentication.login.create_an_account")}
      </Link>
    </>
  );
}
