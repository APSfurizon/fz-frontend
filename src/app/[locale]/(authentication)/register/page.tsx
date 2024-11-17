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
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import AutoInput from "@/app/_components/autoInput";
import { AutoInputSearchResult, AutoInputType } from "@/app/_lib/components/autoInput";

export default function Register() {

  const t = useTranslations("authentication");
  const [error, setError] = useState <String | undefined> (undefined);
  const [loading, setLoading] = useState(false);
  const [showFiscalCode, setShowFiscalCode] = useState(false);

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

  const onCountryChange = (values: AutoInputSearchResult[], newValue?: AutoInputSearchResult, removedValue?: AutoInputSearchResult) => {
    if (newValue?.code == 'IT') {
      setShowFiscalCode(true);
    } else {
      setShowFiscalCode(false);
    }
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
    <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading} action={new LoginFormAction} onSuccess={manageSuccess} onFail={(err) => manageError(err)} saveButton={{iconName: ICONS.KEY, text: t("register.register")}}>
      {/* Ask user for username and password */}
      <JanInput fieldName="fursonaName" required={true} inputType="text" helpText={t("register.phase_1.help_nick")} busy={loading} label={t("register.phase_1.label_nick")} placeholder={t("register.phase_1.placeholder_nick")}/>
      <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("register.phase_1.label_email")} placeholder={t("register.phase_1.placeholder_email")}/>
      <JanInput fieldName="password" minLength={6} required={true} inputType="password" helpText={t("register.phase_1.help_password")} busy={loading} label={t("register.phase_1.label_password")} placeholder={t("register.phase_1.placeholder_password")}/>
      <JanInput fieldName="confirmPassword" minLength={6} required={true} inputType="password" helpText={t("register.phase_1.help_confirm_password")} busy={loading} label={t("register.phase_1.label_confirm_password")} placeholder={t("register.phase_1.placeholder_confirm_password")}/>
      {/* Ask user for additional reg data*/}
      <hr></hr>
      <span className="title medium bold highlight">{t("register.phase_2.title_name")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="firstName" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_first_name")} placeholder={t("register.phase_2.placeholder_first_name")}/>
        <JanInput fieldName="lastName" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_last_name")} placeholder={t("register.phase_2.placeholder_last_name")}/>
      </div>
      <hr></hr>
      <span className="title medium bold highlight">{t("register.phase_2.title_birth")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="birthday" required={true} inputType="date" busy={loading} label={t("register.phase_2.label_birthday")}/>
        <AutoInput fieldName="birthCountry" required={true} noDelay={true} minDecodeSize={1} onChange={onCountryChange} type={AutoInputType.COUNTRIES} label={t("register.phase_2.label_birth_country")} placeholder={t("register.phase_2.placeholder_birth_country")}/>
      </div>
      {/* Show only if birth country is Italy */}
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="fiscalCode" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_fiscal_code")} placeholder={t("register.phase_2.placeholder_fiscal_code")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="birthRegion" required={true} noDelay={true} minDecodeSize={1} type={AutoInputType.COUNTRIES} label={t("register.phase_2.label_birth_region")} placeholder={t("register.phase_2.placeholder_birth_region")}/>
        <JanInput fieldName="birthCity" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_birth_city")} placeholder={t("register.phase_2.placeholder_birth_city")}/>
      </div>
      <hr></hr>
      <span className="title medium bold highlight">{t("register.phase_2.title_residence")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="residenceCountry" required={true} noDelay={true} minDecodeSize={1} type={AutoInputType.COUNTRIES} label={t("register.phase_2.label_residence_country")} placeholder={t("register.phase_2.placeholder_residence_country")}/>
        <AutoInput fieldName="residenceRegion" required={true} noDelay={true} minDecodeSize={1} type={AutoInputType.COUNTRIES} label={t("register.phase_2.label_residence_region")} placeholder={t("register.phase_2.placeholder_residence_region")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="residenceCity" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_residence_city")} placeholder={t("register.phase_2.placeholder_residence_city")}/>
        <JanInput fieldName="residenceZipCode" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_residence_zip_code")} placeholder={t("register.phase_2.placeholder_residence_zip_code")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="residenceAddress" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_residence_address")} placeholder={t("register.phase_2.placeholder_residence_address")}/>
        <JanInput fieldName="phoneNumber" required={true} inputType="text" busy={loading} label={t("register.phase_2.label_phone_number")} placeholder={t("register.phase_2.placeholder_phone_number")}/>
      </div>
      <NoticeBox theme={NoticeTheme.FAQ} title={t("register.phase_2.description_title")} className="descriptive">{t("register.phase_2.description")}</NoticeBox>
    </DataForm>
    <Link href="/login" className="suggestion title small center color-subtitle underlined">{t('register.login_here')}</Link>
  </>;
  }
  