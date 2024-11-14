"use client"
import DataForm from "@/app/_components/dataForm";
import { ICONS } from "@/app/_components/icon";
import JanInput from "@/app/_components/janInput";
import { ApiErrorResponse } from "@/app/_lib/api/global";
import { LoginFormAction } from "@/app/_lib/api/login";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import "../../../styles/authentication/login.css";

export default function Login() {
  
  const t = useTranslations("authentication");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const manageError = (err: ApiErrorResponse | string) => {
    console.log (err);
    if(err instanceof String) {
      setError(""+err);
    } else {
      const errRes = err as ApiErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].message : t('login.unknown_error');
      setError(errorMessage);
    }
  }

  return (
    <div>
      <main>
        <span>{error}</span>
        <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading} action={new LoginFormAction} onSuccess={()=>{console.log ("success")}} onFail={(err) => manageError(err)} saveButton={{iconName: ICONS.KEY, text: t("login.login")}}>
          <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("login.label_email")} placeholder={t("login.placeholder_email")}/>
          <JanInput fieldName="password" minLength={6} required={true} inputType="password" busy={loading} label={t("login.label_password")} placeholder={t("login.placeholder_password")}/>
        </DataForm>
        <a></a>
      </main>
    </div>
  );
  }
  