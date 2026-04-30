'use client'
import AutoInput from "@/components/input/autoInput";
import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
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
    useTitle("Security - Ricerca Utente");
    const router = useRouter();
    const { showModal } = useModalUpdate();

    const [loading, setLoading] = useState(false);
    const [currentCriteria, setCurrentCriteria] = useState(SearchCriteria.COMMON);
    const [userData, setUserData] = useState<GetUserAdminViewResponse>();

    const searchCriteria = [
        { name: "searchType", label: "Common data", value: SearchCriteria.COMMON },
        { name: "searchType", label: "Order serial code", value: SearchCriteria.ORDER_SERIAL },
        { name: "searchType", label: "Order code", value: SearchCriteria.ORDER_CODE },
        { name: "searchType", label: "Membership card", value: SearchCriteria.MEMBERSHIP_CARD },
        { name: "searchType", label: "User number", value: SearchCriteria.USER_ID },
        { name: "searchType", label: "Fursuit number", value: SearchCriteria.FURSUIT_ID },
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
            showModal("Errore", <ErrorMessage error={err} />);
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
                <Button icon="ARROW_BACK" onClick={() => router.push("/admin")}>Indietro</Button>
            </div>

            <div className="vertical-list gap-3mm">
                <span className="title large">Ricerca Utente</span>

                <div className="main-dialog rounded-m" style={{ padding: "0.75em" }}>
                    <p className="title semibold small" style={{ marginBottom: 8 }}>Search criteria</p>
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
                    label="Search User"
                    placeholder="Cerca persona.."
                    param={[true]}
                    onSelect={onUserSelect}
                    minDecodeSize={searchConfig.minDecodeSize}
                    type={searchConfig.type}
                />

                {loading && <LoadingPanel />}

                {userData && (
                    <div className="vertical-list gap-3mm main-dialog rounded-m" style={{ padding: "0.75em" }}>
                        <span className="title medium" style={{ fontWeight: 700 }}>User data</span>
                        {userData.banned && <span style={{ color: "#e74c3c", fontWeight: 700 }}>Banned</span>}

                        <div className="horizontal-list gap-3mm flex-vertical-center" style={{ alignItems: "flex-start" }}>
                            {userData.badgeData?.mainBadge?.propic?.mediaUrl
                                ? <img src={userData.badgeData.mainBadge.propic.mediaUrl} alt="User" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
                                : <div style={{ width: 80, height: 80, borderRadius: 12, background: "#2c3e50" }}></div>}
                            <div className="vertical-list gap-1mm">
                                <span className="title small">Fursona name: {userData.badgeData?.mainBadge?.fursonaName || "-"}</span>
                                <span className="title small">User number: {userData.orders?.[0]?.code || userData.badgeData?.mainBadge?.userId || "-"}</span>
                                <span className="title small">Provenienza: {userData.badgeData?.mainBadge?.locale || "-"}</span>
                                <span className="title small">Available fursuits badges: {userData.badgeData?.fursuits?.length ?? 0}</span>
                            </div>
                        </div>

                        <div className="vertical-list gap-2mm">
                            <span className="title semibold small">User Info</span>
                            <div className="main-dialog rounded-m" style={{ padding: "0.6em" }}>
                                <span className="title small" style={{ display: "block" }}>Name: {userData.personalInfo?.firstName || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Surname: {userData.personalInfo?.lastName || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Mail: {userData.email || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Sex: {userData.personalInfo?.sex || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Gender: {userData.personalInfo?.gender || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Birthday: {userData.personalInfo?.birthday || "None"}</span>
                                <span className="title small" style={{ display: "block" }}>Allergies: {userData.personalInfo?.allergies || "None"}</span>
                                <span className="title small" style={{ display: "block" }}>Telegram: {userData.personalInfo?.telegramUsername || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Telefono: {`${userData.personalInfo?.prefixPhoneNumber || ""} ${userData.personalInfo?.phoneNumber || ""}`.trim() || "-"}</span>
                                <div className="horizontal-list gap-2mm" style={{ marginTop: 8 }}>
                                    <Button icon="SEND" onClick={() => openTelegram(userData.personalInfo?.telegramUsername)}>Telegram</Button>
                                    <Button icon="PHONE" onClick={() => openPhone(userData.personalInfo?.prefixPhoneNumber, userData.personalInfo?.phoneNumber)}>Chiama</Button>
                                </div>
                                <span className="title small" style={{ display: "block", marginTop: 8, fontWeight: 700 }}>Permissions:</span>
                                <span className="title small color-subtitle" style={{ whiteSpace: "pre-line" }}>
                                    {userData.roles?.length ? `- ${userData.roles.map(r => r.displayName).join("\n- ")}` : "None"}
                                </span>
                            </div>
                        </div>

                        <div className="vertical-list gap-2mm">
                            <span className="title semibold small">User Order / Room</span>
                            <div className="main-dialog rounded-m" style={{ padding: "0.6em" }}>
                                <span className="title small" style={{ display: "block" }}>Have order: {userData.currentRoomdata?.hasOrder ? "Yes" : "No"}</span>
                                <span className="title small" style={{ display: "block" }}>Have Room: {userData.currentRoomdata?.currentRoomInfo?.roomId ? "Yes" : "No"}</span>
                                <span className="title small" style={{ display: "block" }}>Room Name: {userData.currentRoomdata?.currentRoomInfo?.roomName || "-"}</span>
                                <span className="title small" style={{ display: "block" }}>Extra Days: {userData.currentRoomdata?.currentRoomInfo?.extraDays || "None"}</span>
                                <span className="title small" style={{ display: "block" }}>
                                    Check-in/out: {String(userData.currentRoomdata?.currentRoomInfo?.checkinDate || "-")} to {String(userData.currentRoomdata?.currentRoomInfo?.checkoutDate || "-")}
                                </span>
                                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap", marginTop: 6 }}>
                                    <span className="title small">Guests:</span>
                                    {userData.currentRoomdata?.currentRoomInfo?.guests
                                        ?.filter((g) => g.roomGuest?.confirmed)
                                        ?.map((g, idx) => (
                                            <span key={`${g.user?.userId || idx}`} className="title small color-subtitle">{g.user?.fursonaName}</span>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="vertical-list gap-2mm">
                            <span className="title semibold small">Fursuits</span>
                            {(userData.badgeData?.fursuits ?? []).length === 0 && <span className="title small color-subtitle">None</span>}
                            {(userData.badgeData?.fursuits ?? []).map((item, index) => (
                                <div key={`${item.fursuit?.id || index}`} className="main-dialog rounded-m" style={{ padding: "0.6em", display: "flex", gap: "0.75em", alignItems: "center" }}>
                                    {item.fursuit?.propic?.mediaUrl
                                        ? <img src={item.fursuit.propic.mediaUrl} alt={item.fursuit.name || "Fursuit"} style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover" }} />
                                        : <div style={{ width: 70, height: 70, borderRadius: 10, background: "#2c3e50" }}></div>}
                                    <div className="vertical-list gap-1mm">
                                        <span className="title small">Name: {item.fursuit?.name || "-"}</span>
                                        <span className="title small">Species: {item.fursuit?.species || "-"}</span>
                                        <span className="title small">Bring to Event: {item.bringingToEvent ? "Yes" : "No"}</span>
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
