"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import AutoInput from "@/components/input/autoInput";
import Checkbox from "@/components/input/checkbox";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import FpSelect from "@/components/input/fpSelect";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { extractPhonePrefix, RegisterFormAction } from "@/lib/api/authentication/register";
import { AutoInputCountriesManager, AutoInputStatesManager, CountrySearchResult } from "@/lib/api/geo";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import { AutoInputGenderManager, AutoInputSexManager, idTypeAnswers, shirtSizeAnswers } from "@/lib/api/user";
import { AutoInputSearchResult } from "@/lib/components/autoInput";
import { FormValidationError, getData } from "@/lib/components/dataForm";
import { inputEntityCodeExtractor, MAX_DATE, MIN_DATE } from "@/lib/components/input";
import { firstOrUndefined, today } from "@/lib/utils";
import "@/styles/authentication/register.css";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const telegramUsernameRegex = /^@?[a-zA-Z0-9_]{5,32}$/i;

export default function Register() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [birthCountry, setBirthCountry] = useState<string | undefined>();
  const [residenceCountry, setResidenceCountry] = useState<string>();
  const [phonePrefix, setPhonePrefix] = useState<string>();
  const { showModal } = useModalUpdate();

  const params = useSearchParams();

  const manageError = (err: ApiErrorResponse) => {
    showModal(t("common.error"), <ErrorMessage error={err} />, "ERROR");
  };

  const checkForm = useCallback((e: FormData) => {
    const toReturn: FormValidationError[] = [];
    // Evaluate fields
    const tosAccepted = getData(e, "tosAccepted") === "true";
    const privacyAccepted = getData(e, "privacyAccepted") === "true";
    const emailMatch = getData(e, "email") == getData(e, "confirmEmail");
    const passwordMatch = getData(e, "password") == getData(e, "confirmPassword");
    const telegramUsernameMatch = telegramUsernameRegex.test(getData(e, "telegramUsername") ?? "");
    // Add fails
    if (!tosAccepted) {
      toReturn.push({
        field: "tosAccepted",
        error: t("authentication.register.form.disclaimer_tos.missing"),
      });
    }
    if (!privacyAccepted) {
      toReturn.push({
        field: "privacyAccepted",
        error: t("authentication.register.form.disclaimer_data_protection.missing"),
      });
    }
    if (!passwordMatch) {
      toReturn.push({
        field: "confirmPassword",
        error: t("authentication.register.form.confirm_password.mismatch"),
      });
    }
    if (!emailMatch) {
      toReturn.push({
        field: "confirmEmail",
        error: t("authentication.register.form.confirm_email.mismatch"),
      });
    }
    if (!telegramUsernameMatch) {
      toReturn.push({
        field: "telegramUsername",
        error: t("authentication.register.form.telegram_username.not_valid"),
      });
    }
    return toReturn;
  }, []);

  const manageSuccess = () =>
    setTimeout(() => {
      const newParams = new URLSearchParams(params);
      newParams.append("register", "true");
      redirect(`/login?${newParams.toString()}`);
    }, 200);

  const fiscalCodeRequired = [birthCountry, residenceCountry].includes("IT");

  useTitle(t("authentication.register.title"));

  return (
    <>
      <div className="horizontal-list gap-4mm justify-content-center">
        <span className="title-pair">
          <Icon icon="DESIGN_SERVICES" />
          <span className="titular bold highlight">furpanel</span>
          <span> - </span>
          <span className="titular bold">{t("authentication.register.title").toLowerCase()}</span>
        </span>
      </div>
      <DataForm
        checkFn={checkForm}
        className="vertical-list login-form"
        busy={loading}
        setBusy={setLoading}
        action={new RegisterFormAction()}
        onSuccess={manageSuccess}
        onFail={(err) => manageError(err)}
        hideSave
        resetOnFail={false}
      >
        {/* Ask user for username and password */}
        <FpInput
          fieldName="fursonaName"
          required
          inputType="text"
          helpText={t("authentication.register.form.nickname.help")}
          label={t("authentication.register.form.nickname.label")}
          placeholder={t("authentication.register.form.nickname.placeholder")}
        />
        <FpInput
          fieldName="email"
          required
          inputType="email"
          label={t("authentication.register.form.email.label")}
          placeholder={t("authentication.register.form.email.placeholder")}
        />
        <FpInput
          fieldName="confirmEmail"
          required
          inputType="email"
          label={t("authentication.register.form.confirm_email.label")}
          placeholder={t("authentication.register.form.confirm_email.placeholder")}
        />
        <FpInput
          fieldName="password"
          minLength={6}
          required
          inputType="password"
          helpText={t("authentication.register.form.password.help")}
          label={t("authentication.register.form.password.label")}
          placeholder={t("authentication.register.form.password.placeholder")}
        />
        <FpInput
          fieldName="confirmPassword"
          minLength={6}
          required
          inputType="password"
          helpText={t("authentication.register.form.confirm_password.help")}
          label={t("authentication.register.form.confirm_password.label")}
          placeholder={t("authentication.register.form.confirm_password.placeholder")}
        />
        <hr></hr>
        {/* Ask user for name data*/}
        <span className="title medium bold highlight">{t("authentication.register.form.section.personal_info")}</span>
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="firstName"
            required
            inputType="text"
            label={t("authentication.register.form.first_name.label")}
            placeholder={t("authentication.register.form.first_name.placeholder")}
          />
          <FpInput
            fieldName="lastName"
            required
            inputType="text"
            label={t("authentication.register.form.last_name.label")}
            placeholder={t("authentication.register.form.last_name.placeholder")}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          <AutoInput
            fieldName="sex"
            required
            minDecodeSize={0}
            manager={new AutoInputSexManager()}
            label={t("authentication.register.form.sex.label")}
            helpText={t("authentication.register.form.sex.helptext")}
            placeholder={t("authentication.register.form.sex.placeholder")}
          />
          <AutoInput
            fieldName="gender"
            minDecodeSize={0}
            manager={new AutoInputGenderManager()}
            label={t("authentication.register.form.gender.label")}
            placeholder={t("authentication.register.form.gender.placeholder")}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="allergies"
            inputType="text"
            label={t("authentication.register.form.allergies.label")}
            placeholder={t("authentication.register.form.allergies.placeholder")}
            maxLength={1000}
          />
        </div>
        <hr></hr>
        {/* Ask user for birth data*/}
        <span className="title medium bold highlight">{t("authentication.register.form.section.birth_data")}</span>
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="birthday"
            required
            inputType="date"
            min={MIN_DATE}
            max={today()}
            label={t("authentication.register.form.birthday.label")}
          />
          <AutoInput
            fieldName="birthCountry"
            required
            minDecodeSize={2}
            manager={new AutoInputCountriesManager()}
            onChange={(p) => setBirthCountry((firstOrUndefined(p.newValues) as AutoInputSearchResult)?.code)}
            label={t("authentication.register.form.birth_country.label")}
            placeholder={t("authentication.register.form.birth_country.placeholder")}
            emptyIfUnselected
          />
        </div>
        {/* Show only if birth country is Italy */}
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="fiscalCode"
            required={fiscalCodeRequired}
            minLength={16}
            maxLength={16}
            inputType="text"
            disabled={!fiscalCodeRequired}
            pattern={/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/gim}
            label={t("authentication.register.form.fiscal_code.label")}
            placeholder={t("authentication.register.form.fiscal_code.placeholder")}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          <AutoInput
            fieldName="birthRegion"
            minDecodeSize={2}
            manager={new AutoInputStatesManager()}
            param={birthCountry}
            paramRequired
            requiredIfPresent
            label={t("authentication.register.form.birth_region.label")}
            placeholder={t("authentication.register.form.birth_region.placeholder")}
            emptyIfUnselected
          />
          <FpInput
            fieldName="birthCity"
            required
            inputType="text"
            label={t("authentication.register.form.birth_city.label")}
            placeholder={t("authentication.register.form.birth_city.placeholder")}
          />
        </div>
        <span className="title average">{t("authentication.register.form.section.identity_data")}</span>
        <div className="form-pair horizontal-list gap-4mm">
          <FpSelect
            fieldName="idType"
            required
            items={idTypeAnswers}
            label={t("authentication.register.form.id_type.label")}
            itemExtractor={inputEntityCodeExtractor}
            placeholder={t("authentication.register.form.id_type.placeholder")}
          />
          <FpInput
            fieldName="idNumber"
            required
            inputType="text"
            label={t("authentication.register.form.id_number.label")}
            placeholder={t("authentication.register.form.id_number.placeholder")}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="idIssuer"
            required
            inputType="text"
            label={t("authentication.register.form.id_issuer.label")}
            placeholder={t("authentication.register.form.id_issuer.placeholder")}
          />
          <FpInput
            fieldName="idExpiry"
            required
            inputType="date"
            min={MIN_DATE}
            max={MAX_DATE}
            label={t("authentication.register.form.id_expiry.label")}
            placeholder={t("authentication.register.form.id_expiry.placeholder")}
          />
        </div>
        <hr></hr>
        <span className="title medium bold highlight">{t("authentication.register.form.section.residence_data")}</span>
        <div className="form-pair horizontal-list gap-4mm">
          <AutoInput
            fieldName="residenceCountry"
            required
            minDecodeSize={2}
            manager={new AutoInputCountriesManager()}
            onChange={(p) => setResidenceCountry((firstOrUndefined(p.newValues) as AutoInputSearchResult)?.code)}
            label={t("authentication.register.form.residence_country.label")}
            placeholder={t("authentication.register.form.residence_country.placeholder")}
            emptyIfUnselected
          />
          <AutoInput
            fieldName="residenceRegion"
            minDecodeSize={2}
            manager={new AutoInputStatesManager()}
            param={residenceCountry}
            paramRequired
            requiredIfPresent
            label={t("authentication.register.form.residence_region.label")}
            placeholder={t("authentication.register.form.residence_region.placeholder")}
            emptyIfUnselected
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="residenceCity"
            required
            inputType="text"
            label={t("authentication.register.form.residence_city.label")}
            placeholder={t("authentication.register.form.residence_city.placeholder")}
          />
          <FpInput
            fieldName="residenceZipCode"
            required
            inputType="text"
            label={t("authentication.register.form.residence_zip_code.label")}
            placeholder={t("authentication.register.form.residence_zip_code.placeholder")}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          <FpInput
            fieldName="residenceAddress"
            required
            inputType="text"
            label={t("authentication.register.form.residence_address.label")}
            placeholder={t("authentication.register.form.residence_address.placeholder")}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          {/* Phone number */}
          <AutoInput
            fieldName="phonePrefix"
            required
            minDecodeSize={2}
            manager={new AutoInputCountriesManager(true)}
            label={t("authentication.register.form.phone_prefix.label")}
            placeholder={t("authentication.register.form.phone_prefix.placeholder")}
            idExtractor={(r) => extractPhonePrefix(r)}
            onChange={(p) => setPhonePrefix(extractPhonePrefix(firstOrUndefined(p.newValues) as CountrySearchResult))}
            emptyIfUnselected
          />
          <FpInput
            fieldName="phoneNumber"
            required
            inputType="text"
            label={t("authentication.register.form.phone_number.label")}
            placeholder={t("authentication.register.form.phone_number.placeholder")}
            style={{ flex: "2" }}
            minLength={2}
            prefix={phonePrefix}
          />
        </div>
        <div className="form-pair horizontal-list gap-4mm">
          {/* Telegram username */}
          <FpInput
            fieldName="telegramUsername"
            required
            inputType="text"
            pattern={telegramUsernameRegex}
            label={t("authentication.register.form.telegram_username.label")}
            placeholder={t("authentication.register.form.telegram_username.placeholder")}
            helpText={t("authentication.register.form.telegram_username.help")}
          />
          <FpSelect
            fieldName="shirtSize"
            required
            items={shirtSizeAnswers}
            label={t("authentication.register.form.shirt_size.label")}
            itemExtractor={inputEntityCodeExtractor}
            placeholder={t("authentication.register.form.shirt_size.placeholder")}
          />
        </div>
        <NoticeBox
          theme={NoticeTheme.FAQ}
          title={t("authentication.register.question.description_title")}
          className="descriptive"
        >
          {t("authentication.register.question.description")}
        </NoticeBox>
        <Checkbox fieldName="tosAccepted">
          {t.rich("authentication.register.form.disclaimer_tos.label", {
            terms: (chunks) => (
              <Link
                target="_blank"
                href={t("authentication.register.form.disclaimer_tos.link")}
                className="highlight underlined"
              >
                {chunks}
              </Link>
            ),
          })}
        </Checkbox>
        <Checkbox fieldName="privacyAccepted">
          {t("authentication.register.form.disclaimer_data_protection.label")}
        </Checkbox>
        <div className="toolbar-bottom">
          <FpButton type="submit" icon="KEY">
            {t("authentication.register.register")}
          </FpButton>
        </div>
      </DataForm>
      <div>
        <Link href={`/login?${params.toString()}`} className="suggestion title small center color-subtitle underlined">
          {t("authentication.register.login_here")}
        </Link>
      </div>
    </>
  );
}
