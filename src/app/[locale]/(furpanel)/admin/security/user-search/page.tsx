'use client'
import AutoInput from "@/components/input/autoInput";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import Icon from "@/components/icon";
import ImagePreviewModal from "@/components/imagePreviewModal";
import Button from "@/components/input/button";
import LoadingPanel from "@/components/loadingPanel";
import { useModalUpdate } from "@/components/context/modalProvider";
import { GetUserSecurityViewAction, GetUserSecurityViewResponse } from "@/lib/api/admin/userView";
import { runRequest } from "@/lib/api/global";
import {
    AutoInputUsersManager,
    GetUserByIdAction,
    UserSearchByFursuitIdAction,
    UserSearchByMembershipNumberAction,
    UserSearchByOrderCodeAction,
    UserSearchByOrderSerialAction,
    getAutoInputSexes,
    getAutoInputGenders,
} from "@/lib/api/user";
import { AutoInputManager, AutoInputSearchResult, createSearchResult } from "@/lib/components/autoInput";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ChangeEvent, HTMLInputTypeAttribute, useEffect, useMemo, useState } from "react";
import "@/styles/furpanel/admin/security-pages.css";

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

function DataField({ label, value }: { label: string; value?: string | number | null | false | React.ReactNode }) {
    return (
        <div className="security-data-field">
            <span className="security-data-label">{label}</span>
            <span className="security-data-value">{value || "-"}</span>
        </div>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-m" style={{ marginTop: "0.6rem", width: "100%", boxSizing: "border-box", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a", overflow: "hidden" }}>
            <div style={{ padding: "0.4em 0.8em", borderBottom: "1px solid #00000020", background: "rgba(0,0,0,0.04)" }}>
                <span className="semibold small">{title}</span>
            </div>
            <div style={{ padding: "0.8em" }}>
                {children}
            </div>
        </div>
    );
}

export default function SecurityUserSearchPage() {
    const t = useTranslations();
    const locale = useLocale();
    useTitle(t("furpanel.admin.users.security.user_search.title"));
    const router = useRouter();
    const { showModal } = useModalUpdate();

    const [loading, setLoading] = useState(false);
    const [currentCriteria, setCurrentCriteria] = useState(SearchCriteria.COMMON);
    const [userData, setUserData] = useState<GetUserSecurityViewResponse>();
    const [searchInputValue, setSearchInputValue] = useState("");
    const [sexOptions, setSexOptions] = useState<Record<string, string>>({});
    const [genderOptions, setGenderOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        getAutoInputSexes().then(results => {
            const map: Record<string, string> = {};
            results.forEach(r => { if (r.code) map[r.code] = r.getDescription(locale); });
            setSexOptions(map);
        });
        getAutoInputGenders().then(results => {
            const map: Record<string, string> = {};
            results.forEach(r => { if (r.code) map[r.code] = r.getDescription(locale); });
            setGenderOptions(map);
        });
    }, [locale]);

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
                return { manager: new AutoInputUsersManager(), minDecodeSize: 3 };
            case SearchCriteria.ORDER_SERIAL:
                return { manager: new AutoInputUsersManager(new UserSearchByOrderSerialAction(), UserSearchByOrderSerialAction.getParams), minDecodeSize: 1, type: "number" };
            case SearchCriteria.ORDER_CODE:
                return { manager: new AutoInputUsersManager(new UserSearchByOrderCodeAction(), UserSearchByOrderCodeAction.getParams), minDecodeSize: 5 };
            case SearchCriteria.MEMBERSHIP_CARD:
                return { manager: new AutoInputUsersManager(new UserSearchByMembershipNumberAction(), UserSearchByMembershipNumberAction.getParams), minDecodeSize: 7 };
            case SearchCriteria.USER_ID:
                return { manager: new AutoInputUsersManager(new GetUserByIdAction(), GetUserByIdAction.getParams), minDecodeSize: 1, type: "number" };
            case SearchCriteria.FURSUIT_ID:
                return { manager: new AutoInputUsersManager(new UserSearchByFursuitIdAction(), UserSearchByFursuitIdAction.getParams), minDecodeSize: 1, type: "number" };
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
            action: new GetUserSecurityViewAction(),
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

    const selectGuest = (guestUserId: number, guestFursonaName: string) => {
        setCurrentCriteria(SearchCriteria.COMMON);
        setSearchInputValue(guestFursonaName);
        onUserSelect(createSearchResult({ id: guestUserId }));
    };

    const roomOwnerUserId = userData?.currentRoomdata?.currentRoomInfo?.roomOwner?.userId;

    return (
        <div className="stretch-page compact-main">
            <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
                <span style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => router.push("/admin")}>
                    <Icon icon="ARROW_BACK" />
                </span>
                <div className="horizontal-list gap-2mm">
                    <span className="title medium">{t("furpanel.admin.users.security.user_search.title")}</span>
                </div>
            </div>

            <div className="vertical-list gap-3mm">

                {/* Search type selector */}
                <div className="search-criteria">
                    <p className="title semibold small">{t("furpanel.admin.users.accounts.view.input.search_type.title")}</p>
                    <div className="values gap-4mm">
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
                    <div className="vertical-list gap-3mm" key={"security_search"} id={"security_search"}>

                        {/* Badge / Identity */}
                        <SectionCard title={t("furpanel.admin.users.security.user_search.sections.user_data")}>
                            <div className="horizontal-list gap-4mm flex-vertical-center" style={{ alignItems: "flex-start", marginBottom: "0.8em" }}>
                                {userData.badgeData?.mainBadge?.propic?.mediaUrl
                                    ? <ImagePreviewModal
                                        imageUrl={userData.badgeData.mainBadge.propic.mediaUrl}
                                        alt={t("furpanel.admin.users.security.user_search.alt.user")}
                                        thumbSize={80}
                                        title={userData.badgeData.mainBadge.fursonaName || t("furpanel.admin.users.security.user_search.alt.user")}
                                    />
                                    : <div style={{ width: 80, height: 80, borderRadius: 12, background: "#2c3e50", flexShrink: 0 }}></div>}
                                <div className="security-data-grid" style={{ flex: 1 }}>
                                    <DataField label={t("furpanel.admin.users.accounts.view.badges.fursona_name")} value={userData.badgeData?.mainBadge?.fursonaName} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.badges.user_id")} value={userData.badgeData?.mainBadge?.userId} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.badges.locale")} value={userData.badgeData?.mainBadge?.locale} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.badges.fursuit_badges_available")} value={userData.badgeData?.fursuits?.length ?? 0} />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Personal Info */}
                        <SectionCard title={t("furpanel.admin.users.security.user_search.sections.user_info")}>
                            <div className="security-data-grid-3">
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.name")} value={userData.firstName} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.surname")} value={userData.lastName} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.mail")} value={userData.email} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.sex")} value={userData.sex ? (sexOptions[userData.sex] ?? userData.sex) : null} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.gender")} value={userData.gender ? (genderOptions[userData.gender] ?? userData.gender) : null} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.birthday")} value={userData.birthday} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.allergies")} value={userData.allergies} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.telegram")} value={userData.telegramUsername} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.phone")} value={`${userData.prefixPhoneNumber || ""} ${userData.phoneNumber || ""}`.trim() || null} />
                            </div>
                            <div className="horizontal-list gap-2mm" style={{ marginTop: "0.8em" }}>
                                <Button icon="SEND" onClick={() => openTelegram(userData.telegramUsername ?? undefined)}>Telegram</Button>
                                <Button onClick={() => openPhone(userData.prefixPhoneNumber ?? undefined, userData.phoneNumber ?? undefined)}>{t("furpanel.admin.users.security.user_search.actions.call")}</Button>
                            </div>
                            {(userData.roles?.length ?? 0) > 0 && (
                                <div className="security-data-field" style={{ marginTop: "0.8em" }}>
                                    <span className="security-data-label">{t("furpanel.admin.users.security.user_search.fields.roles")}</span>
                                    <span className="security-data-value">
                                        {[...userData.roles].sort((a, b) => (a.roleId ?? 0) - (b.roleId ?? 0)).map(r => r.displayName).join("\n")}
                                    </span>
                                </div>
                            )}
                        </SectionCard>

                        {/* Membership Card */}
                        {userData.currentMembershipCard && (
                            <SectionCard title={t("furpanel.admin.users.accounts.view.membership_cards")}>
                                <div className="security-data-grid">
                                    <DataField label={t("furpanel.admin.users.accounts.view.cards_table.card_no")} value={userData.currentMembershipCard.cardNo} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.cards_table.issue_year")} value={userData.currentMembershipCard.issueYear} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.cards_table.id_in_year")} value={userData.currentMembershipCard.idInYear} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.cards_table.aps_form")} value={userData.currentMembershipCard.signedAt ? t("furpanel.admin.users.accounts.view.cards_table.aps_form_signed") : null} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.cards_table.sent_by_email")} value={userData.currentMembershipCard.sentByEmail ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")} />
                                </div>
                            </SectionCard>
                        )}

                        {/* Order */}
                        {userData.currentOrder && (
                            <SectionCard title={t("furpanel.admin.users.accounts.view.orders")}>
                                <div className="security-data-grid">
                                    <DataField label={t("furpanel.admin.users.accounts.view.orders_table.order_code")} value={userData.currentOrder.code} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.orders_table.event_order_serial")} value={userData.currentOrder.orderSerialInEvent} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.orders_table.order_status")} value={userData.currentOrder.orderStatus} />
                                    <DataField label={t("furpanel.admin.users.accounts.view.orders_table.sponsorship_type")} value={userData.currentOrder.sponsorship} />
                                    <DataField label={t("furpanel.admin.users.security.user_search.fields.board")} value={userData.currentOrder.board} />
                                    <div className="security-data-field" style={{ gridColumn: "span 2" }}>
                                        <span className="security-data-label">{t("furpanel.admin.users.accounts.view.orders_table.daily_days")}</span>
                                        <span className="security-data-value">{userData.currentOrder?.dailyDaysDates?.length ? [...userData.currentOrder?.dailyDaysDates].sort().join(", ") : "-"}</span>
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* Order & Room */}
                        <SectionCard title={t("furpanel.admin.users.security.user_search.sections.user_order_room")}>
                            <div className="security-data-grid-3">
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.have_order")} value={userData.currentRoomdata?.hasOrder ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.have_room")} value={userData.currentRoomdata?.currentRoomInfo?.roomId ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.is_owner")} value={roomOwnerUserId === userData.badgeData?.mainBadge?.userId ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.room_name")} value={userData.currentRoomdata?.currentRoomInfo?.roomName} />
                                <DataField label="Hotel / Room Type" value={userData.currentRoomdata?.currentRoomInfo?.roomData?.roomTypeNames?.["en"] ?? userData.currentRoomdata?.currentRoomInfo?.roomData?.roomInternalName} />
                                <DataField label={t("furpanel.admin.users.security.user_search.fields.room_capacity")} value={userData.currentRoomdata?.currentRoomInfo?.roomData?.roomCapacity} />
                                <DataField label={t("furpanel.admin.users.accounts.view.orders_table.extra_days")} value={userData.currentRoomdata?.currentRoomInfo?.extraDays} />
                                <div className="security-data-field" style={{ gridColumn: "span 2" }}>
                                    <span className="security-data-label">{t("furpanel.admin.users.security.user_search.fields.check_in_out")}</span>
                                    <span className="security-data-value">
                                        {userData.currentRoomdata?.currentRoomInfo
                                            ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                                                    <span>{String(userData.currentRoomdata.currentRoomInfo.checkinDate)}</span>
                                                    <Icon icon="ARROW_FORWARD" style={{ fontSize: "1em" }} />
                                                    <span>{String(userData.currentRoomdata.currentRoomInfo.checkoutDate)}</span>
                                                </div>
                                            )
                                            : "-"}
                                    </span>
                                </div>

                            </div>

                            {/* Guests (excluding self, highlighting owner) */}
                            {(userData.currentRoomdata?.currentRoomInfo?.guests?.length ?? 0) > 0 && (
                                <div style={{ marginTop: "0.8em" }}>
                                    <span className="security-data-label">{t("furpanel.admin.users.security.user_search.fields.guests")}</span>
                                    <div className="vertical-list gap-2mm" style={{ marginTop: "0.4em" }}>
                                        {userData.currentRoomdata!.currentRoomInfo!.guests
                                            .filter(g => g.user?.userId !== userData.badgeData?.mainBadge?.userId)
                                            .map((g, idx) => {
                                                const isOwner = g.user?.userId === roomOwnerUserId;
                                                return (
                                                    <div key={`${g.user?.userId || idx}`} className="horizontal-list gap-3mm flex-vertical-center"
                                                        style={{ padding: "0.3em 0.5em", borderRadius: 8, background: isOwner ? "var(--highlight)22" : "transparent", border: isOwner ? "1px solid var(--highlight)66" : "none" }}>
                                                        {g.user?.propic?.mediaUrl
                                                            ? <ImagePreviewModal
                                                                imageUrl={g.user.propic.mediaUrl}
                                                                alt={g.user.fursonaName || ""}
                                                                thumbSize={36}
                                                                title={g.user.fursonaName || ""}
                                                            />
                                                            : <div style={{ width: 36, height: 36, borderRadius: 8, background: "#2c3e50", flexShrink: 0 }} />}
                                                        <span className="security-data-value" style={{ fontWeight: isOwner ? 700 : undefined, marginLeft: "0.5em" }}>
                                                            {g.user?.fursonaName || "-"}
                                                            {isOwner && ` ${t("furpanel.admin.users.security.user_search.fields.owner_label")}`}
                                                        </span>
                                                        <span className="security-data-label" style={{ marginLeft: "auto" }}>{g.orderStatus}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => selectGuest(g.user?.userId || 0, g.user?.fursonaName || "")}
                                                            style={{ marginLeft: "2em", padding: "0.3em 0.5em", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4em", color: "var(--primary)", fontSize: "0.9em" }}
                                                            title="Search this guest"
                                                        >
                                                            <span>{t("furpanel.admin.users.security.user_search.actions.view_user")}</span>
                                                            <Icon icon="ARROW_FORWARD" style={{ fontSize: "1em" }} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </SectionCard>

                        {/* Fursuits */}
                        <div className="vertical-list gap-2mm">
                            {(userData.badgeData?.fursuits ?? []).length === 0 && (
                                <SectionCard title={t("furpanel.admin.users.accounts.view.fursuits")}>
                                    <span className="title small color-subtitle">{t("furpanel.admin.users.security.user_search.values.none")}</span>
                                </SectionCard>
                            )}
                            {(userData.badgeData?.fursuits ?? []).length > 0 && (
                                <SectionCard title={t("furpanel.admin.users.accounts.view.fursuits")}>
                                    <div className="vertical-list gap-2mm">
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
                                                        : <div style={{ width: 80, height: 80, borderRadius: 12, background: "#2c3e50", flexShrink: 0 }}></div>}
                                                    <div className="security-data-grid" style={{ flex: 1 }}>
                                                        <DataField label="ID" value={item.fursuit?.id} />
                                                        <DataField label={t("furpanel.admin.users.accounts.view.fursuit_table.name")} value={item.fursuit?.name} />
                                                        <DataField label={t("furpanel.admin.users.accounts.view.fursuit_table.species")} value={item.fursuit?.species} />
                                                        <DataField label={t("furpanel.admin.users.security.user_search.fields.bring_to_event")} value={item.bringingToEvent ? t("furpanel.admin.users.security.user_search.values.yes") : t("furpanel.admin.users.security.user_search.values.no")} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
