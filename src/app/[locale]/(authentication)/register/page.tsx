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
import "../../../styles/authentication/register.css";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import AutoInput from "@/app/_components/autoInput";
import { RegisterFormAction } from "@/app/_lib/api/register";
import { AutoInputCountriesManager, AutoInputSearchResult, AutoInputStatesManager, CountrySearchResult } from "@/app/_lib/components/autoInput";
import Checkbox from "@/app/_components/checkbox";

export default function Register() {

  const t = useTranslations("authentication");
  const [error, setError] = useState<String | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [birthCountry, setBirthCountry] = useState<string | undefined>();
  const [residenceCountry, setResidenceCountry] = useState<string>();

  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if(!isDetailedError (err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('login.errors.unknown_error');
      setError(errorMessage);
    }
  }

  const passwordMatch = confirmPassword === password;

  const extractPhonePrefix = (r: CountrySearchResult) => {
    return r.phonePrefix ?? "";
  }

  const checkForm = () => {
    if (!tosAccepted || !privacyAccepted || !passwordMatch) {
      return false;
    } else {
      return true;
    }
  }

  const manageSuccess = () => setTimeout(()=>redirect("/home"), 200);

  const fiscalCodeRequired = birthCountry == "IT";

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
    <DataForm checkFn={checkForm} className="vertical-list login-form" loading={loading} setLoading={setLoading} action={new RegisterFormAction} onSuccess={manageSuccess} onFail={(err) => manageError(err)} saveButton={{iconName: ICONS.KEY, text: t("register.register")}} disableSave={!tosAccepted || !privacyAccepted || !passwordMatch}>
      {/* Ask user for username and password */}
      <JanInput fieldName="fursonaName" required={true} inputType="text" helpText={t("register.form.nickname.help")} busy={loading}
        label={t("register.form.nickname.label")} placeholder={t("register.form.nickname.placeholder")}/>
      <JanInput fieldName="email" required={true} inputType="email" busy={loading} label={t("register.form.email.label")}
        placeholder={t("register.form.email.placeholder")}/>
      
      <JanInput fieldName="password" minLength={6} required={true} inputType="password" helpText={t("register.form.password.help")}
        busy={loading} label={t("register.form.password.label")} placeholder={t("register.form.password.placeholder")}
        onChange={(e) => setPassword(e.currentTarget.value)} className={`${passwordMatch ? 'success' : 'danger'}`}/>
      <JanInput fieldName="confirmPassword" minLength={6} required={true} inputType="password" helpText={t("register.form.confirm_password.help")}
        busy={loading} label={t("register.form.confirm_password.label")} placeholder={t("register.form.confirm_password.placeholder")}
        onChange={(e) => setConfirmPassword(e.currentTarget.value)} className={`${passwordMatch ? 'success' : 'danger'}`}/>
      <hr></hr>
      {/* Ask user for name data*/}
      <span className="title medium bold highlight">{t("register.form.section.personal_info")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="firstName" required={true} inputType="text" busy={loading} label={t("register.form.first_name.label")}
          placeholder={t("register.form.first_name.placeholder")}/>
        <JanInput fieldName="lastName" required={true} inputType="text" busy={loading} label={t("register.form.last_name.label")}
          placeholder={t("register.form.last_name.placeholder")}/>
      </div>
      <hr></hr>
      {/* Ask user for birth data*/}
      <span className="title medium bold highlight">{t("register.form.section.birth_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="birthday" required={true} inputType="date" busy={loading} label={t("register.form.birthday.label")}/>
        <AutoInput fieldName="birthCountry" required={true} minDecodeSize={2} manager={new AutoInputCountriesManager} 
          onChange={(values, newValue, removedValue) => setBirthCountry (newValue?.code)} label={t("register.form.birth_country.label")}
          placeholder={t("register.form.birth_country.placeholder")}/>
      </div>
      {/* Show only if birth country is Italy */}
      <div className="form-pair horizontal-list gap-4mm" style={{display: fiscalCodeRequired ? "block" : "none"}}>
        <JanInput fieldName="fiscalCode" required={fiscalCodeRequired} inputType="text" busy={loading} label={t("register.form.fiscal_code.label")}
          placeholder={t("register.form.fiscal_code.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="birthRegion" minDecodeSize={2} manager={new AutoInputStatesManager} param={birthCountry} paramRequired requiredIfPresent
          label={t("register.form.birth_region.label")} placeholder={t("register.form.birth_region.placeholder")}/>
        <JanInput fieldName="birthCity" required={true} inputType="text" busy={loading} label={t("register.form.birth_city.label")}
          placeholder={t("register.form.birth_city.placeholder")}/>
      </div>
      <hr></hr>
      <span className="title medium bold highlight">{t("register.form.section.residence_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="residenceCountry" required={true} minDecodeSize={2} manager={new AutoInputCountriesManager} 
          onChange={(values, newValue, removedValue) => setResidenceCountry (newValue?.code)} label={t("register.form.residence_country.label")}
          placeholder={t("register.form.residence_country.placeholder")}/>
        <AutoInput fieldName="residenceRegion" minDecodeSize={2} manager={new AutoInputStatesManager} param={residenceCountry} paramRequired requiredIfPresent
          label={t("register.form.residence_region.label")} placeholder={t("register.form.residence_region.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="residenceCity" required={true} inputType="text" busy={loading} label={t("register.form.residence_city.label")} placeholder={t("register.form.residence_city.placeholder")}/>
        <JanInput fieldName="residenceZipCode" required={true} inputType="text" busy={loading} label={t("register.form.residence_zip_code.label")} placeholder={t("register.form.residence_zip_code.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <JanInput fieldName="residenceAddress" required={true} inputType="text" busy={loading} label={t("register.form.residence_address.label")} placeholder={t("register.form.residence_address.placeholder")}/>
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        {/* Phone number */}
        <AutoInput fieldName="phonePrefix" required={true} minDecodeSize={2} manager={new AutoInputCountriesManager(true)} 
          label={t("register.form.phone_prefix.label")} placeholder={t("register.form.phone_prefix.placeholder")} idExtractor={(r) => extractPhonePrefix(r as CountrySearchResult)}/>
        <JanInput fieldName="phoneNumber" required={true} inputType="text" busy={loading} label={t("register.form.phone_number.label")} 
          placeholder={t("register.form.phone_number.placeholder")} style={{flex: "2"}}/>
      </div>
      <NoticeBox theme={NoticeTheme.FAQ} title={t("register.question.description_title")} className="descriptive">{t("register.question.description")}</NoticeBox>
      <Checkbox onClick={(e, checked) => setTosAccepted(checked)}>{t.rich("register.form.disclaimer_tos.label", {
          terms: (chunks) => <Link href="#" className="highlight underlined">{chunks}</Link>
        })}</Checkbox>
      <Checkbox onClick={(e, checked) => setPrivacyAccepted(checked)}>{t.rich("register.form.disclaimer_data_protection.label", {
          terms: (chunks) => <Link href="#" className="highlight underlined">{chunks}</Link>
        })}</Checkbox>
    </DataForm>
    <Link href="/login" className="suggestion title small center color-subtitle underlined">{t('register.login_here')}</Link>
  </>;
  }
  