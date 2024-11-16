"use client"
import { ApiErrorResponse, ApiDetailedErrorResponse, isDetailedError } from "@/app/_lib/api/global";
import { LoginFormAction } from "@/app/_lib/api/login";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import DataForm from "@/app/_components/dataForm";
import Icon, { ICONS } from "@/app/_components/icon";
import JanInput from "@/app/_components/janInput";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import Button from "@/app/_components/button";
import "../../../styles/authentication/register.css";

export default function Register() {

  const t = useTranslations("authentication");
  const [error, setError] = useState <String | undefined> (undefined);
  const [page, setPage] = useState <Number> (0);
  const [loading, setLoading] = useState(false);

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
    setTimeout(()=>redirect("/home"), 200);
  }

  useTitle(t("register.title"));

  return <>
    <div className="horizontal-list gap-4mm flex-center">
    <span className="title-pair">
        <Icon iconName="design_services"></Icon>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('register.title').toLowerCase()}</span>
    </span>
    </div>
    {error && <span className="error-container title small center">{t(`register.errors.${(error ?? 'unknown_error').toLowerCase()}`)}</span>}
    <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading} action={new LoginFormAction} onSuccess={manageSuccess} onFail={(err) => manageError(err)} saveButton={{iconName: ICONS.KEY, text: t("register.register")}} hideSave={page != 1}>
      {/* Ask user for username and password */}
      <div className={`page ${page == 0 ? "": "hidden"}`}>
        <JanInput fieldName="fursonaName" required={true} inputType="text" helpText={t("register.phase_1.help_nick")} busy={loading} label={t("register.phase_1.label_email")} placeholder={t("register.phase_1.placeholder_email")}/>
        <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("register.phase_1.label_email")} placeholder={t("register.phase_1.placeholder_email")}/>
        <JanInput fieldName="password" minLength={6} required={true} inputType="password" helpText={t("register.phase_1.help_password")} busy={loading} label={t("register.phase_1.label_password")} placeholder={t("register.phase_1.placeholder_password")}/>
        <div className="toolbar-bottom"><Button type="button" className="phase-switcher" iconName={ICONS.KEYBOARD_ARROW_RIGHT} onClick={()=>setPage(1)}>{t('register.phase_1.next')}</Button></div>
      </div>
      <div className={`page ${page == 1 ? "": "hidden"}`}>

        <div className="toolbar-bottom"><Button type="button" className="phase-switcher" iconName={ICONS.KEYBOARD_ARROW_LEFT} onClick={()=>setPage(0)}>{t('register.phase_2.back')}</Button></div>
      </div>
    </DataForm>
    <Link href="/login" className="suggestion title small center color-subtitle underlined">{t('register.login_here')}</Link>
  </>;
  }
  