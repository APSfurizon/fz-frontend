"use client"
import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import { ICONS } from "@/components/icon";
import JanInput from "@/components/input/janInput";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import { BanUserAction, FullOrder, GetUserAdminViewAction, GetUserAdminViewResponse, UnbanUserAction,
    UserIdRequestData, 
    ViewOrderLinkApiAction,
    ViewOrderLinkResponse} from "@/lib/api/admin/userView";
import { ApiErrorResponse, runRequest } from "@/lib/api/global";
import { AutoInputUsersManager } from "@/lib/api/user";
import { AutoInputSearchResult } from "@/lib/components/autoInput";
import { useModalUpdate } from "@/components/context/modalProvider";
import { buildSearchParams, copyContent, errorCodeToApiError } from "@/lib/utils";
import { translate } from "@/lib/translations";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Checkbox from "@/components/input/checkbox";
import StatusBox from "@/components/statusBox";
import { mapOrderStatusToStatusBox } from "@/lib/api/booking";
import LoadingPanel from "@/components/loadingPanel";
import { createColumnHelper } from "@tanstack/react-table";
import FpTable from "@/components/table/fpTable";

export default function AdminUsersPage ({ params }: {params: Promise<{slug: string[]}>}) {
    const [userId, setUserId] = useState<number> ();
    const [userData, setUserData] = useState<GetUserAdminViewResponse> ();
    const [loading, setLoading] = useState<boolean> ();
    const [error, setError] = useState<ApiErrorResponse>();
    const t = useTranslations();
    const locale = useLocale();
    const {showModal} = useModalUpdate();
    const path = usePathname();
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
            t("common.error"), 
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
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>{
            setLoading(false);
            setUserData(undefined);
        });
    }

    // Orders table
    /* Regular badges table */
        const [viewOrderLoading, setViewOrderLoading] = useState(false);
        const viewOrder = (orderId: number) => {
            setViewOrderLoading(true);
            runRequest(new ViewOrderLinkApiAction(), undefined, undefined, buildSearchParams({"id": String(orderId)}))
            .then ((result) => window.open((result as ViewOrderLinkResponse).link, '_blank'))
            .catch((err)=>showModal(
                t("common.error"), 
                <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
            )).finally(()=>setViewOrderLoading(false));
        }

        const regularColumnHelper = createColumnHelper<FullOrder>();
        const [orderColumns] = useState(() => [
            regularColumnHelper.accessor(itm=>translate(itm.orderEvent.eventNames, locale), {
                id: 'eventName',
                header: t("furpanel.admin.users.accounts.view.orders_table.event_name")
            }),
            regularColumnHelper.accessor('code', {
                id: 'orderCode',
                header: t("furpanel.admin.users.accounts.view.orders_table.order_code"),
            }),
            regularColumnHelper.accessor(itm => t(`common.order_status.${itm.orderStatus}`), {
                id: 'orderStatus',
                header: t("furpanel.admin.users.accounts.view.orders_table.order_status"),
                cell: props => (
                    <StatusBox status={mapOrderStatusToStatusBox(props.row.original.orderStatus)}>
                        {t(`common.order_status.${props.row.original.orderStatus}`)}
                    </StatusBox>)
            }),
            regularColumnHelper.accessor(itm=>itm.daily ? 'daily' : '', {
                id: 'isDaily',
                header: t("furpanel.admin.users.accounts.view.orders_table.is_daily"),
                cell: props => <Checkbox initialValue={props.row.original.daily} disabled/>
            }),
            regularColumnHelper.accessor('sponsorship', {
                id: 'sponsorship',
                header: t("furpanel.admin.users.accounts.view.orders_table.sponsorship_type"),
            }),
            regularColumnHelper.accessor('extraDays', {
                id: 'extraDays',
                header: t("furpanel.admin.users.accounts.view.orders_table.extra_days"),
            }),
            regularColumnHelper.accessor(itm=>`${itm.hotelInternalName} - ${itm.roomInternalName} (${itm.roomCapacity})`, {
                id: 'roomType',
                header: t("furpanel.admin.users.accounts.view.orders_table.room_type"),
            }),
            regularColumnHelper.display({
                id: 'actionViewOrder',
                header: '',
                cell: props => <Button iconName={ICONS.OPEN_IN_NEW}
                    onClick={()=>viewOrder(props.row.original.id)}
                    busy={viewOrderLoading}/>,
                maxSize: 50
            })
        ]);

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
        if (!userId) {
            setLoading(false);
            setUserData(undefined);
            return;
        }
        if (userData && userId && userData.personalInfo.userId == userId) {
            return;
        }
        setLoading(true);
        runRequest(new GetUserAdminViewAction(), [String(userId)])
        .then (data => setUserData(data as GetUserAdminViewResponse))
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>setLoading(false));
    }, [userId, userData]);

    const onUserSelect = (item: AutoInputSearchResult) => {
        router.push(`${path}/./${item.id}`);
    }

    return <>
    <div className="page">
        <AutoInput manager={new AutoInputUsersManager}
            label={t("furpanel.admin.users.accounts.view.input.selected_user.label")}
            placeholder={t("furpanel.admin.users.accounts.view.input.selected_user.placeholder")}
            initialData={userId ? [userId] : undefined}
            param={[true]}
            onSelect={onUserSelect}>
        </AutoInput>
        {error && <ModalError translationRoot="furpanel" translationKey="admin.users.errors" error={error}>
            </ModalError>}
        {loading && <LoadingPanel/>}
        {/** User data render */}
        {userData && <>
            {/* Personal info */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.personal_info")}</span>
            <div className="vertical-list flex-wrap" style={{gap: ".4em", padding: "0.625em"}}>
                <div className="horizontal-list flex-wrap gap-4mm">
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.first_name.label")}
                        readOnly
                        initialValue={userData.personalInfo.firstName}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.last_name.label")}
                        readOnly
                        initialValue={userData.personalInfo.lastName}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.email.label")}
                        readOnly
                        initialValue={userData.email}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    {userData.personalInfo.fiscalCode && 
                        <JanInput className="hoverable"
                            label={t("authentication.register.form.fiscal_code.label")}
                            readOnly
                            initialValue={userData.personalInfo.fiscalCode}
                            onClick={(e)=>copyContent(e.currentTarget)}/>}
                </div>
                <hr></hr>
                <span className="title small bold">{t("authentication.register.form.section.birth_data")}</span>
                <div className="horizontal-list flex-wrap gap-4mm">
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.birth_country.label")}
                        readOnly
                        initialValue={userData.personalInfo.birthCountry}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    {userData.personalInfo.birthRegion &&
                        <JanInput className="hoverable"
                            label={t("authentication.register.form.birth_region.label")}
                            readOnly
                            initialValue={userData.personalInfo.birthRegion}
                            onClick={(e)=>copyContent(e.currentTarget)}/>}
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.birth_city.label")}
                        readOnly
                        initialValue={userData.personalInfo.birthCity}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.birthday.label")}
                        readOnly
                        initialValue={userData.personalInfo.birthday}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                </div>
                <hr></hr>
                <span className="title small bold">{t("authentication.register.form.section.residence_data")}</span>
                <div className="horizontal-list flex-wrap gap-4mm">
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.residence_country.label")}
                        readOnly
                        initialValue={userData.personalInfo.residenceCountry}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    {userData.personalInfo.residenceRegion &&
                        <JanInput className="hoverable"
                        label={t("authentication.register.form.residence_region.label")}
                        readOnly
                        initialValue={userData.personalInfo.residenceRegion}
                        onClick={(e)=>copyContent(e.currentTarget)}/>}
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.residence_city.label")}
                        readOnly
                        initialValue={userData.personalInfo.residenceCity}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.residence_zip_code.label")}
                        readOnly
                        initialValue={userData.personalInfo.residenceZipCode}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.residence_address.label")}
                        readOnly
                        initialValue={userData.personalInfo.residenceAddress}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                    <JanInput className="hoverable"
                        label={t("authentication.register.form.phone_number.label")}
                        readOnly
                        initialValue={`${userData.personalInfo.prefixPhoneNumber ?? ""}${userData.personalInfo.phoneNumber ?? ""}`}
                        onClick={(e)=>copyContent(e.currentTarget)}/>
                </div>
            </div>
            {/* Orders */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.orders")}</span>
            <FpTable<FullOrder> rows={userData?.orders}
                columns={orderColumns}
                pinnedColumns={{right: ["actionViewOrder"]}}/>
            {/* Security */}
            <span className="title medium">{t("furpanel.admin.users.security.title")}</span>
            <div className="vertical-list" style={{padding: "0.625em"}}>
                <div className="horizontal-list gap-2mm">
                    {!userData.banned && <Button iconName={ICONS.ACCOUNT_CIRCLE_OFF} onClick={promptBan}>
                        {t("furpanel.admin.users.accounts.view.actions.ban")}</Button>}
                    {userData.banned && <Button iconName={ICONS.ACCOUNT_CIRCLE} onClick={promptUnban}>
                        {t("furpanel.admin.users.accounts.view.actions.unban")}</Button>}
                </div>
            </div>
        </>}
    </div>
    <Modal open={banModalOpen} onClose={()=>setBanModalOpen(false)} busy={loading}
        title={t("furpanel.admin.users.accounts.view.messages.confirm_ban.title")}>
            <span className="descriptive">
                {t("furpanel.admin.users.accounts.view.messages.confirm_ban.description")}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")}
                    className="danger"
                    onClick={()=>setBanModalOpen(false)}
                    iconName={ICONS.CANCEL}
                    busy={loading}>
                        {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button title={t("furpanel.admin.users.accounts.view.actions.ban")}
                    onClick={()=>ban()}
                    iconName={ICONS.ACCOUNT_CIRCLE_OFF}
                    busy={loading}>
                        {t("furpanel.admin.users.accounts.view.actions.ban")}
                </Button>    
            </div>
    </Modal>
    <Modal open={unbanModalOpen} onClose={()=>setUnbanModalOpen(false)} busy={loading}
        title={t("furpanel.admin.users.accounts.view.messages.confirm_unban.title")}>
            <span className="descriptive">
                {t("furpanel.admin.users.accounts.view.messages.confirm_unban.description")}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")}
                    className="danger"
                    onClick={()=>setUnbanModalOpen(false)}
                    iconName={ICONS.CANCEL}
                    busy={loading}>
                        {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button title={t("furpanel.admin.users.accounts.view.actions.unban")}
                    onClick={()=>unban()}
                    iconName={ICONS.ACCOUNT_CIRCLE}
                    busy={loading}>
                        {t("furpanel.admin.users.accounts.view.actions.unban")}
                </Button>
            </div>
    </Modal>
    </>;
}