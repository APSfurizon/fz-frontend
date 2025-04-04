'use client'
import { useModalUpdate } from "@/components/context/modalProvider";
import Icon, { ICONS } from "@/components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/lib/api/hooks/useTitle";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DataForm from "@/components/input/dataForm";
import { AutoInputGenderManager, AutoInputSexManager, GetPersonalInfoAction, UpdatePersonalInfoFormAction, UserPersonalInfo } from "@/lib/api/user";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import ModalError from "@/components/modalError";
import { useUser } from "@/components/context/userProvider";
import JanInput from "@/components/input/janInput";
import AutoInput from "@/components/input/autoInput";
import { AutoInputSearchResult } from "@/lib/components/autoInput";
import { AutoInputStatesManager, CountrySearchResult, AutoInputCountriesManager } from "@/lib/api/geo";
import { firstOrUndefined } from "@/lib/utils";
import "@/styles/furpanel/user.css";
import { ResetPasswordFormAction } from "@/lib/api/authentication/recover";
import { extractPhonePrefix } from "@/lib/api/authentication/register";

export default function UserPage() {
  const t = useTranslations();
  const router = useRouter();
  const {showModal} = useModalUpdate();
  const {userLoading, userDisplay} = useUser();

  // Main logic

  // Personal info logic
  const [personalInformation, setPersonalInformation] = useState<UserPersonalInfo>();
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
  const [birthCountry, setBirthCountry] = useState<string | undefined>();
  const [residenceCountry, setResidenceCountry] = useState<string>();
  const [phonePrefix, setPhonePrefix] = useState<string>();
  const fiscalCodeRequired = [birthCountry, residenceCountry].includes("IT");

  // Password change logic
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const passwordMatch = confirmPassword === password;
  const passwordChangeError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => showModal(
      t("common.error"),
      <ModalError error={err} translationRoot="authentication" translationKey="login.errors"></ModalError>,
      ICONS.ERROR
  );
  useEffect(()=>{
    if (personalInformation) return;
    setPersonalInfoLoading(true);
    runRequest(new GetPersonalInfoAction(), undefined, undefined, undefined)
    .then((result)=>setPersonalInformation(result as UserPersonalInfo))
    .catch((err)=>showModal(
        t("common.error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
    )).finally(()=>setPersonalInfoLoading(false));
  }, [personalInformation])

  useTitle(t("furpanel.user.title"));
  
  return (
      <div className="page">
        {/* User area */}
        <div className="section vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <Icon className="x-large" iconName={ICONS.PERSON}></Icon>
            <span className="title medium">{t("furpanel.user.sections.user")}</span>
          </div>
          {/* Personal info manager */}
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm flex-vertical-center">
              <span className="title average">
                {t("furpanel.user.sections.user_info")}
              </span>
            </div>
            <DataForm className="vertical-list gap-2mm" action={new UpdatePersonalInfoFormAction} loading={personalInfoLoading} setLoading={setPersonalInfoLoading}>
              <input type="hidden" name="id" value={personalInformation?.id ?? ""}></input>
              <input type="hidden" name="userId" value={personalInformation?.userId ?? ""}></input>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="firstName" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.first_name.label")} placeholder={t("authentication.register.form.first_name.placeholder")}
                  initialValue={personalInformation?.firstName}/>
                <JanInput fieldName="lastName" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.last_name.label")} placeholder={t("authentication.register.form.last_name.placeholder")}
                  initialValue={personalInformation?.lastName}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="sex" required minDecodeSize={0}
                  manager={new AutoInputSexManager}
                  label={t("authentication.register.form.sex.label")} placeholder={t("authentication.register.form.sex.placeholder")}
                  initialData={personalInformation?.sex ? [personalInformation?.sex] : undefined}/>
                <AutoInput fieldName="gender" required minDecodeSize={0}
                  manager={new AutoInputGenderManager}
                  label={t("authentication.register.form.gender.label")} placeholder={t("authentication.register.form.gender.placeholder")}
                  initialData={personalInformation?.gender ? [personalInformation?.gender] : undefined}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="allergies" required={false} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.allergies.label")} placeholder={t("authentication.register.form.allergies.placeholder")}
                  initialValue={personalInformation?.allergies}/>
              </div>
              <span className="title average">{t("authentication.register.form.section.birth_data")}</span>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="birthCountry" required={true} minDecodeSize={2} multiple={false}
                  manager={new AutoInputCountriesManager} onChange={(values, newValues, removedValue) => setBirthCountry ((firstOrUndefined(newValues) as CountrySearchResult)?.code)}
                  label={t("authentication.register.form.birth_country.label")} placeholder={t("authentication.register.form.birth_country.placeholder")}
                  initialData={personalInformation?.birthCountry ? [personalInformation?.birthCountry] : undefined}/>
                <JanInput fieldName="birthday" required={true} inputType="date" busy={personalInfoLoading}
                label={t("authentication.register.form.birthday.label")} initialValue={personalInformation?.birthday}/>
              </div>
              {/* Show only if birth country is Italy */}
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="fiscalCode" required={fiscalCodeRequired} minLength={16} maxLength={16} inputType="text"
                  pattern={/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/gmi} busy={personalInfoLoading} disabled={!fiscalCodeRequired}
                  label={t("authentication.register.form.fiscal_code.label")} placeholder={t("authentication.register.form.fiscal_code.placeholder")}
                  initialValue={fiscalCodeRequired ? personalInformation?.fiscalCode : ""}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="birthRegion" minDecodeSize={2} manager={new AutoInputStatesManager} 
                  param={birthCountry} paramRequired requiredIfPresent label={t("authentication.register.form.birth_region.label")}
                  placeholder={t("authentication.register.form.birth_region.placeholder")}
                  initialData={personalInformation?.birthRegion ? [personalInformation?.birthRegion] : undefined}/>
                <JanInput fieldName="birthCity" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.birth_city.label")} placeholder={t("authentication.register.form.birth_city.placeholder")}
                  initialValue={personalInformation?.birthCity}/>
              </div>
              <span className="title average">{t("authentication.register.form.section.residence_data")}</span>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="residenceCountry" required={true} minDecodeSize={2}
                  manager={new AutoInputCountriesManager} label={t("authentication.register.form.residence_country.label")}
                  onChange={(values, newValues, removedValue) => setResidenceCountry ((firstOrUndefined(newValues) as CountrySearchResult)?.code)} 
                  placeholder={t("authentication.register.form.residence_country.placeholder")}
                  initialData={personalInformation?.residenceCountry ? [personalInformation?.residenceCountry] : undefined}/>
                <AutoInput fieldName="residenceRegion" minDecodeSize={2}
                  manager={new AutoInputStatesManager} param={residenceCountry} paramRequired requiredIfPresent
                  label={t("authentication.register.form.residence_region.label")} placeholder={t("authentication.register.form.residence_region.placeholder")}
                  initialData={personalInformation?.residenceRegion ? [personalInformation?.residenceRegion] : undefined}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="residenceCity" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.residence_city.label")} placeholder={t("authentication.register.form.residence_city.placeholder")}
                  initialValue={personalInformation?.residenceCity}/>
                <JanInput fieldName="residenceZipCode" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.residence_zip_code.label")} placeholder={t("authentication.register.form.residence_zip_code.placeholder")}
                  initialValue={personalInformation?.residenceZipCode}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="residenceAddress" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.residence_address.label")} placeholder={t("authentication.register.form.residence_address.placeholder")}
                  initialValue={personalInformation?.residenceAddress}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                {/* Phone number */}
                <AutoInput fieldName="phonePrefix" required={true} minDecodeSize={2}
                  manager={new AutoInputCountriesManager(true)} label={t("authentication.register.form.phone_prefix.label")}
                  onChange={(values, newValue, removedValue) => setPhonePrefix (extractPhonePrefix(firstOrUndefined(newValue) as CountrySearchResult))}
                  placeholder={t("authentication.register.form.phone_prefix.placeholder")}
                  idExtractor={(r) => (r as CountrySearchResult).phonePrefix ?? ""}
                  initialData={personalInformation?.prefixPhoneNumber ? [personalInformation?.prefixPhoneNumber] : undefined}/>
                <JanInput fieldName="phoneNumber" required={true} inputType="text" busy={personalInfoLoading}
                  label={t("authentication.register.form.phone_number.label")} placeholder={t("authentication.register.form.phone_number.placeholder")}
                  style={{flex: "2"}} initialValue={personalInformation?.phoneNumber} prefix={phonePrefix}/>
              </div>
            </DataForm>
          </div>
        </div>
        {/* User area */}
        <div className="section vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <Icon className="x-large" iconName={ICONS.SECURITY}></Icon>
            <span className="title medium">{t("furpanel.user.sections.security")}</span>
          </div>
          {/* New password */}
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm flex-vertical-center">
              <span className="title average">
                {t("furpanel.user.sections.security_password")}
              </span>
            </div>
            <DataForm className="login-form gap-4mm" loading={passwordChangeLoading} setLoading={setPasswordChangeLoading}
              action={new ResetPasswordFormAction} onFail={(err) => passwordChangeError(err)} disableSave={!passwordMatch}>
              <JanInput fieldName="password" required={true} inputType="password" busy={passwordChangeLoading} label={t("authentication.recover_confirm.input.new_password.label")}
                placeholder={t("authentication.recover_confirm.input.new_password.placeholder")} helpText={t("authentication.recover_confirm.input.new_password.help")}
                onChange={(e) => setPassword(e.currentTarget.value)}/>
              <JanInput required={true} inputType="password" busy={passwordChangeLoading} label={t("authentication.recover_confirm.input.confirm_password.label")}
                  placeholder={t("authentication.recover_confirm.input.confirm_password.placeholder")} onChange={(e) => setConfirmPassword(e.currentTarget.value)}/>
            </DataForm>
          </div>
        </div>
      </div>
    );
}
