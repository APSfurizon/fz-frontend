"use client"
import AutoInput from "@/components/autoInput";
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import JanInput from "@/components/janInput";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import { BanUserAction, GetUserAdminViewAction, GetUserAdminViewResponse, UnbanUserAction, UserIdRequestData } from "@/lib/api/admin/userView";
import { ApiErrorResponse, runRequest } from "@/lib/api/global";
import { AutoInputUsersManager, UserSearchAction } from "@/lib/api/user";
import { AutoInputSearchResult } from "@/lib/components/autoInput";
import { useModalUpdate } from "@/components/context/modalProvider";
import { copyContent, errorCodeToApiError, firstOrUndefined, translate } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/table.css";
import Checkbox from "@/components/checkbox";
import StatusBox from "@/components/statusBox";
import { mapOrderStatusToStatusBox } from "@/lib/api/booking";

export default function AdminUsersPage ({ params }: {params: Promise<{slug: string[]}>}) {
    const [userId, setUserId] = useState<number> ();
    const [userData, setUserData] = useState<GetUserAdminViewResponse> ();
    const [loading, setLoading] = useState<boolean> ();
    const [error, setError] = useState<ApiErrorResponse>();
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const tauth = useTranslations("authentication");
    const locale = useLocale();
    const {showModal} = useModalUpdate();
    const router = useRouter();

    // Ban logic
    const [banModalOpen, setBanModalOpen] = useState(false);

    const promptBan = () => {
        setUnbanModalOpen(false);
        setBanModalOpen(true);
    }

    const ban = () => {
        if (!userId) return;
        setLoading(true);
        const body: UserIdRequestData = {
            userId: userId
        }
        runRequest(new BanUserAction(), undefined, body)
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>{
            setLoading(false);
            setUserData(undefined);
        });
    }
    
    // Unban logic
    const [unbanModalOpen, setUnbanModalOpen] = useState(false);

    const promptUnban = () => {
        setBanModalOpen(false);
        setUnbanModalOpen(true);
    }

    const unban = () => {
        if (!userId) return;
        setLoading(true);
        const body: UserIdRequestData = {
            userId: userId
        }
        runRequest(new UnbanUserAction(), undefined, body)
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>{
            setLoading(false);
            setUserData(undefined);
        });
    }

    // Main Logic
    
    useEffect(()=>{
            params.then(data=>{
                if (!data || "slug" in data == false) return;
                const [selectedUserId] = data?.slug;
                if (!selectedUserId) return;
                const parsedId = parseInt(selectedUserId);
                if (parsedId && !Number.isNaN(parsedId)) {
                    setUserId(parsedId);
                } else if (Number.isNaN(parsedId)) {
                    setError(errorCodeToApiError("unknown_user"));
                }
            });
    }, []);

    useEffect(()=> {
        setError(undefined);
        setBanModalOpen(false);
        setUnbanModalOpen(false);
        window.history.pushState(null, '', `/admin/users/${userId ?? ""}`);
        if (!userId) {
            setLoading(false);
            setUserData(undefined);
            return;
        }
        if (userData && userId && userData.user.user.userId == userId) {
            return
        }
        setLoading(true);
        runRequest(new GetUserAdminViewAction(), [""+userId])
        .then (data => setUserData(data as GetUserAdminViewResponse))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>setLoading(false));
    }, [userId, userData]);

    const onUserSelect = (values?: AutoInputSearchResult[], newValues?: AutoInputSearchResult[],
        removedValue?: AutoInputSearchResult) => {
            const value = firstOrUndefined(newValues) as AutoInputSearchResult;
            setUserId(value?.id);
    }

    return <>
    <div className="page">
        <AutoInput manager={new AutoInputUsersManager} label={t("admin.users.input.selected_user.label")}
            placeholder={t("admin.users.input.selected_user.placeholder")}
            initialData={userId ? [userId] : undefined}
            onChange={onUserSelect}>
        </AutoInput>
        {error && <ModalError translationRoot="furpanel" translationKey="admin.users.errors" error={error}>
            </ModalError>}
        {loading && <span className="title horizontal-list gap-2mm flex-vertical-center">
            <Icon className="loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
            {tcommon("loading")}
        </span>}
        {/** User data render */}
        {userData && <>
            {/* Personal info */}
            <span className="title medium">{t("admin.users.personal_info")}</span>
            <div className="vertical-list flex-wrap" style={{gap: ".4em", padding: "0.625em"}}>
                <div className="horizontal-list flex-wrap gap-4mm">
                    <JanInput className="hoverable" label={tauth("register.form.first_name.label")} readOnly initialValue={userData.user.personalInfo.firstName} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    <JanInput className="hoverable" label={tauth("register.form.last_name.label")} readOnly initialValue={userData.user.personalInfo.lastName} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    <JanInput className="hoverable" label={tauth("register.form.email.label")} readOnly initialValue={userData.user.email} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    {userData.user.personalInfo.fiscalCode && 
                        <JanInput className="hoverable" label={tauth("register.form.fiscal_code.label")} readOnly initialValue={userData.user.personalInfo.fiscalCode} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>}
                </div>
                <hr></hr>
                <span className="title small bold">{tauth("register.form.section.birth_data")}</span>
                <div className="horizontal-list flex-wrap gap-4mm">
                    <JanInput className="hoverable" label={tauth("register.form.birth_country.label")} readOnly initialValue={userData.user.personalInfo.birthCountry} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    {userData.user.personalInfo.birthRegion &&
                        <JanInput className="hoverable" label={tauth("register.form.birth_region.label")} readOnly initialValue={userData.user.personalInfo.birthRegion} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>}
                    <JanInput className="hoverable" label={tauth("register.form.birth_city.label")} readOnly initialValue={userData.user.personalInfo.birthCity} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    <JanInput className="hoverable" label={tauth("register.form.birthday.label")} readOnly initialValue={userData.user.personalInfo.birthday} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                </div>
                <hr></hr>
                <span className="title small bold">{tauth("register.form.section.residence_data")}</span>
                <div className="horizontal-list flex-wrap gap-4mm">
                    <JanInput className="hoverable" label={tauth("register.form.residence_country.label")} readOnly initialValue={userData.user.personalInfo.residenceCountry} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    {userData.user.personalInfo.residenceRegion &&
                            <JanInput className="hoverable" label={tauth("register.form.residence_region.label")} readOnly initialValue={userData.user.personalInfo.residenceRegion} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>}
                    <JanInput className="hoverable" label={tauth("register.form.residence_city.label")} readOnly initialValue={userData.user.personalInfo.residenceCity} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    <JanInput className="hoverable" label={tauth("register.form.residence_zip_code.label")} readOnly initialValue={userData.user.personalInfo.residenceZipCode} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    <JanInput className="hoverable" label={tauth("register.form.residence_address.label")} readOnly initialValue={userData.user.personalInfo.residenceAddress} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                    <JanInput className="hoverable" label={tauth("register.form.phone_number.label")} readOnly initialValue={(userData.user.personalInfo.prefixPhoneNumber ?? "") + (userData.user.personalInfo.phoneNumber ?? "")} onClick={(e)=>copyContent(e.currentTarget)}></JanInput>
                </div>
            </div>
            {/* Orders */}
            <span className="title medium">{t("admin.users.orders")}</span>
            <table className="order-list rounded-m">
                <tbody>
                    <tr>
                        <th>{t("admin.users.orders_table.event_name")}</th>
                        <th>{t("admin.users.orders_table.order_code")}</th>
                        <th>{t("admin.users.orders_table.order_status")}</th>
                        <th>{t("admin.users.orders_table.is_daily")}</th>
                        <th>{t("admin.users.orders_table.sponsorship_type")}</th>
                        <th>{t("admin.users.orders_table.extra_days")}</th>
                        <th>{t("admin.users.orders_table.room_type")}</th>
                        <th></th>
                    </tr>
                {userData.orders.map((order, oi) => <tr key={oi} className="order-row">
                    <td>{translate(order.orderEvent.eventNames, locale)}</td>
                    <td>{order.code}</td>
                    <td>
                        <StatusBox status={mapOrderStatusToStatusBox(order.orderStatus)}>
                            {tcommon(`order_status.${order.orderStatus}`)}
                        </StatusBox>
                    </td>
                    <td className="centered"><Checkbox disabled initialValue={order.dailyTicket}></Checkbox></td>
                    <td>{order.sponsorship}</td>
                    <td>{order.extraDays}</td>
                    <td>{translate(order.room?.roomTypeNames, locale)}</td>
                    <td>
                        <a>
                        <Icon iconName={ICONS.OPEN_IN_NEW}></Icon>
                        </a>
                    </td>
                </tr>)}
                </tbody>
            </table>
            {/* Security */}
            <span className="title medium">{t("admin.users.security")}</span>
            <div className="vertical-list" style={{padding: "0.625em"}}>
                <div className="horizontal-list gap-2mm">
                    {!userData.user.banned && <Button iconName={ICONS.ACCOUNT_CIRCLE_OFF} onClick={promptBan}>
                        {t("admin.users.actions.ban")}</Button>}
                    {userData.user.banned && <Button iconName={ICONS.ACCOUNT_CIRCLE} onClick={promptUnban}>
                        {t("admin.users.actions.unban")}</Button>}
                </div>
            </div>
        </>}
    </div>
    <Modal open={banModalOpen} onClose={()=>setBanModalOpen(false)} busy={loading}
        title={t('admin.users.messages.confirm_ban.title')}>
            <span className="descriptive">{t('admin.users.messages.confirm_ban.description')}</span>
            <div className="bottom-toolbar">
                <Button title={tcommon('cancel')} className="danger" onClick={()=>setBanModalOpen(false)}
                    iconName={ICONS.CANCEL} busy={loading}>{tcommon('cancel')}</Button>
                <div className="spacer"></div>
                <Button title={t('admin.users.actions.ban')} onClick={()=>ban()}
                    iconName={ICONS.ACCOUNT_CIRCLE_OFF} busy={loading}>{t('admin.users.actions.ban')}</Button>    
            </div>
    </Modal>
    <Modal open={unbanModalOpen} onClose={()=>setUnbanModalOpen(false)} busy={loading}
        title={t('admin.users.messages.confirm_unban.title')}>
            <span className="descriptive">{t('admin.users.messages.confirm_unban.description')}</span>
            <div className="bottom-toolbar">
                <Button title={tcommon('cancel')} className="danger" onClick={()=>setUnbanModalOpen(false)}
                    iconName={ICONS.CANCEL} busy={loading}>{tcommon('cancel')}</Button>
                <div className="spacer"></div>
                <Button title={t('admin.users.actions.unban')} onClick={()=>unban()}
                    iconName={ICONS.ACCOUNT_CIRCLE} busy={loading}>{t('admin.users.actions.unban')}</Button>    
            </div>
    </Modal>
    </>;
}