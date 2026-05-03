'use client'
import { useEffect, useRef, useState } from "react";
import useTitle from "@/components/hooks/useTitle";
import { useModalUpdate } from "@/components/context/modalProvider";
import { runRequest } from "@/lib/api/global";
import {
    SecurityHazard,
    GetSecurityHazardsApiAction,
    CreateSecurityHazardApiAction,
    UpdateSecurityHazardApiAction,
} from "@/lib/api/admin/security";
import Button from "@/components/input/button";
import FpInput from "@/components/input/fpInput";
import ImagePreviewModal from "@/components/imagePreviewModal";
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const LIVELLI = ["basso", "medio", "alto", "critico"] as const;
const LIVELLO_COLOR: Record<string, string> = { basso: "#27ae60", medio: "#f39c12", alto: "#e67e22", critico: "#c0392b" };
const SECURITY_IMAGE_THUMB_SIZE = 108;
const SECURITY_LIST_PREVIEW_SIZE = 56;
const SECURITY_LIST_MEDIA_SLOT_WIDTH = 120;
const SECURITY_BADGE_STYLE = {
    display: "inline-flex",
    width: "fit-content",
    alignSelf: "flex-start",
};

export default function SecurityHazardousRegisterPage() {
    const t = useTranslations();
    useTitle(t("furpanel.admin.security_management.title_hazardous_register"));
    const { showModal } = useModalUpdate();
    const router = useRouter();

    const LIVELLO_LABEL: Record<string, string> = { basso: t("furpanel.admin.security_management.hazard.low"), medio: t("furpanel.admin.security_management.hazard.medium"), alto: t("furpanel.admin.security_management.hazard.high"), critico: t("furpanel.admin.security_management.hazard.critical") };

    const [hazards, setHazards] = useState<SecurityHazard[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterLivello, setFilterLivello] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");
    const [view, setView] = useState<"list" | "form" | "detail">("list");
    const [selected, setSelected] = useState<SecurityHazard | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const initialLoadDone = useRef(false);

    // Form state
    const [fTitolo, setFTitolo] = useState("");
    const [fDescrizione, setFDescrizione] = useState("");
    const [fLivello, setFLivello] = useState<string>("basso");
    const [fProprietarioNick, setFProprietarioNick] = useState("");
    const [fProprietarioId, setFProprietarioId] = useState("");

    const loadHazards = () => {
        setLoading(true);
        runRequest({ action: new GetSecurityHazardsApiAction() })
            .then((res) => setHazards(res.hazards ?? []))
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (initialLoadDone.current) return;
        initialLoadDone.current = true;
        loadHazards();
    }, []);

    const resetForm = () => {
        setFTitolo(""); setFDescrizione(""); setFLivello("basso");
        setFProprietarioNick(""); setFProprietarioId("");
    };

    const openAdd = () => { resetForm(); setIsEdit(false); setView("form"); };
    const openEdit = (h: SecurityHazard) => {
        setFTitolo(h.titolo); setFDescrizione(h.descrizione ?? "");
        setFLivello(h.livello); setFProprietarioNick(h.proprietario_nickname ?? "");
        setFProprietarioId(h.proprietario_id ?? "");
        setSelected(h); setIsEdit(true); setView("form");
    };

    const saveItem = () => {
        if (!fTitolo.trim()) {
            showModal("Dati mancanti", <span>{t("furpanel.admin.security_management.hazard.missing_title")}</span>);
            return;
        }
        const body = new FormData();
        body.append("titolo", fTitolo.trim());
        body.append("descrizione", fDescrizione.trim());
        body.append("livello", fLivello);
        body.append("proprietario_nickname", fProprietarioNick.trim());
        body.append("proprietario_id", fProprietarioId.trim());
        if (isEdit && selected) {
            body.append("itemId", String(selected.data));
            if (selected.fileName) body.append("fileName", selected.fileName);
            if (selected.updateId) body.append("expectedUpdateId", String(selected.updateId));
        }
        setLoading(true);
        const action = isEdit ? new UpdateSecurityHazardApiAction() : new CreateSecurityHazardApiAction();
        runRequest({ action, body })
            .then(() => { resetForm(); setView("list"); loadHazards(); })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const normalizedSearch = searchText.trim().toLowerCase();
    const filtered = hazards.filter((h) => {
        const matchesLevel = !filterLivello || h.livello === filterLivello;
        if (!matchesLevel) return false;
        if (!normalizedSearch) return true;
        return [h.titolo, h.descrizione, h.proprietario_nickname]
            .some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
    });

    const renderList = () => (
        <div className="vertical-list gap-2mm">
            <div className="horizontal-list gap-2mm flex-vertical-center" style={{ flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: "1 1 320px", minWidth: 240, maxWidth: 560 }}>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={t("furpanel.admin.security_management.hazard.search_placeholder")}
                        style={{ width: "100%", padding: "0.5em 0.7em", borderRadius: 8, border: "1px solid #00000040", background: "var(--table-header-row-bg)", color: "inherit" }}
                    />
                </div>
                <div className="spacer" />
                <button className="button rounded-m" onClick={() => setFilterLivello(null)}
                    style={!filterLivello ? { background: "var(--button-background-active)" } : {}}>
                    <span className="title normal">{t("furpanel.admin.security_management.hazard.all")} ({hazards.length})</span>
                </button>
                {LIVELLI.map((l) => {
                    const count = hazards.filter((h) => h.livello === l).length;
                    return (
                        <button key={l} className="button rounded-m" onClick={() => setFilterLivello(filterLivello === l ? null : l)}
                            style={filterLivello === l ? { background: LIVELLO_COLOR[l], borderColor: LIVELLO_COLOR[l], color: "#fff" } : {}}>
                            <span className="title normal">{LIVELLO_LABEL[l]} ({count})</span>
                        </button>
                    );
                })}
            </div>

            <div className="vertical-list gap-2mm table-container title rounded-m">
                {filtered.length === 0 && <span className="title normal color-subtitle">{t("furpanel.admin.security_management.hazard.no_reports")}</span>}
                {filtered.map((h) => (
                    <div key={h.data} className="rounded-m"
                        style={{ padding: "0.75em", margin: 0, cursor: "pointer", display: "flex", flexDirection: "row", gap: "0.75em", alignItems: "flex-start", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a", borderLeft: `4px solid ${LIVELLO_COLOR[h.livello]}` }}
                        onClick={() => { setSelected(h); setView("detail"); }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div className="horizontal-list gap-2mm flex-vertical-center" style={{ marginBottom: 4, flexWrap: "wrap" }}>
                                <span style={{ background: LIVELLO_COLOR[h.livello], color: "#fff", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 6 }}>{LIVELLO_LABEL[h.livello]}</span>
                                <span className="title normal" style={{ fontWeight: 700 }}>{h.titolo}</span>
                            </div>
                            {h.descrizione && <span className="title small color-subtitle" style={{ display: "block", marginTop: 2 }}>{h.descrizione}</span>}
                            {h.trovato_da && <span className="title small color-subtitle" style={{ display: "block", marginTop: 8 }}><Icon icon="PERSON" className="medium" /> {h.trovato_da}</span>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", justifyContent: "flex-start", flexShrink: 0, minWidth: SECURITY_LIST_MEDIA_SLOT_WIDTH }}>
                            <span className="title small color-subtitle">{h.data ? new Date(h.data).toLocaleDateString() : ""}</span>
                            <div style={{ display: "flex", flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                                {(h.foto?.length ?? 0) > 1 && (
                                    <span style={{ background: "#1f6feb", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 12 }}>📷 {h.foto!.length}</span>
                                )}
                                {(h.foto?.length ?? 0) > 0 ? (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <ImagePreviewModal
                                            imageUrl={`/api/mobile/image-proxy?url=${encodeURIComponent(h.foto![0].url)}`}
                                            alt={`${h.titolo || t("furpanel.admin.security_management.hazard.report")} - preview`}
                                            thumbSize={SECURITY_LIST_PREVIEW_SIZE}
                                            title={`${h.titolo || t("furpanel.admin.security_management.hazard.report")} - preview`}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ width: SECURITY_LIST_PREVIEW_SIZE, height: SECURITY_LIST_PREVIEW_SIZE, borderRadius: 8, background: "#1f2b3a", border: "1px solid #ffffff22" }} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="vertical-list gap-3mm">
            <span className="title large" style={{ marginBottom: 8 }}>{isEdit ? t("furpanel.admin.security_management.hazard.edit_title") : t("furpanel.admin.security_management.hazard.new_title")}</span>
            <FpInput required label={t("furpanel.admin.security_management.hazard.title")} initialValue={fTitolo} onChange={(e) => setFTitolo(e.target.value ?? "")} placeholder={t("furpanel.admin.security_management.hazard.title_placeholder")} />
            <FpInput label={t("furpanel.admin.security_management.hazard.description")} initialValue={fDescrizione} onChange={(e) => setFDescrizione(e.target.value ?? "")} placeholder={t("furpanel.admin.security_management.hazard.description_placeholder")} />
            <FpInput required label={t("furpanel.admin.security_management.hazard.owner_nickname")} initialValue={fProprietarioNick} onChange={(e) => setFProprietarioNick(e.target.value ?? "")} placeholder={t("furpanel.admin.security_management.hazard.owner_nickname_placeholder")} />
            <FpInput required label={t("furpanel.admin.security_management.hazard.owner_id")} initialValue={fProprietarioId} onChange={(e) => setFProprietarioId(e.target.value ?? "")} placeholder={t("furpanel.admin.security_management.hazard.owner_id_placeholder")} />
            <div style={{ marginTop: 6 }}>
                <span className="title small" style={{ display: "block", marginBottom: 6 }}>{t("furpanel.admin.security_management.hazard.level")}</span>
                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                    {LIVELLI.map((l) => (
                        <button key={l} className="button rounded-m" onClick={() => setFLivello(l)}
                            style={fLivello === l ? { background: LIVELLO_COLOR[l], borderColor: LIVELLO_COLOR[l], color: "#fff" } : {}}>
                            {LIVELLO_LABEL[l]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="horizontal-list gap-2mm" style={{ marginTop: 10 }}>
                <Button onClick={() => { resetForm(); setView(isEdit ? "detail" : "list"); }}>{t("furpanel.admin.security_management.hazard.cancel")}</Button>
                <Button icon="SAVE" busy={loading} onClick={saveItem}>{t("furpanel.admin.security_management.hazard.save")}</Button>
            </div>
        </div>
    );

    const renderDetail = (h: SecurityHazard) => (
        <div className="vertical-list gap-3mm">
            <div className="horizontal-list gap-2mm flex-vertical-center" style={{ marginBottom: 6 }}>
                <span className="title large" style={{ flex: 1 }}>{h.titolo}</span>
                <span style={{ ...SECURITY_BADGE_STYLE, background: LIVELLO_COLOR[h.livello], color: "#fff", padding: "4px 14px", borderRadius: 8, fontWeight: 700, whiteSpace: "nowrap" }}>{LIVELLO_LABEL[h.livello]}</span>
            </div>
            {[
                [t("furpanel.admin.security_management.hazard.description"), h.descrizione], [t("furpanel.admin.security_management.hazard.reported_by"), h.trovato_da],
                [t("furpanel.admin.security_management.hazard.owner_nickname"), h.proprietario_nickname], [t("furpanel.admin.security_management.hazard.owner_id"), h.proprietario_id],
                [t("furpanel.admin.security_management.hazard.date"), h.data ? new Date(h.data).toLocaleString() : undefined],
            ].filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label} className="horizontal-list gap-2mm" style={{ borderBottom: "1px solid #ffffff15", paddingBottom: 6 }}>
                    <span className="title small color-subtitle" style={{ minWidth: 160 }}>{label}</span>
                    <span className="title small">{value}</span>
                </div>
            ))}
            {(h.foto?.length ?? 0) > 0 && (
                <div className="vertical-list gap-2mm">
                    <span className="title small color-subtitle">{t("furpanel.admin.security_management.hazard.photo")} ({h.foto!.length})</span>
                    <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                        {h.foto!.map((img, idx) => (
                            <ImagePreviewModal
                                key={idx}
                                imageUrl={`/api/mobile/image-proxy?url=${encodeURIComponent(img.url)}`}
                                alt={`${h.titolo} — ${t("furpanel.admin.security_management.hazard.photo")} ${idx + 1}`}
                                thumbSize={SECURITY_IMAGE_THUMB_SIZE}
                                title={`${h.titolo || t("furpanel.admin.security_management.hazard.title")} — ${t("furpanel.admin.security_management.hazard.photo")} ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="stretch-page compact-main">
            <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap" style={{ marginBottom: 8 }}>
                <span style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => {
                    if (view === "list") {
                        router.push("/admin");
                        return;
                    }
                    if (view === "form") {
                        setView(isEdit && selected ? "detail" : "list");
                        return;
                    }
                    setView("list");
                }}>
                    <Icon icon="ARROW_BACK" />
                </span>
                <div className="horizontal-list gap-2mm">
                    <span className="title medium">{t("furpanel.admin.security_management.hazard.hazardous_register")}</span>
                </div>
                <div className="spacer" />
                {view === "list" && <Button icon="ADD" onClick={openAdd}>{t("furpanel.admin.security_management.hazard.add_report")}</Button>}
                {view === "detail" && selected && <Button icon="EDIT" onClick={() => openEdit(selected)}>{t("furpanel.admin.security_management.hazard.edit")}</Button>}
            </div>
            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "form" && renderForm()}
            {view === "detail" && selected && renderDetail(selected)}
        </div>
    );
}
