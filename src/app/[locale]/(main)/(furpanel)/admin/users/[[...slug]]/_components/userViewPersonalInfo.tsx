import { ICONS } from "@/components/icon";
import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import { extractPhonePrefix } from "@/lib/api/authentication/register";
import { AutoInputCountriesManager, AutoInputStatesManager, CountrySearchResult } from "@/lib/api/geo";
import { AutoInputGenderManager, AutoInputSexManager, REG_ITALIAN_FISCAL_CODE, UpdatePersonalInfoFormAction,
    UserPersonalInfo } from "@/lib/api/user";
import { firstOrUndefined } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

export default function UserViewPersonalInfo({
    personalInformation,
    reloadData
}: Readonly<{
    personalInformation: UserPersonalInfo,
    reloadData?: () => void
}>) {
    const [inEdit, setInEdit] = useState(false);
    const t = useTranslations();
    // Personal info logic
    const formRef = useRef<HTMLFormElement>(null);
    const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
    const [birthCountry, setBirthCountry] = useState<string | undefined>();
    const [residenceCountry, setResidenceCountry] = useState<string>();
    const [phonePrefix, setPhonePrefix] = useState<string>();
    const fiscalCodeRequired = [birthCountry, residenceCountry].includes("IT");

    return <>
        <DataForm className="vertical-list gap-2mm"
            action={new UpdatePersonalInfoFormAction}
            loading={personalInfoLoading}
            setLoading={setPersonalInfoLoading}
            onSuccess={() => { if (reloadData) reloadData() }}
            disableSave={!inEdit}
            formRef={formRef}
            additionalButtons={<>
                <Button iconName={inEdit ? ICONS.CANCEL : ICONS.EDIT}
                    type="button"
                    onClick={() => setInEdit(prev => {
                        if (prev) formRef.current?.reset();
                        return !prev;
                    })}>
                    {inEdit
                        ? t("common.cancel")
                        : t("common.CRUD.edit")}
                </Button>
            </>}>
            <input type="hidden" name="id" value={personalInformation?.id ?? ""}></input>
            <input type="hidden" name="userId" value={personalInformation?.userId ?? ""}></input>
            <div className="form-pair horizontal-list gap-4mm">
                <FpInput fieldName="firstName" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.first_name.label")}
                    placeholder={t("authentication.register.form.first_name.placeholder")}
                    initialValue={personalInformation?.firstName}
                    readOnly={!inEdit} />
                <FpInput fieldName="lastName" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.last_name.label")}
                    placeholder={t("authentication.register.form.last_name.placeholder")}
                    initialValue={personalInformation?.lastName}
                    readOnly={!inEdit} />
            </div>
            <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="sex" required minDecodeSize={0}
                    manager={new AutoInputSexManager}
                    label={t("authentication.register.form.sex.label")}
                    placeholder={t("authentication.register.form.sex.placeholder")}
                    initialData={personalInformation?.sex ? [personalInformation?.sex] : undefined}
                    readOnly={!inEdit} />
                <AutoInput fieldName="gender" required minDecodeSize={0}
                    manager={new AutoInputGenderManager}
                    label={t("authentication.register.form.gender.label")}
                    placeholder={t("authentication.register.form.gender.placeholder")}
                    initialData={personalInformation?.gender ? [personalInformation?.gender] : undefined}
                    readOnly={!inEdit} />
            </div>
            <div className="form-pair horizontal-list gap-4mm">
                <FpInput fieldName="allergies" required={false} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.allergies.label")}
                    placeholder={t("authentication.register.form.allergies.placeholder")}
                    initialValue={personalInformation?.allergies}
                    readOnly={!inEdit} />
            </div>
            <span className="title average">{t("authentication.register.form.section.birth_data")}</span>
            <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="birthCountry" required={true} minDecodeSize={2} multiple={false}
                    manager={new AutoInputCountriesManager}
                    onChange={(values, newValues) => setBirthCountry((firstOrUndefined(newValues) as CountrySearchResult)?.code)}
                    label={t("authentication.register.form.birth_country.label")}
                    placeholder={t("authentication.register.form.birth_country.placeholder")}
                    initialData={personalInformation?.birthCountry ? [personalInformation?.birthCountry] : undefined}
                    readOnly={!inEdit} />
                <FpInput fieldName="birthday" required={true} inputType="date" busy={personalInfoLoading}
                    label={t("authentication.register.form.birthday.label")} initialValue={personalInformation?.birthday}
                    readOnly={!inEdit} />
            </div>
            {/* Show only if birth country is Italy */}
            <div className="form-pair horizontal-list gap-4mm">
                <FpInput fieldName="fiscalCode" required={fiscalCodeRequired} minLength={16} maxLength={16} inputType="text"
                    pattern={REG_ITALIAN_FISCAL_CODE} busy={personalInfoLoading} disabled={!fiscalCodeRequired}
                    label={t("authentication.register.form.fiscal_code.label")} placeholder={t("authentication.register.form.fiscal_code.placeholder")}
                    initialValue={fiscalCodeRequired ? personalInformation?.fiscalCode : ""}
                    readOnly={!inEdit} />
            </div>
            <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="birthRegion" minDecodeSize={2} manager={new AutoInputStatesManager}
                    param={birthCountry}
                    paramRequired requiredIfPresent
                    label={t("authentication.register.form.birth_region.label")}
                    placeholder={t("authentication.register.form.birth_region.placeholder")}
                    initialData={personalInformation?.birthRegion ? [personalInformation?.birthRegion] : undefined}
                    readOnly={!inEdit} />
                <FpInput fieldName="birthCity" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.birth_city.label")}
                    placeholder={t("authentication.register.form.birth_city.placeholder")}
                    initialValue={personalInformation?.birthCity}
                    readOnly={!inEdit} />
            </div>
            <span className="title average">{t("authentication.register.form.section.residence_data")}</span>
            <div className="form-pair horizontal-list gap-4mm">
                <AutoInput fieldName="residenceCountry" required={true} minDecodeSize={2}
                    manager={new AutoInputCountriesManager}
                    label={t("authentication.register.form.residence_country.label")}
                    onChange={(values, newValues) => setResidenceCountry((firstOrUndefined(newValues) as CountrySearchResult)?.code)}
                    placeholder={t("authentication.register.form.residence_country.placeholder")}
                    initialData={personalInformation?.residenceCountry ? [personalInformation?.residenceCountry] : undefined}
                    readOnly={!inEdit} />
                <AutoInput fieldName="residenceRegion" minDecodeSize={2}
                    manager={new AutoInputStatesManager} param={residenceCountry} paramRequired requiredIfPresent
                    label={t("authentication.register.form.residence_region.label")}
                    placeholder={t("authentication.register.form.residence_region.placeholder")}
                    initialData={personalInformation?.residenceRegion ? [personalInformation?.residenceRegion] : undefined}
                    readOnly={!inEdit} />
            </div>
            <div className="form-pair horizontal-list gap-4mm">
                <FpInput fieldName="residenceCity" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.residence_city.label")}
                    placeholder={t("authentication.register.form.residence_city.placeholder")}
                    initialValue={personalInformation?.residenceCity}
                    readOnly={!inEdit} />
                <FpInput fieldName="residenceZipCode" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.residence_zip_code.label")}
                    placeholder={t("authentication.register.form.residence_zip_code.placeholder")}
                    initialValue={personalInformation?.residenceZipCode}
                    readOnly={!inEdit} />
            </div>
            <div className="form-pair horizontal-list gap-4mm">
                <FpInput fieldName="residenceAddress" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.residence_address.label")}
                    placeholder={t("authentication.register.form.residence_address.placeholder")}
                    initialValue={personalInformation?.residenceAddress}
                    readOnly={!inEdit} />
            </div>
            <div className="form-pair horizontal-list gap-4mm">
                {/* Phone number */}
                <AutoInput fieldName="phonePrefix" required={true} minDecodeSize={2}
                    manager={new AutoInputCountriesManager(true)}
                    label={t("authentication.register.form.phone_prefix.label")}
                    onChange={(values, newValue) => setPhonePrefix(extractPhonePrefix(firstOrUndefined(newValue) as CountrySearchResult))}
                    placeholder={t("authentication.register.form.phone_prefix.placeholder")}
                    idExtractor={(r) => (r as CountrySearchResult).phonePrefix ?? ""}
                    initialData={personalInformation?.prefixPhoneNumber ? [personalInformation?.prefixPhoneNumber] : undefined}
                    readOnly={!inEdit} />
                <FpInput fieldName="phoneNumber" required={true} inputType="text" busy={personalInfoLoading}
                    label={t("authentication.register.form.phone_number.label")}
                    placeholder={t("authentication.register.form.phone_number.placeholder")}
                    style={{ flex: "2" }} initialValue={personalInformation?.phoneNumber} prefix={phonePrefix}
                    readOnly={!inEdit} />
            </div>
        </DataForm>
    </>
}