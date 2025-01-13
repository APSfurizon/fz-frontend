'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DataForm from "@/app/_components/dataForm";
import { GetPersonalInfoAction, UpdatePersonalInfoFormAction, UserPersonalInfo } from "@/app/_lib/api/user";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/app/_lib/api/global";
import ModalError from "@/app/_components/modalError";
import { useUser } from "@/app/_lib/context/userProvider";
import JanInput from "@/app/_components/janInput";
import AutoInput from "@/app/_components/autoInput";
import { AutoInputCountriesManager, AutoInputSearchResult, AutoInputStatesManager, CountrySearchResult } from "@/app/_lib/components/autoInput";
import { firstOrUndefined } from "@/app/_lib/utils";
import "../../../../styles/furpanel/user.css";
import { ResetPasswordFormAction } from "@/app/_lib/api/authentication/recover";

export default function UserPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const tauth = useTranslations("authentication");
  const router = useRouter();
  const {showModal} = useModalUpdate();
  const {userLoading, userDisplay} = useUser();

  // Main logic

  // Personal info logic
  const [personalInformation, setPersonalInformation] = useState<UserPersonalInfo>();
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
  const [birthCountry, setBirthCountry] = useState<string | undefined>();
  const [residenceCountry, setResidenceCountry] = useState<string>();
  const fiscalCodeRequired = birthCountry == "IT";

  // Password change logic
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [password, setPassword] = useState<string>("s");
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const passwordMatch = confirmPassword === password;
  const passwordChangeError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => showModal(
      tcommon("error"),
      <ModalError error={err} translationRoot="authentication" translationKey="login.errors"></ModalError>,
      ICONS.ERROR
  );
  useEffect(()=>{
    if (personalInformation) return;
    setPersonalInfoLoading(true);
    runRequest(new GetPersonalInfoAction(), undefined, undefined, undefined)
    .then((result)=>setPersonalInformation(result as UserPersonalInfo))
    .catch((err)=>showModal(
        tcommon("error"), 
        <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
    )).finally(()=>setPersonalInfoLoading(false));
  }, [personalInformation])

  useTitle(t("user.title"));
  
  return (
      <div className="page">
        {/* User area */}
        <div className="section vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <Icon className="x-large" iconName={ICONS.PERSON}></Icon>
            <span className="title medium">{t("user.sections.user")}</span>
          </div>
          {/* Personal info manager */}
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm flex-vertical-center">
              <span className="title average">
                {t("user.sections.user_info")}
              </span>
            </div>
            <DataForm className="vertical-list gap-2mm" action={new UpdatePersonalInfoFormAction} loading={personalInfoLoading} setLoading={setPersonalInfoLoading}>
              <input type="hidden" name="id" value={personalInformation?.id}></input>
              <input type="hidden" name="userId" value={personalInformation?.userId}></input>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="firstName" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.first_name.label")} placeholder={tauth("register.form.first_name.placeholder")}
                  value={personalInformation?.firstName}/>
                <JanInput fieldName="lastName" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.last_name.label")} placeholder={tauth("register.form.last_name.placeholder")}
                  value={personalInformation?.lastName}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="allergies" required={false} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.allergies.label")} placeholder={tauth("register.form.allergies.placeholder")}
                  value={personalInformation?.allergies}/>
              </div>
              <span className="title average">{tauth("register.form.section.birth_data")}</span>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="birthCountry" required={true} minDecodeSize={2} multiple={false}
                  manager={new AutoInputCountriesManager} onChange={(values, newValues, removedValue) => setBirthCountry ((firstOrUndefined(newValues) as AutoInputSearchResult)?.code)}
                  label={tauth("register.form.birth_country.label")} placeholder={tauth("register.form.birth_country.placeholder")}
                  initialData={personalInformation?.birthCountry ? [personalInformation?.birthCountry] : undefined}/>
                <JanInput fieldName="birthday" required={true} inputType="date" busy={personalInfoLoading}
                label={tauth("register.form.birthday.label")} value={personalInformation?.birthday}/>
              </div>
              {/* Show only if birth country is Italy */}
              <div className="form-pair horizontal-list gap-4mm" style={{display: fiscalCodeRequired ? "block" : "none"}}>
                <JanInput fieldName="fiscalCode" required={fiscalCodeRequired} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.fiscal_code.label")} placeholder={tauth("register.form.fiscal_code.placeholder")}
                  value={personalInformation?.fiscalCode}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="birthRegion" minDecodeSize={2} manager={new AutoInputStatesManager} 
                  param={birthCountry} paramRequired requiredIfPresent label={tauth("register.form.birth_region.label")}
                  placeholder={tauth("register.form.birth_region.placeholder")}
                  initialData={personalInformation?.birthRegion ? [personalInformation?.birthRegion] : undefined}/>
                <JanInput fieldName="birthCity" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.birth_city.label")} placeholder={tauth("register.form.birth_city.placeholder")}
                  value={personalInformation?.birthCity}/>
              </div>
              <span className="title average">{tauth("register.form.section.residence_data")}</span>
              <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="residenceCountry" required={true} minDecodeSize={2}
                  manager={new AutoInputCountriesManager} label={tauth("register.form.residence_country.label")}
                  onChange={(values, newValues, removedValue) => setResidenceCountry ((firstOrUndefined(newValues) as AutoInputSearchResult)?.code)} 
                  placeholder={tauth("register.form.residence_country.placeholder")}
                  initialData={personalInformation?.residenceCountry ? [personalInformation?.residenceCountry] : undefined}/>
                <AutoInput fieldName="residenceRegion" minDecodeSize={2}
                  manager={new AutoInputStatesManager} param={residenceCountry} paramRequired requiredIfPresent
                  label={tauth("register.form.residence_region.label")} placeholder={tauth("register.form.residence_region.placeholder")}
                  initialData={personalInformation?.residenceRegion ? [personalInformation?.residenceRegion] : undefined}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="residenceCity" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.residence_city.label")} placeholder={tauth("register.form.residence_city.placeholder")}
                  value={personalInformation?.residenceCity}/>
                <JanInput fieldName="residenceZipCode" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.residence_zip_code.label")} placeholder={tauth("register.form.residence_zip_code.placeholder")}
                  value={personalInformation?.residenceZipCode}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                <JanInput fieldName="residenceAddress" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.residence_address.label")} placeholder={tauth("register.form.residence_address.placeholder")}
                  value={personalInformation?.residenceAddress}/>
              </div>
              <div className="form-pair horizontal-list gap-4mm">
                {/* Phone number */}
                <AutoInput fieldName="phonePrefix" required={true} minDecodeSize={2}
                  manager={new AutoInputCountriesManager(true)} label={tauth("register.form.phone_prefix.label")}
                  placeholder={tauth("register.form.phone_prefix.placeholder")}
                  idExtractor={(r) => (r as CountrySearchResult).phonePrefix ?? ""}
                  initialData={personalInformation?.prefixPhoneNumber ? [personalInformation?.prefixPhoneNumber] : undefined}/>
                <JanInput fieldName="phoneNumber" required={true} inputType="text" busy={personalInfoLoading}
                  label={tauth("register.form.phone_number.label")} placeholder={tauth("register.form.phone_number.placeholder")}
                  style={{flex: "2"}} value={personalInformation?.phoneNumber}/>
              </div>
            </DataForm>
          </div>
        </div>
        {/* User area */}
        <div className="section vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <Icon className="x-large" iconName={ICONS.SECURITY}></Icon>
            <span className="title medium">{t("user.sections.security")}</span>
          </div>
          {/* New password */}
          <div className="vertical-list gap-2mm">
            <div className="horizontal-list section-title gap-2mm flex-vertical-center">
              <span className="title average">
                {t("user.sections.security_password")}
              </span>
            </div>
            <DataForm className="login-form gap-4mm" loading={passwordChangeLoading} setLoading={setPasswordChangeLoading}
              action={new ResetPasswordFormAction} onFail={(err) => passwordChangeError(err)} disableSave={!passwordMatch}>
              <JanInput fieldName="password" required={true} inputType="password" busy={passwordChangeLoading} label={tauth("recover_confirm.input.new_password.label")}
                placeholder={tauth("recover_confirm.input.new_password.placeholder")} helpText={tauth("recover_confirm.input.new_password.help")}
                onChange={(e) => setPassword(e.currentTarget.value)}/>
              <JanInput required={true} inputType="password" busy={passwordChangeLoading} label={tauth("recover_confirm.input.confirm_password.label")}
                  placeholder={tauth("recover_confirm.input.confirm_password.placeholder")} onChange={(e) => setConfirmPassword(e.currentTarget.value)}/>
            </DataForm>
          </div>
        </div>
      </div>
    );
}
