"use client"
import { ApiErrorResponse, ApiDetailedErrorResponse, isDetailedError } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import DataForm from "@/components/input/dataForm";
import Icon from "@/components/icon";
import FpInput from "@/components/input/fpInput";
import useTitle from "@/components/hooks/useTitle";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import AutoInput from "@/components/input/autoInput";
import { extractPhonePrefix, RegisterFormAction } from "@/lib/api/authentication/register";
import { AutoInputSearchResult } from "@/lib/components/autoInput";
import Checkbox from "@/components/input/checkbox";
import "@/styles/authentication/register.css";
import { firstOrUndefined, today } from "@/lib/utils";
import { AutoInputCountriesManager, AutoInputStatesManager, CountrySearchResult } from "@/lib/api/geo";
import { AutoInputGenderManager, AutoInputSexManager, idTypeAnswers, shirtSizeAnswers } from "@/lib/api/user";
import Button from "@/components/input/button";
import FpSelect from "@/components/input/fpSelect";
import { inputEntityCodeExtractor, MAX_DATE, MIN_DATE } from "@/lib/components/input";

export default function Register() {

  const t = useTranslations("authentication");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [birthCountry, setBirthCountry] = useState<string | undefined>();
  const [residenceCountry, setResidenceCountry] = useState<string>();
  const [phonePrefix, setPhonePrefix] = useState<string>();

  const [email, setEmail] = useState<string>("s");
  const [confirmEmail, setConfirmEmail] = useState<string>();

  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const params = useSearchParams();

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if (!isDetailedError(err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('login.errors.unknown_error');
      setError(errorMessage);
    }
  }

  const passwordMatch = confirmPassword === password;

  const emailMatch = confirmEmail === email;

  const checkForm = () => tosAccepted && privacyAccepted && passwordMatch && emailMatch;

  const manageSuccess = () => setTimeout(() => {
    const newParams = new URLSearchParams(params);
    newParams.append("register", "true");
    setError(undefined);
    redirect(`/login?${newParams.toString()}`);
  }, 200);

  const fiscalCodeRequired = [birthCountry, residenceCountry].includes("IT");

  useTitle(t("register.title"));

  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon icon="DESIGN_SERVICES"/>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('register.title').toLowerCase()}</span>
      </span>
    </div>
    {error && <span className="error-container title small center">
      {t(`register.errors.${(error ?? 'unknown_error').toLowerCase()}`)}
    </span>}
    <DataForm checkFn={checkForm}
      className="vertical-list login-form"
      loading={loading}
      setLoading={setLoading}
      action={new RegisterFormAction}
      onSuccess={manageSuccess}
      onFail={(err) => manageError(err)}
      hideSave
      disableSave={!tosAccepted || !privacyAccepted || !passwordMatch || !emailMatch}
      resetOnFail={false}>
      {/* Ask user for username and password */}
      <FpInput fieldName="fursonaName"
        required
        inputType="text"
        helpText={t("register.form.nickname.help")}
        label={t("register.form.nickname.label")} placeholder={t("register.form.nickname.placeholder")} />
      <FpInput fieldName="email" required={true} inputType="email" label={t("register.form.email.label")}
        placeholder={t("register.form.email.placeholder")} onChange={(e) => setEmail(e.target.value)} />
      <FpInput required={true} inputType="email" label={t("register.form.confirm_email.label")}
        placeholder={t("register.form.confirm_email.placeholder")} onChange={(e) => setConfirmEmail(e.target.value)}
        className={`${emailMatch ? 'success' : 'danger'}`} />
      <FpInput fieldName="password"
        minLength={6}
        required={true}
        inputType="password"
        helpText={t("register.form.password.help")}
        label={t("register.form.password.label")}
        placeholder={t("register.form.password.placeholder")}
        onChange={(e) => setPassword(e.currentTarget.value)} />
      <FpInput fieldName="confirmPassword"
        minLength={6}
        required={true}
        inputType="password"
        helpText={t("register.form.confirm_password.help")}
        label={t("register.form.confirm_password.label")}
        placeholder={t("register.form.confirm_password.placeholder")}
        onChange={
          (e) => setConfirmPassword(e.currentTarget.value)
        }
        className={`${passwordMatch ? 'success' : 'danger'}`} />
      <hr></hr>
      {/* Ask user for name data*/}
      <span className="title medium bold highlight">{t("register.form.section.personal_info")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="firstName"
          required
          inputType="text"
          label={t("register.form.first_name.label")}
          placeholder={t("register.form.first_name.placeholder")} />
        <FpInput fieldName="lastName"
          required={true}
          inputType="text"
          label={t("register.form.last_name.label")}
          placeholder={t("register.form.last_name.placeholder")} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="sex" required minDecodeSize={0}
          manager={new AutoInputSexManager}
          label={t("register.form.sex.label")}
          helpText={t("register.form.sex.helptext")}
          placeholder={t("register.form.sex.placeholder")} />
        <AutoInput fieldName="gender" minDecodeSize={0}
          manager={new AutoInputGenderManager}
          label={t("register.form.gender.label")} placeholder={t("register.form.gender.placeholder")} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="allergies"
          inputType="text"
          label={t("register.form.allergies.label")}
          placeholder={t("register.form.allergies.placeholder")} />
      </div>
      <hr></hr>
      {/* Ask user for birth data*/}
      <span className="title medium bold highlight">{t("register.form.section.birth_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="birthday"
          required
          inputType="date"
          min={MIN_DATE}
          max={today()}
          label={t("register.form.birthday.label")} />
        <AutoInput fieldName="birthCountry"
          required
          minDecodeSize={2}
          manager={new AutoInputCountriesManager}
          onChange={
            (p) => setBirthCountry((firstOrUndefined(p.newValues) as AutoInputSearchResult)?.code)
          }
          label={t("register.form.birth_country.label")}
          placeholder={t("register.form.birth_country.placeholder")}
          emptyIfUnselected />
      </div>
      {/* Show only if birth country is Italy */}
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="fiscalCode"
          required={fiscalCodeRequired}
          minLength={16}
          maxLength={16}
          inputType="text"
          disabled={!fiscalCodeRequired}
          pattern={/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/gmi}
          label={t("register.form.fiscal_code.label")}
          placeholder={t("register.form.fiscal_code.placeholder")} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="birthRegion"
          minDecodeSize={2}
          manager={new AutoInputStatesManager}
          param={birthCountry}
          paramRequired
          requiredIfPresent
          label={t("register.form.birth_region.label")}
          placeholder={t("register.form.birth_region.placeholder")}
          emptyIfUnselected />
        <FpInput fieldName="birthCity"
          required
          inputType="text"
          label={t("register.form.birth_city.label")}
          placeholder={t("register.form.birth_city.placeholder")} />
      </div>
      <span className="title average">{t("register.form.section.identity_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <FpSelect fieldName="idType" required
          items={idTypeAnswers}
          label={t("register.form.id_type.label")}
          itemExtractor={inputEntityCodeExtractor}
          placeholder={t("register.form.id_type.placeholder")} />
        <FpInput fieldName="idNumber" required inputType="text"
          label={t("register.form.id_number.label")}
          placeholder={t("register.form.id_number.placeholder")} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="idIssuer" required inputType="text"
          label={t("register.form.id_issuer.label")}
          placeholder={t("register.form.id_issuer.placeholder")} />
        <FpInput fieldName="idExpiry"
          required
          inputType="date"
          min={MIN_DATE}
          max={MAX_DATE}
          label={t("register.form.id_expiry.label")}
          placeholder={t("register.form.id_expiry.placeholder")} />
      </div>
      <hr></hr>
      <span className="title medium bold highlight">{t("register.form.section.residence_data")}</span>
      <div className="form-pair horizontal-list gap-4mm">
        <AutoInput fieldName="residenceCountry"
          required={true}
          minDecodeSize={2}
          manager={new AutoInputCountriesManager}
          onChange={
            (p) => setResidenceCountry((firstOrUndefined(p.newValues) as AutoInputSearchResult)?.code)
          }
          label={t("register.form.residence_country.label")}
          placeholder={t("register.form.residence_country.placeholder")}
          emptyIfUnselected />
        <AutoInput fieldName="residenceRegion"
          minDecodeSize={2}
          manager={new AutoInputStatesManager}
          param={residenceCountry}
          paramRequired
          requiredIfPresent
          label={t("register.form.residence_region.label")}
          placeholder={t("register.form.residence_region.placeholder")}
          emptyIfUnselected />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="residenceCity"
          required
          inputType="text"
          label={t("register.form.residence_city.label")}
          placeholder={t("register.form.residence_city.placeholder")} />
        <FpInput fieldName="residenceZipCode"
          required
          inputType="text"
          label={t("register.form.residence_zip_code.label")}
          placeholder={t("register.form.residence_zip_code.placeholder")} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        <FpInput fieldName="residenceAddress"
          required
          inputType="text"
          label={t("register.form.residence_address.label")}
          placeholder={t("register.form.residence_address.placeholder")} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        {/* Phone number */}
        <AutoInput fieldName="phonePrefix"
          required
          minDecodeSize={2}
          manager={new AutoInputCountriesManager(true)}
          label={t("register.form.phone_prefix.label")}
          placeholder={t("register.form.phone_prefix.placeholder")}
          idExtractor={(r) => extractPhonePrefix(r as CountrySearchResult)}
          onChange={
            (p) => setPhonePrefix(extractPhonePrefix(firstOrUndefined(p.newValues) as CountrySearchResult))
          }
          emptyIfUnselected />
        <FpInput fieldName="phoneNumber"
          required={true}
          inputType="text"
          label={t("register.form.phone_number.label")}
          placeholder={t("register.form.phone_number.placeholder")}
          style={{ flex: "2" }}
          prefix={phonePrefix} />
      </div>
      <div className="form-pair horizontal-list gap-4mm">
        {/* Telegram username */}
        <FpInput fieldName="telegramUsername" required inputType="text"
          pattern={/^@?[a-z0-9_]{5,32}$/i}
          label={t("register.form.telegram_username.label")}
          placeholder={t("register.form.telegram_username.placeholder")}
          helpText={t("register.form.telegram_username.help")} />
        <FpSelect fieldName="shirtSize" required
          items={shirtSizeAnswers}
          label={t("register.form.shirt_size.label")}
          itemExtractor={inputEntityCodeExtractor}
          placeholder={t("register.form.shirt_size.placeholder")} />
      </div>
      <NoticeBox theme={NoticeTheme.FAQ}
        title={t("register.question.description_title")}
        className="descriptive">
        {t("register.question.description")}
      </NoticeBox>
      <Checkbox onClick={(e, checked) => setTosAccepted(checked)}>
        {t.rich("register.form.disclaimer_tos.label", {
          terms: (chunks) => <Link target="_blank"
            href={t("register.form.disclaimer_tos.link")}
            className="highlight underlined">{chunks}</Link>
        })}
      </Checkbox>
      <Checkbox onClick={(e, checked) => setPrivacyAccepted(checked)}>
        {t("register.form.disclaimer_data_protection.label")}
      </Checkbox>
      <div className="toolbar-bottom">
        <Button type="submit" iconName={"KEY"} >{t("register.register")}</Button>
      </div>
    </DataForm>
    <div>
      <Link href={`/login?${params.toString()}`}
        className="suggestion title small center color-subtitle underlined">
        {t('register.login_here')}
      </Link>
    </div>
  </>;
}
