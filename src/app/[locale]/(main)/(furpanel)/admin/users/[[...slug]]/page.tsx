"use client"
import AutoInput from "@/components/input/autoInput";
import Icon, { ICONS } from "@/components/icon";
import ModalError from "@/components/modalError";
import { GetUserAdminViewAction, GetUserAdminViewResponse} from "@/lib/api/admin/userView";
import { ApiErrorResponse, runRequest } from "@/lib/api/global";
import { AutoInputUsersManager } from "@/lib/api/user";
import { AutoInputSearchResult } from "@/lib/components/autoInput";
import { useModalUpdate } from "@/components/context/modalProvider";
import { errorCodeToApiError, getParentDirectory } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPanel from "@/components/loadingPanel";
import UserViewOrdersTable from "./_components/userViewOrdersTable";
import UserViewCardsTable from "./_components/userViewCardsTable";
import UserViewBadge from "./_components/userViewBadge";
import UserViewFursuitsTable from "./_components/fursuits/userViewFursuitsTable";
import Link from "next/link";
import UserViewSecurity from "./_components/userViewSecurity";
import UserViewPersonalInfo from "./_components/userViewPersonalInfo";
import UserViewRooms from "./_components/rooms/userViewRooms";

export default function AdminUsersPage ({ params }: {params: Promise<{slug: string[]}>}) {
    const [userId, setUserId] = useState<number> ();
    const [userData, setUserData] = useState<GetUserAdminViewResponse> ();
    const reloadData = () => setUserData(undefined);
    const [loading, setLoading] = useState<boolean> ();
    const [error, setError] = useState<ApiErrorResponse>();
    const t = useTranslations();
    const {showModal} = useModalUpdate();
    const path = usePathname();
    const router = useRouter();
    
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
        router.push(`${userId ? getParentDirectory(path) : path}/./${item.id}`);
    }

    return <>
    <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <Link href={getParentDirectory(path, userId ? 2 : 1)}><Icon iconName={ICONS.ARROW_BACK} /></Link>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">{t("furpanel.admin.users.accounts.view.title")}</span>
            </div>
        </div>
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
            {/* Badge */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.badge")}</span>
            <UserViewBadge userData={userData} reloadData={reloadData}/>
            {/* Fursuits */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.fursuits")}</span>
            <UserViewFursuitsTable userData={userData} reloadData={reloadData}/>
            {/* Orders */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.orders")}</span>
            <UserViewOrdersTable userData={userData}/>
            {/* Rooms */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.rooms")}</span>
            <UserViewRooms userData={userData} reloadData={reloadData}/>
            {/* Membership cards */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.membership_cards")}</span>
            <UserViewCardsTable userData={userData}/>
            {/* Personal info */}
            <span className="title medium">{t("furpanel.admin.users.accounts.view.personal_info")}</span>
            <UserViewPersonalInfo personalInformation={userData.personalInfo}
                reloadData={reloadData}/>
            {/* Security */}
            <span className="title medium">{t("furpanel.admin.users.security.title")}</span>
            <UserViewSecurity userData={userData} reloadData={reloadData}/>
        </>}
    </div>
    </>;
}