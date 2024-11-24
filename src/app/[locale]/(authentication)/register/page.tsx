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
import { RegisterFormAction } from "@/app/_lib/api/register";

export default function Register() {

  const t = useTranslations("authentication");
  const [error, setError] = useState <String | undefined> (undefined);
  const [loading, setLoading] = useState(false);
  const [birthCountry, setBirthCountry] = useState<string | undefined> ();
  const [residenceCountry, setResidenceCountry] = useState<string> ();

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if(!isDetailedError (err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('login.errors.unknown_error');
      setError(errorMessage);
    }
  }

  const manageSuccess = () => setTimeout(()=>redirect("/home"), 200)

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
    <DataForm className="vertical-list login-form" loading={loading} setLoading={setLoading} action={new RegisterFormAction} onSuccess={manageSuccess} onFail={(err) => manageError(err)} saveButton={{iconName: ICONS.KEY, text: t("register.register")}}>
      {/* Ask user for username and password */}
      <JanInput fieldName="fursonaName" required={true} inputType="text" helpText={t("register.form.nickname.help")} busy={loading}
        label={t("register.form.nickname.label")} placeholder={t("register.form.nickname.placeholder")}/>
      <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("register.form.email.label")} placeholder={t("register.form.email.placeholder")}/>
      <JanInput fieldName="password" minLength={6} required={true} inputType="password" helpText={t("register.form.password.help")} busy={loading} label={t("register.form.password.label")} placeholder={t("register.form.password.placeholder")}/>
      <JanInput fieldName="confirmPassword" minLength={6} required={true} inputType="password" helpText={t("register.form.confirm_password.help")} busy={loading} label={t("register.form.confirm_password.label")} placeholder={t("register.form.confirm_password.placeholder")}/>
      <hr></hr>
      {/* Ask user for name data*/}
      <span className="title medium bold highlight">{t("register.form.section.personal_info")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="firstName" required={true} inputType="text" busy={loading} label={t("register.form.first_name.label")}
          placeholder={t("register.form.first_name.placeholder")}/>
        <JanInput fieldName="lastName" required={true} inputType="text" busy={loading} label={t("register.form.first_name.label")}
          placeholder={t("register.form.first_name.placeholder")}/>
      </div>
      <hr></hr>
      {/* Ask user for birth data*/}
      <span className="title medium bold highlight">{t("register.form.section.birth_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="birthday" required={true} inputType="date" busy={loading} label={t("register.form.birthday.label")}/>
        <AutoInput fieldName="birthCountry" required={true} minDecodeSize={2} selectCodes type={AutoInputType.COUNTRIES} 
          onChange={(values, newValue, removedValue) => setBirthCountry (newValue?.code)} label={t("register.form.birth_country.label")}
          placeholder={t("register.form.birth_country.placeholder")}/>
      </div>
      {/* Show only if birth country is Italy */}
      <div className="form-pair horizontal-list gap-4mm" style={{visibility: birthCountry == "IT" ? "visible" : "collapse"}}>
        <JanInput fieldName="fiscalCode" required={birthCountry == "IT"} inputType="text" busy={loading} label={t("register.form.fiscal_code.label")}
          placeholder={t("register.form.fiscal_code.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="birthRegion" minDecodeSize={2} selectCodes type={AutoInputType.STATES} param={birthCountry} paramRequired
          label={t("register.form.birth_region.label")} placeholder={t("register.form.birth_region.placeholder")}/>
        <JanInput fieldName="birthCity" required={true} inputType="text" busy={loading} label={t("register.form.birth_city.label")}
          placeholder={t("register.form.birth_city.placeholder")}/>
      </div>
      <hr></hr>
      <span className="title medium bold highlight">{t("register.form.section.residence_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="residenceCountry" required={true} minDecodeSize={2} selectCodes type={AutoInputType.COUNTRIES} 
          onChange={(values, newValue, removedValue) => setResidenceCountry (newValue?.code)} label={t("register.form.residence_country.label")}
          placeholder={t("register.form.residence_country.placeholder")}/>
        <AutoInput fieldName="residenceRegion" minDecodeSize={2} selectCodes type={AutoInputType.STATES} param={residenceCountry} paramRequired
          label={t("register.form.residence_region.label")} placeholder={t("register.form.residence_region.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="residenceCity" required={true} inputType="text" busy={loading} label={t("register.form.residence_city.label")} placeholder={t("register.form.residence_city.placeholder")}/>
        <JanInput fieldName="residenceZipCode" required={true} inputType="text" busy={loading} label={t("register.form.residence_zip_code.label")} placeholder={t("register.form.residence_zip_code.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="residenceAddress" required={true} inputType="text" busy={loading} label={t("register.form.residence_address.label")} placeholder={t("register.form.residence_address.placeholder")}/>
        <JanInput fieldName="phoneNumber" required={true} inputType="text" busy={loading} label={t("register.form.phone_number.label")} placeholder={t("register.form.phone_number.placeholder")}/>
      </div>
      <NoticeBox theme={NoticeTheme.FAQ} title={t("register.question.description_title")} className="descriptive">{t("register.question.description")}</NoticeBox>
    </DataForm>
    <Link href="/login" className="suggestion title small center color-subtitle underlined">{t('register.login_here')}</Link>
  </>;
  }
  