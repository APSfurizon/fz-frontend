"use client"
import AutoInput from "@/components/input/autoInput";
import Icon from "@/components/icon";
import ErrorMessage from "@/components/errorMessage";
import { GetUserAdminViewAction, GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { ApiErrorResponse, runRequest } from "@/lib/api/global";
import {
    AutoInputUsersManager,
    UserSearchByMembershipNumberAction,
    UserSearchByOrderCodeAction,
    UserSearchByOrderSerialAction
} from "@/lib/api/user";
import { AutoInputManager, AutoInputSearchResult } from "@/lib/components/autoInput";
import { useModalUpdate } from "@/components/context/modalProvider";
import { errorCodeToApiError, getParentDirectory } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, createContext, HTMLInputTypeAttribute, useContext, useEffect, useMemo, useState } from "react";
import LoadingPanel from "@/components/loadingPanel";
import UserViewOrdersTable from "./_components/userViewOrdersTable";
import UserViewCardsTable from "./_components/userViewCardsTable";
import UserViewBadge from "./_components/userViewBadge";
import UserViewFursuitsTable from "./_components/fursuits/userViewFursuitsTable";
import Link from "next/link";
import UserViewSecurity from "./_components/userViewSecurity";
import UserViewPersonalInfo from "./_components/userViewPersonalInfo";
import UserViewRooms from "./_components/rooms/userViewRooms";
import "@/styles/furpanel/admin/userView.css";

// Context management
interface UserView {
    userData?: GetUserAdminViewResponse,
    reloadAll: () => void
}

const UserViewContext = createContext<UserView>(undefined as any);

export const useUserViewContext: () => UserView = () => {
    return useContext(UserViewContext);
};

type RadioButtonType = {
    label: string,
    name: string,
    value: string
}

enum SearchCriteria {
    COMMON = "searchTypeCommon",
    ORDER_SERIAL = "searchTypeOrderSerial",
    ORDER_CODE = "searchTypeOrderCode",
    MEMBERSHIP_CARD = "searchTypeMembershipCard"
}

type UserSearchConfig = {
    manager: AutoInputManager,
    minDecodeSize: number,
    type?: HTMLInputTypeAttribute
}

export default function AdminUsersPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const [userId, setUserId] = useState<number>();
    const [userData, setUserData] = useState<GetUserAdminViewResponse>();
    const reloadData = () => setUserData(undefined);
    const [loading, setLoading] = useState<boolean>();
    const [error, setError] = useState<ApiErrorResponse>();
    const t = useTranslations();
    const { showModal } = useModalUpdate();
    const path = usePathname();
    const router = useRouter();

    // Search criteria logic
    const [currentCriteria, setCurrentCriteria] = useState(SearchCriteria.COMMON);

    const searchCriteria: RadioButtonType[] = useMemo(() => [
        {
            name: "searchType",
            label: t("furpanel.admin.users.accounts.view.input.search_type.common"),
            value: SearchCriteria.COMMON
        },
        {
            name: "searchType",
            label: t("furpanel.admin.users.accounts.view.input.search_type.order_serial"),
            value: SearchCriteria.ORDER_SERIAL
        },
        {
            name: "searchType",
            label: t("furpanel.admin.users.accounts.view.input.search_type.order_code"),
            value: SearchCriteria.ORDER_CODE
        },
        {
            name: "searchType",
            label: t("furpanel.admin.users.accounts.view.input.search_type.membership_card"),
            value: SearchCriteria.MEMBERSHIP_CARD
        },
    ], []);

    const searchConfig: UserSearchConfig = useMemo(() => {
        switch (currentCriteria) {
            case SearchCriteria.COMMON:
                return {
                    manager: new AutoInputUsersManager(),
                    minDecodeSize: 3
                }
            case SearchCriteria.ORDER_SERIAL:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByOrderSerialAction(),
                        UserSearchByOrderSerialAction.getParams),
                    minDecodeSize: 1,
                    type: "number"
                };
            case SearchCriteria.ORDER_CODE:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByOrderCodeAction(),
                        UserSearchByOrderCodeAction.getParams),
                    minDecodeSize: 5
                }
            case SearchCriteria.MEMBERSHIP_CARD:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByMembershipNumberAction(),
                        UserSearchByMembershipNumberAction.getParams),
                    minDecodeSize: 7
                };
        }
    }, [currentCriteria]);

    const onSearchCriteriaChange = useMemo(() => function (e: ChangeEvent<HTMLInputElement>) {
        setCurrentCriteria(e.target.value as SearchCriteria);
    }, []);

    // Main Logic

    useEffect(() => {
        params.then(data => {
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

    useEffect(() => {
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
            .then(data => setUserData(data as GetUserAdminViewResponse))
            .catch((err) => showModal(t("common.error"), <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    }, [userId, userData]);

    const onUserSelect = (item: AutoInputSearchResult) => {
        router.push(`${userId ? getParentDirectory(path) : path}/./${item.id}`);
    }

    return <UserViewContext.Provider value={{
        userData: userData,
        reloadAll: reloadData
    }}>
        <div className="stretch-page">
            <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
                <Link href={getParentDirectory(path, userId ? 2 : 1)}><Icon icon="ARROW_BACK" /></Link>
                <div className="horizontal-list gap-2mm">
                    <span className="title medium">{t("furpanel.admin.users.accounts.view.title")}</span>
                </div>
            </div>
            <div className="input-container">
                <div className="search-criteria">
                    <p className="title semibold small">
                        {t("furpanel.admin.users.accounts.view.input.search_type.title")}
                    </p>
                    <div className="values gap-4mm">
                        {searchCriteria.map((criteria, index) =>
                            <label key={index} className="small" htmlFor={criteria.value}>
                                <input id={criteria.value}
                                    type="radio"
                                    name={criteria.name}
                                    value={criteria.value}
                                    checked={currentCriteria == criteria.value}
                                    onChange={onSearchCriteriaChange} />
                                &nbsp;
                                {criteria.label}
                            </label>)}
                    </div>
                </div>
                <AutoInput manager={searchConfig.manager}
                    label={t("furpanel.admin.users.accounts.view.input.selected_user.label")}
                    placeholder={t("furpanel.admin.users.accounts.view.input.selected_user.placeholder")}
                    initialData={userId ? [userId] : undefined}
                    param={[true]}
                    onSelect={onUserSelect}
                    minDecodeSize={searchConfig.minDecodeSize}
                    type={searchConfig.type}>
                </AutoInput>
            </div>
            {error && <ErrorMessage error={error} />}
            {loading && <LoadingPanel />}
            {/** User data render */}
            {userData && <>
                <div className="badge-grid">
                    <div className="badge-view">
                        {/* Badge */}
                        <p className="title medium">{t("furpanel.admin.users.accounts.view.badge")}</p>
                        <UserViewBadge userData={userData} reloadData={reloadData} />
                    </div>
                    <div className="fursuit-view">
                        {/* Fursuits */}
                        <p className="title medium">{t("furpanel.admin.users.accounts.view.fursuits")}</p>
                        <UserViewFursuitsTable userData={userData} reloadData={reloadData} />
                    </div>
                </div>
                {/* Orders */}
                <p className="title medium">{t("furpanel.admin.users.accounts.view.orders")}</p>
                <UserViewOrdersTable userData={userData} />
                {/* Rooms */}
                <p className="title medium">{t("furpanel.admin.users.accounts.view.rooms")}</p>
                <UserViewRooms userData={userData} reloadData={reloadData} />
                <div className="user-data-grid">
                    <div className="user-personal-data">
                        {/* Personal info */}
                        <p className="title medium">{t("furpanel.admin.users.accounts.view.personal_info")}</p>
                        <UserViewPersonalInfo personalInformation={userData.personalInfo}
                            reloadData={reloadData} />
                    </div>
                    <div className="user-membership-cards">
                        {/* Membership cards */}
                        <p className="title medium">{t("furpanel.admin.users.accounts.view.membership_cards")}</p>
                        <UserViewCardsTable userData={userData} />
                    </div>
                    <div className="user-security">
                        {/* Security */}
                        <p className="title medium">{t("furpanel.admin.users.security.title")}</p>
                        <UserViewSecurity userData={userData} reloadData={reloadData} />
                    </div>
                </div>
            </>}
        </div>
    </UserViewContext.Provider>;
}