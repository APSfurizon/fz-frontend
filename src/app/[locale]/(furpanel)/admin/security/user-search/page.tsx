'use client'
import AutoInput from "@/components/input/autoInput";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import ImagePreviewModal from "@/components/imagePreviewModal";
import Button from "@/components/input/button";
import LoadingPanel from "@/components/loadingPanel";
import { useModalUpdate } from "@/components/context/modalProvider";
import { GetUserAdminViewAction, GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { runRequest } from "@/lib/api/global";
import {
    AutoInputUsersManager,
    GetUserByIdAction,
    UserSearchByFursuitIdAction,
    UserSearchByMembershipNumberAction,
    UserSearchByOrderCodeAction,
    UserSearchByOrderSerialAction,
} from "@/lib/api/user";
import { AutoInputManager, AutoInputSearchResult } from "@/lib/components/autoInput";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChangeEvent, HTMLInputTypeAttribute, useMemo, useState } from "react";

enum SearchCriteria {
    COMMON = "searchTypeCommon",
    ORDER_SERIAL = "searchTypeOrderSerial",
    ORDER_CODE = "searchTypeOrderCode",
    MEMBERSHIP_CARD = "searchTypeMembershipCard",
    USER_ID = "searchTypeUserId",
    FURSUIT_ID = "searchTypeFursuitId"
}

type UserSearchConfig = {
    manager: AutoInputManager,
    minDecodeSize: number,
    type?: HTMLInputTypeAttribute
}

export default function SecurityUserSearchPage() {
    const t = useTranslations();
    useTitle(t("furpanel.admin.users.security.user_search.title"));
    const router = useRouter();
    const { showModal } = useModalUpdate();

    const [loading, setLoading] = useState(false);
    const [currentCriteria, setCurrentCriteria] = useState(SearchCriteria.COMMON);
    const [userData, setUserData] = useState<GetUserAdminViewResponse>();

    const searchCriteria = [
        { name: "searchType", label: t("furpanel.admin.users.accounts.view.input.search_type.common"), value: SearchCriteria.COMMON },
        { name: "searchType", label: t("furpanel.admin.users.accounts.view.input.search_type.order_serial"), value: SearchCriteria.ORDER_SERIAL },
        { name: "searchType", label: t("furpanel.admin.users.accounts.view.input.search_type.order_code"), value: SearchCriteria.ORDER_CODE },
        { name: "searchType", label: t("furpanel.admin.users.accounts.view.input.search_type.membership_card"), value: SearchCriteria.MEMBERSHIP_CARD },
        { name: "searchType", label: t("furpanel.admin.users.accounts.view.input.search_type.user_id"), value: SearchCriteria.USER_ID },
        { name: "searchType", label: t("furpanel.admin.users.accounts.view.input.search_type.fursuit_id"), value: SearchCriteria.FURSUIT_ID },
    ];

    const searchConfig: UserSearchConfig = useMemo(() => {
        switch (currentCriteria) {
            case SearchCriteria.COMMON:
                return {
                    manager: new AutoInputUsersManager(),
                    minDecodeSize: 3
                };
            case SearchCriteria.ORDER_SERIAL:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByOrderSerialAction(), UserSearchByOrderSerialAction.getParams),
                    minDecodeSize: 1,
                    type: "number"
                };
            case SearchCriteria.ORDER_CODE:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByOrderCodeAction(), UserSearchByOrderCodeAction.getParams),
                    minDecodeSize: 5
                };
            case SearchCriteria.MEMBERSHIP_CARD:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByMembershipNumberAction(), UserSearchByMembershipNumberAction.getParams),
                    minDecodeSize: 7
                };
            case SearchCriteria.USER_ID:
                return {
                    manager: new AutoInputUsersManager(new GetUserByIdAction(), GetUserByIdAction.getParams),
                    minDecodeSize: 1,
                    type: "number"
                };
            case SearchCriteria.FURSUIT_ID:
                return {
                    manager: new AutoInputUsersManager(new UserSearchByFursuitIdAction(), UserSearchByFursuitIdAction.getParams),
                    minDecodeSize: 1,
                    type: "number"
                };
        }
    }, [currentCriteria]);

    const onSearchCriteriaChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentCriteria(e.target.value as SearchCriteria);
    };

    const onUserSelect = (item: AutoInputSearchResult) => {
        const parsedId = parseInt(String(item.id));
        if (Number.isNaN(parsedId)) return;

        setLoading(true);
        runRequest({
            action: new GetUserAdminViewAction(),
            pathParams: { id: parsedId }
        }).then((res) => {
            setUserData(res);
        }).catch((err) => {
            showModal(t("common.error"), <ErrorMessage error={err} />);
        }).finally(() => setLoading(false));
    };

    const openTelegram = (username?: string) => {
        if (!username) return;
        const clean = username.startsWith("@") ? username.substring(1) : username;
        window.open(`https://t.me/${clean}`, "_blank", "noopener,noreferrer");
    };

    const openPhone = (prefix?: string, phone?: string) => {
        const value = `${prefix ?? ""} ${phone ?? ""}`.trim();
        if (!value) return;
        window.location.href = `tel:${value}`;
    };

    return (
        <div className="stretch-page compact-main">
            <div style={{ marginBottom: 8 }}>
                <Button icon="ARROW_BACK" onClick={() => router.push("/admin")}>{t("common.back")}</Button>
            </div>

            <div className="vertical-list gap-3mm">
                <span className="title large" style={{ marginBottom: 6 }}>{t("furpanel.admin.users.security.user_search.title")}</span>

                <div className="table-container title rounded-m furpanel-table-container">
                    <p className="title semibold small" style={{ marginBottom: 8 }}>{t("furpanel.admin.users.accounts.view.input.search_type.title")}</p>
                    <div className="horizontal-list gap-4mm" style={{ flexWrap: "wrap" }}>
                        {searchCriteria.map((criteria) => (
                            <label key={criteria.value} className="small" htmlFor={criteria.value}>
                                <input
                                    id={criteria.value}
                                    type="radio"
                                    name={criteria.name}
                                    value={criteria.value}
                                    checked={currentCriteria === criteria.value}
                                    onChange={onSearchCriteriaChange}
                                />
                                &nbsp;{criteria.label}
                            </label>
                        ))}
                    </div>
                </div>

                <AutoInput
                    manager={searchConfig.manager}
                    label={t("furpanel.admin.users.security.user_search.input.search_user.label")}
                    placeholder={t("furpanel.admin.users.accounts.view.input.selected_user.placeholder")}
                    param={[true]}
                    onSelect={onUserSelect}
                    minDecodeSize={searchConfig.minDecodeSize}
                    type={searchConfig.type}
                />

                {loading && <LoadingPanel />}

                {userData && (
                    <div className="vertical-list gap-3mm table-container title rounded-m furpanel-table-container">
                        <span className="title medium" style={{ fontWeight: 700, marginBottom: 4 }}>{t("furpanel.admin.users.security.user_search.sections.user_data")}</span>
                        {userData.banned && <span style={{ color: "#e74c3c", fontWeight: 700 }}>{t("furpanel.admin.users.security.user_search.values.banned")}</span>}

                        <div className="horizontal-list gap-4mm flex-vertical-center" style={{ alignItems: "flex-start" }}>
                            {userData.badgeData?.mainBadge?.propic?.mediaUrl
                                ? <ImagePreviewModal
                                    imageUrl={userData.badgeData.mainBadge.propic.mediaUrl}
                                    alt={t("furpanel.admin.users.security.user_search.alt.user")}
                                    thumbSize={80}
                                    title={userData.badgeData?.mainBadge?.fursonaName || t("furpanel.admin.users.security.user_search.alt.user")}
                                />
                                : <div style={{ width: 80, height: 80, borderRadius: 12, background: "#2c3e50" }}></div>}
                            <div className="vertical-list gap-1mm" style={{ minWidth: 0 }}>
                                <span className="title small">{t("furpanel.admin.users.accounts.view.badges.fursona_name")}: {userData.badgeData?.mainBadge?.fursonaName || "-"}</span>
                                <span className="title small">{t("furpanel.admin.users.accounts.view.badges.user_id")}: {userData.orders?.[0]?.code || userData.badgeData?.mainBadge?.userId || "-"}</span>
                                <span className="title small">{t("furpanel.admin.users.accounts.view.badges.locale")}: {userData.badgeData?.mainBadge?.locale || "-"}</span>
                                <span className="title small">{t("furpanel.admin.users.accounts.view.badges.fursuit_badges_available")}: {userData.badgeData?.fursuits?.length ?? 0}</span>
                            </div>
                        </div>

                        <div className="vertical-list gap-2mm" style={{ marginTop: 6 }}>
                            <span className="title semibold small" style={{ marginBottom: 4 }}>{t("furpanel.admin.users.security.user_search.sections.user_info")}</span>
                            <div className="rounded-m" style={{ padding: "0.6em", width: "100%", boxSizing: "border-box", overflow: "hidden", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a" }}>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.name")}: {userData.personalInfo?.firstName || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.surname")}: {userData.personalInfo?.lastName || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.mail")}: {userData.email || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.sex")}: {userData.personalInfo?.sex || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.gender")}: {userData.personalInfo?.gender || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.birthday")}: {userData.personalInfo?.birthday || t("furpanel.admin.users.security.user_search.values.none")}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.allergies")}: {userData.personalInfo?.allergies || t("furpanel.admin.users.security.user_search.values.none")}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.telegram")}: {userData.personalInfo?.telegramUsername || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.phone")}: {`${userData.personalInfo?.prefixPhoneNumber || ""} ${userData.personalInfo?.phoneNumber || ""}`.trim() || "-"}</span>
                                <div className="horizontal-list gap-2mm" style={{ marginTop: 8 }}>
                                    <Button icon="SEND" onClick={() => openTelegram(userData.personalInfo?.telegramUsername)}>Telegram</Button>
                                    <Button onClick={() => openPhone(userData.personalInfo?.prefixPhoneNumber, userData.personalInfo?.phoneNumber)}>{t("furpanel.admin.users.security.user_search.actions.call")}</Button>
                                </div>
                                <span className="title small" style={{ display: "block", marginTop: 8, fontWeight: 700 }}>{t("furpanel.admin.users.security.user_search.fields.permissions")}:</span>
                                <span className="title small color-subtitle" style={{ whiteSpace: "pre-line" }}>
                                    {userData.roles?.length ? `- ${userData.roles.map(r => r.displayName).join("\n- ")}` : t("furpanel.admin.users.security.user_search.values.none")}
                                </span>
                            </div>
                        </div>

                        <div className="vertical-list gap-2mm" style={{ marginTop: 6 }}>
                            <span className="title semibold small" style={{ marginBottom: 4 }}>{t("furpanel.admin.users.security.user_search.sections.user_order_room")}</span>
                            <div className="rounded-m" style={{ padding: "0.6em", width: "100%", boxSizing: "border-box", overflow: "hidden", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a" }}>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.have_order")}: {userData.currentRoomdata?.hasOrder ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.have_room")}: {userData.currentRoomdata?.currentRoomInfo?.roomId ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.security.user_search.fields.room_name")}: {userData.currentRoomdata?.currentRoomInfo?.roomName || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>{t("furpanel.admin.users.accounts.view.orders_table.extra_days")}: {userData.currentRoomdata?.currentRoomInfo?.extraDays || t("furpanel.admin.users.security.user_search.values.none")}</span>
                                <span className="title small" style={{ display: "block" }}>
                                    {t("furpanel.admin.users.security.user_search.fields.check_in_out")}: {String(userData.currentRoomdata?.currentRoomInfo?.checkinDate || "-")} {t("furpanel.admin.users.security.user_search.values.to")} {String(userData.currentRoomdata?.currentRoomInfo?.checkoutDate || "-")}
                                </span>
                                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap", marginTop: 6 }}>
                                    <span className="title small">{t("furpanel.admin.users.security.user_search.fields.guests")}:</span>
                                    {userData.currentRoomdata?.currentRoomInfo?.guests
                                        ?.filter((g) => g.roomGuest?.confirmed)
                                        ?.map((g, idx) => (
                                            <span key={`${g.user?.userId || idx}`} className="title small color-subtitle">{g.user?.fursonaName}</span>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="vertical-list gap-2mm" style={{ marginTop: 6 }}>
                            <span className="title semibold small" style={{ marginBottom: 4 }}>{t("furpanel.admin.users.accounts.view.fursuits")}</span>
                            {(userData.badgeData?.fursuits ?? []).length === 0 && <span className="title small color-subtitle">{t("furpanel.admin.users.security.user_search.values.none")}</span>}
                            {(userData.badgeData?.fursuits ?? []).map((item, index) => (
                                <div key={`${item.fursuit?.id || index}`} className="rounded-m" style={{ width: "100%", boxSizing: "border-box", overflow: "hidden", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a" }}>
                                    <div className="horizontal-list gap-4mm flex-vertical-center" style={{ alignItems: "flex-start", padding: "0.6em" }}>
                                        {item.fursuit?.propic?.mediaUrl
                                            ? <ImagePreviewModal
                                                imageUrl={item.fursuit.propic.mediaUrl}
                                                alt={item.fursuit.name || t("furpanel.admin.users.security.user_search.alt.fursuit")}
                                                thumbSize={80}
                                                title={item.fursuit.name || t("furpanel.admin.users.security.user_search.alt.fursuit")}
                                            />
                                            : <div style={{ width: 80, height: 80, borderRadius: 12, background: "#2c3e50" }}></div>}
                                        <div className="vertical-list gap-1mm" style={{ minWidth: 0 }}>
                                            <span className="title small">{t("furpanel.admin.users.accounts.view.fursuit_table.name")}: {item.fursuit?.name || "-"}</span>
                                            <span className="title small">{t("furpanel.admin.users.accounts.view.fursuit_table.species")}: {item.fursuit?.species || "-"}</span>
                                            <span className="title small">{t("furpanel.admin.users.security.user_search.fields.bring_to_event")}: {item.bringingToEvent ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
