"use client"
import Button from "@/app/_components/button";
import Icon, { ICONS } from "@/app/_components/icon";
import Modal from "@/app/_components/modal";
import ModalError from "@/app/_components/modalError";
import { ChangeCardRegisterStatusApiAction, ChangeCardRegisterStatusApiData, GetCardsApiAction, GetCardsApiResponse, UserCardData } from "@/app/_lib/api/admin/membershipManager";
import { runRequest } from "@/app/_lib/api/global";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from "react";
import Checkbox from "@/app/_components/checkbox";
import UserPicture from "@/app/_components/userPicture";
import "../../../../../../styles/table.css";
import "../../../../../../styles/furpanel/admin/membership.css";
import { copyContent, years } from "@/app/_lib/utils";
import JanInput from "@/app/_components/janInput";

export default function MembershipView({params}: {params: Promise<{ year: number }>}) {

    const [selectedYear, setSelectedYear] = useState<number>();
    const router = useRouter();
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const tauth = useTranslations("authentication");
    const {showModal, hideModal} = useModalUpdate();

    // Logic
    const [loading, setLoading] = useState(false);
    const [cardsData, setCardsData] = useState<GetCardsApiResponse | undefined | null>(null);
    
    // Mark as registered
    const markAsRegistered = (event: MouseEvent<HTMLButtonElement>,
        checked: boolean, setChecked: Dispatch<SetStateAction<boolean>>,
        setBusy: Dispatch<SetStateAction<boolean>>, cardId: number) => {
            setBusy(true);
            const data: ChangeCardRegisterStatusApiData = {
                membershipCardId: cardId,
                registered: checked
            }
            runRequest(new ChangeCardRegisterStatusApiAction(), undefined, data, undefined)
            .catch((err)=>{
                showModal(
                    tcommon("error"), 
                    <ModalError error={err} translationRoot="furpanel" translationKey="admin.errors"></ModalError>
                );
                setChecked(false);
            })
            .finally(()=>setBusy(false));
    };

    // Add card
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Select year
    useEffect(()=>{
        params.then((loadedParams)=>{
            // Validate year
            if (!loadedParams.year || isNaN(loadedParams.year)) {
                router.replace(""+new Date().getFullYear());
            }
            setSelectedYear(loadedParams.year)
        })
    }, []);

    // Validate year
    useEffect(()=> {
        if (!selectedYear || isNaN(selectedYear)) return;
        setCardsData(undefined);
    }, [selectedYear])

    // Load cards
    useEffect(()=>{
        if (!selectedYear || isNaN(selectedYear) || cardsData) return;
        setLoading(true);
        runRequest(new GetCardsApiAction(), undefined, undefined, new URLSearchParams({"year": ""+selectedYear}))
        .then((value)=>setCardsData(value as GetCardsApiResponse))
        .catch((err)=>{
            showModal(
              tcommon("error"), 
              <ModalError error={err} translationRoot="furpanel" translationKey="admin.errors">
              </ModalError>
            );
            setCardsData(null);
        }).finally(()=>setLoading(false));
    }, [cardsData])

    return <>
        <div className="page">
            <div className="horizontal-list flex-vertical-center gap-4mm">
                <a href="#" onClick={()=>router.back()}><Icon iconName={ICONS.ARROW_BACK}/></a>
                <div className="horizontal-list gap-2mm">
                    <span className="title medium">{t("admin.membership_manager.header", {yearStart: Number(selectedYear)})}</span>
                    <select className="title average" value={selectedYear} onChange={(e)=>router.push(e.target.value)}>
                        {years.map((o, k) => <option key={k}>{o}</option>)}
                    </select>
                </div>
                
                <div className="spacer"></div>
                <Button iconName={ICONS.REFRESH} onClick={()=>setCardsData(undefined)} debounce={3000}>{tcommon("reload")}</Button>
                <Button onClick={()=>setAddModalOpen(true)} busy={loading} disabled={!cardsData?.canAddCards} iconName={ICONS.ADD}>{t("admin.membership_manager.actions.add")}</Button>
            </div>
            <div className="table-container rounded-m">
                <div className="table rounded-m">
                    {loading && <div className="row">
                        <div className="data horizontal-list gap-2mm flex-vertical-center">
                            <Icon className="loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                            <span className="">{tcommon("loading")}</span>
                        </div>
                    </div>}
                    {(cardsData?.response?.length ?? 0) <= 0 && <div className="data">
                        <span>{t("admin.errors.NO_DATA")}</span>
                    </div>}
                    {cardsData?.response?.map((data, index)=><details className="row" key={index}>
                        <summary className="horizontal-list flex-vertical-center gap-2mm">
                            <Icon className="open" iconName={ICONS.ARROW_DROP_DOWN}></Icon>
                            <Icon className="close" iconName={ICONS.ARROW_DROP_UP}></Icon>
                            <div className="data horizontal-list flex-vertical-center gap-2mm">
                                <UserPicture userData={data.user} hideEffect></UserPicture>
                                <span>{data.user.fursonaName}</span>
                            </div>
                            <div className="spacer"></div>
                            <div className="data">
                                <Checkbox initialValue={data.membershipCard.registered} onClick={(event: MouseEvent<HTMLButtonElement>,
                                    checked: boolean, setChecked: Dispatch<SetStateAction<boolean>>,
                                    setBusy: Dispatch<SetStateAction<boolean>>)=>markAsRegistered(event, checked, setChecked, setBusy, data.membershipCard.cardId)}>
                                        {t("admin.membership_manager.table.headers.verified")}
                                </Checkbox>
                            </div>
                        </summary>
                        {/* Copyable data */}
                        <div className="vertical-list flex-wrap" style={{gap: ".4em", padding: "0.625em"}}>
                            <div className="horizontal-list flex-wrap gap-4mm">
                                <JanInput label={tauth("register.form.first_name.label")} readOnly value={data.userInfo.firstName} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                <JanInput label={tauth("register.form.last_name.label")} readOnly value={data.userInfo.lastName} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                            </div>
                            <hr></hr>
                            <span className="title small bold">{tauth("register.form.section.birth_data")}</span>
                            <div className="horizontal-list flex-wrap gap-4mm">
                                <JanInput label={tauth("register.form.birth_country.label")} readOnly value={data.userInfo.birthCountry} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                {data.userInfo.birthRegion &&
                                    <JanInput label={tauth("register.form.birth_region.label")} readOnly value={data.userInfo.birthRegion} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>}
                                <JanInput label={tauth("register.form.birthday.label")} readOnly value={data.userInfo.birthday} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                {data.userInfo.fiscalCode && 
                                    <JanInput label={tauth("register.form.fiscal_code.label")} readOnly value={data.userInfo.fiscalCode} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>}
                            </div>
                            <hr></hr>
                            <span className="title small bold">{tauth("register.form.section.residence_data")}</span>
                            <div className="horizontal-list flex-wrap gap-4mm">
                                <JanInput label={tauth("register.form.residence_country.label")} readOnly value={data.userInfo.residenceCountry} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                {data.userInfo.residenceRegion &&
                                        <JanInput label={tauth("register.form.residence_region.label")} readOnly value={data.userInfo.residenceRegion} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>}
                                <JanInput label={tauth("register.form.residence_city.label")} readOnly value={data.userInfo.residenceCity} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                <JanInput label={tauth("register.form.residence_zip_code.label")} readOnly value={data.userInfo.residenceZipCode} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                <JanInput label={tauth("register.form.residence_address.label")} readOnly value={data.userInfo.residenceAddress} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                                <JanInput label={tauth("register.form.phone_number.label")} readOnly value={(data.userInfo.prefixPhoneNumber ?? "") + (data.userInfo.phoneNumber ?? "")} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                            </div>
                        </div>
                    </details>)}
                </div>
            </div>
        </div>
        <Modal icon={ICONS.ADD} title={t("admin.membership_manager.actions.add")} open={addModalOpen} onClose={()=>setAddModalOpen(false)} busy={loading}>

        </Modal>
    </>;
}