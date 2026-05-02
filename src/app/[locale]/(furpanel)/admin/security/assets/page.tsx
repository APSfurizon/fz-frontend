'use client'
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import { useModalUpdate } from "@/components/context/modalProvider";
import { runRequest } from "@/lib/api/global";
import {
    SecurityAsset, SecurityAssetLog,
    GetSecurityAssetsApiAction, GetSecurityAssetLogsApiAction,
    CreateSecurityAssetApiAction, UpdateSecurityAssetApiAction,
    TransferSecurityAssetApiAction,
} from "@/lib/api/admin/security";
import Button from "@/components/input/button";
import FpInput from "@/components/input/fpInput";
import ImagePreviewModal from "@/components/imagePreviewModal";
import Modal from "@/components/modal";
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import { useRouter } from "next/navigation";

const STATI = ["disponibile", "in_uso", "non_disponibile"] as const;
const STATO_LABEL: Record<string, string> = { disponibile: "Disponibile", in_uso: "In uso", non_disponibile: "Non disponibile" };
const STATO_COLOR: Record<string, string> = { disponibile: "#27ae60", in_uso: "#f39c12", non_disponibile: "#c0392b" };
const SECURITY_IMAGE_THUMB_SIZE = 108;
const SECURITY_LIST_PREVIEW_SIZE = 56;
const SECURITY_LIST_MEDIA_SLOT_WIDTH = 120;
const SECURITY_BADGE_STYLE = {
    display: "inline-flex",
    width: "fit-content",
    alignSelf: "flex-start",
};

export default function SecurityAssetManagerPage() {
    const t = useTranslations();
    useTitle("Security - Asset Manager");
    const { showModal } = useModalUpdate();
    const router = useRouter();

    const [assets, setAssets] = useState<SecurityAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStato, setFilterStato] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");
    const [view, setView] = useState<"list" | "form" | "detail" | "logs">("list");
    const [selected, setSelected] = useState<SecurityAsset | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [logs, setLogs] = useState<SecurityAssetLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const initialLoadDone = useRef(false);

    // Transfer modal
    const [transferOpen, setTransferOpen] = useState(false);
    const [tUtilizzatore, setTUtilizzatore] = useState("");
    const [tNote, setTNote] = useState("");
    const [tStato, setTStato] = useState<string>("disponibile");

    // Form state
    const [fTag, setFTag] = useState("");
    const [fTipo, setFTipo] = useState("");
    const [fModello, setFModello] = useState("");
    const [fSerial, setFSerial] = useState("");
    const [fNote, setFNote] = useState("");
    const [fStato, setFStato] = useState<string>("disponibile");

    const loadAssets = () => {
        setLoading(true);
        runRequest({ action: new GetSecurityAssetsApiAction() })
            .then((res) => setAssets(res.assets ?? []))
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (initialLoadDone.current) return;
        initialLoadDone.current = true;
        loadAssets();
    }, []);

    const resetForm = () => { setFTag(""); setFTipo(""); setFModello(""); setFSerial(""); setFNote(""); setFStato("disponibile"); };

    const openAdd = () => { resetForm(); setIsEdit(false); setView("form"); };
    const openEdit = (a: SecurityAsset) => {
        setFTag(a.tag); setFTipo(a.device_tipo); setFModello(a.device_modello);
        setFSerial(a.device_serial_number ?? ""); setFNote(a.note_condizioni ?? ""); setFStato(a.stato);
        setSelected(a); setIsEdit(true); setView("form");
    };

    const saveItem = () => {
        const body = new FormData();
        body.append("tag", fTag.trim());
        body.append("device_tipo", fTipo.trim());
        body.append("device_modello", fModello.trim());
        body.append("device_serial_number", fSerial.trim());
        body.append("note_condizioni", fNote.trim());
        body.append("stato", fStato);
        if (isEdit && selected) {
            body.append("itemId", String(selected.data));
            if (selected.fileName) body.append("fileName", selected.fileName);
            if (selected.updateId) body.append("expectedUpdateId", selected.updateId);
        }
        setLoading(true);
        const action = isEdit ? new UpdateSecurityAssetApiAction() : new CreateSecurityAssetApiAction();
        runRequest({ action, body })
            .then(() => { resetForm(); setView("list"); loadAssets(); })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const saveTransfer = () => {
        if (!selected) return;
        const body = new FormData();
        body.append("itemId", String(selected.data));
        if (selected.fileName) body.append("fileName", selected.fileName);
        if (selected.updateId) body.append("expectedUpdateId", selected.updateId);
        body.append("utilizzatore_attuale", tUtilizzatore.trim() || "Non impostato");
        body.append("utilizzatore_precedente", selected.utilizzatore_attuale ?? "Non impostato");
        body.append("note_condizioni", tNote.trim());
        body.append("stato", tStato);
        setLoading(true);
        runRequest({ action: new TransferSecurityAssetApiAction(), body })
            .then(() => { setTransferOpen(false); loadAssets(); })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const loadLogs = (a: SecurityAsset) => {
        setSelected(a);
        setLogsLoading(true);
        setLogs([]);
        const params = new URLSearchParams();
        params.set("itemId", String(a.data));
        if (a.fileName) params.set("fileName", a.fileName);
        runRequest({ action: new GetSecurityAssetLogsApiAction(), searchParams: params })
            .then((res) => setLogs(res.logs ?? []))
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => { setLogsLoading(false); setView("logs"); });
    };

    const normalizedSearch = searchText.trim().toLowerCase();
    const filtered = assets.filter((a) => {
        const matchesStato = !filterStato || a.stato === filterStato;
        if (!matchesStato) return false;
        if (!normalizedSearch) return true;
        return [a.tag, a.device_tipo, a.device_modello, a.device_serial_number]
            .some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
    });

    // ── Views ────────────────────────────────────────────────────────────────

    const renderList = () => (
        <div className="vertical-list gap-2mm">
            {/* Filter chips + primary action */}
            <div className="horizontal-list gap-2mm flex-vertical-center" style={{ flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: "1 1 320px", minWidth: 240, maxWidth: 560 }}>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Cerca per Tag, Tipo, Modello o Seriale"
                        style={{ width: "100%", padding: "0.5em 0.7em", borderRadius: 8, border: "1px solid #00000040", background: "var(--table-header-row-bg)", color: "inherit" }}
                    />
                </div>
                <div className="spacer" />
                <button className={"button rounded-m" + (!filterStato ? " active" : "")} onClick={() => setFilterStato(null)}>
                    <span className="title normal">Tutti ({assets.length})</span>
                </button>
                {STATI.map((s) => (
                    <button key={s} className="button rounded-m" onClick={() => setFilterStato(filterStato === s ? null : s)}
                        style={filterStato === s ? { background: STATO_COLOR[s], borderColor: STATO_COLOR[s], color: "#fff" } : {}}>
                        <span className="title normal">{STATO_LABEL[s]}</span>
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="vertical-list gap-2mm table-container title rounded-m furpanel-table-container">
                {filtered.length === 0 && <span className="title normal color-subtitle">Nessun asset</span>}
                {filtered.map((a) => (
                    <div key={a.data} className="rounded-m" style={{ padding: "0.75em", cursor: "pointer", display: "flex", flexDirection: "row", gap: "0.75em", alignItems: "center", width: "100%", boxSizing: "border-box", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a" }}
                        onClick={() => { setSelected(a); setView("detail"); }}>
                        {/* Left: tag + title + person */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                            <span className="title small" style={{ background: "#1f3a5f", color: "#9ec1fa", padding: "2px 8px", borderRadius: 6, fontWeight: 700, alignSelf: "flex-start" }}>{a.tag}</span>
                            <span className="title normal" style={{ fontWeight: 700 }}>{[a.device_tipo, a.device_modello].filter(Boolean).join(" — ")}</span>
                            {a.utilizzatore_attuale && <span className="title small color-subtitle">👤 {a.utilizzatore_attuale}</span>}
                        </div>
                        {/* Right: status top, photo indicator bottom */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", justifyContent: "center", flexShrink: 0, minWidth: SECURITY_LIST_MEDIA_SLOT_WIDTH }}>
                            <span className="title small" style={{ color: STATO_COLOR[a.stato], fontWeight: 700 }}>{STATO_LABEL[a.stato]}</span>
                            <div style={{ display: "flex", flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                                {(a.foto?.length ?? 0) > 1 && (
                                    <span style={{ background: "#1f6feb", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 12 }}>🖼 {a.foto!.length}</span>
                                )}
                                {(a.foto?.length ?? 0) > 0 ? (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <ImagePreviewModal
                                            imageUrl={`/api/image-proxy?url=${encodeURIComponent(a.foto![0].url)}`}
                                            alt={`${a.tag || "Asset"} - preview`}
                                            thumbSize={SECURITY_LIST_PREVIEW_SIZE}
                                            title={`${a.tag || "Asset"} - preview`}
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
            <span className="title large" style={{ marginBottom: 8 }}>{isEdit ? "Modifica asset" : "Nuovo asset"}</span>
            <FpInput label="Tag / Etichetta" initialValue={fTag} onChange={(e) => setFTag(e.target.value ?? "")} placeholder="Es. RADIO-01" />
            <FpInput label="Tipo dispositivo" initialValue={fTipo} onChange={(e) => setFTipo(e.target.value ?? "")} placeholder="Es. Radio, Tablet..." />
            <FpInput label="Modello" initialValue={fModello} onChange={(e) => setFModello(e.target.value ?? "")} placeholder="Es. Motorola XT1234" />
            <FpInput label="Numero seriale" initialValue={fSerial} onChange={(e) => setFSerial(e.target.value ?? "")} placeholder="S/N" />
            <FpInput label="Note condizioni" initialValue={fNote} onChange={(e) => setFNote(e.target.value ?? "")} placeholder="Condizioni, danni..." />
            <div style={{ marginTop: 6 }}>
                <span className="title small" style={{ display: "block", marginBottom: 6 }}>Stato</span>
                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                    {STATI.map((s) => (
                        <button key={s} className="button rounded-m" onClick={() => setFStato(s)}
                            style={fStato === s ? { background: STATO_COLOR[s], borderColor: STATO_COLOR[s], color: "#fff" } : {}}>
                            {STATO_LABEL[s]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="horizontal-list gap-2mm" style={{ marginTop: 10 }}>
                <Button onClick={() => { resetForm(); setView(isEdit ? "detail" : "list"); }}>Annulla</Button>
                <Button icon="SAVE" busy={loading} onClick={saveItem}>Salva</Button>
            </div>
        </div>
    );

    const renderDetail = (a: SecurityAsset) => (
        <div className="vertical-list gap-3mm">
            <div className="horizontal-list gap-2mm flex-vertical-center" style={{ marginBottom: 6 }}>
                <span className="title large" style={{ flex: 1 }}>{[a.tag, a.device_modello].filter(Boolean).join(" — ") || "Dettaglio asset"}</span>
                <span style={{ ...SECURITY_BADGE_STYLE, background: STATO_COLOR[a.stato], color: "#fff", padding: "4px 14px", borderRadius: 8, fontWeight: 700, whiteSpace: "nowrap" }}>{STATO_LABEL[a.stato]}</span>
            </div>
            {[
                ["Tipo", a.device_tipo], ["Modello", a.device_modello], ["Seriale", a.device_serial_number],
                ["Utilizzatore", a.utilizzatore_attuale], ["Note", a.note_condizioni],
            ].filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label} className="horizontal-list gap-2mm" style={{ borderBottom: "1px solid #ffffff15", paddingBottom: 6 }}>
                    <span className="title small color-subtitle" style={{ minWidth: 140 }}>{label}</span>
                    <span className="title small">{value}</span>
                </div>
            ))}
            {(a.foto?.length ?? 0) > 0 && (
                <div className="vertical-list gap-2mm">
                    <span className="title small color-subtitle">Foto ({a.foto!.length})</span>
                    <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                        {a.foto!.map((img, idx) => (
                            <ImagePreviewModal
                                key={idx}
                                imageUrl={`/api/image-proxy?url=${encodeURIComponent(img.url)}`}
                                alt={`${a.tag} — foto ${idx + 1}`}
                                thumbSize={SECURITY_IMAGE_THUMB_SIZE}
                                title={`${a.tag || "Asset"} — foto ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap", marginTop: 10 }}>
                <Button icon="SYNC" onClick={() => { setTUtilizzatore(""); setTNote(""); setTStato("disponibile"); setTransferOpen(true); }}>Rendi / Trasferisci</Button>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="vertical-list gap-2mm">
            <span className="title large">Log asset: {selected?.tag}</span>
            {logsLoading && <LoadingPanel />}
            {!logsLoading && logs.length === 0 && <span className="title normal color-subtitle">Nessun log disponibile</span>}
            {logs.map((l, idx) => (
                <div key={l.id ?? idx} className="main-dialog rounded-m" style={{ padding: "0.6em 0.75em" }}>
                    <div className="horizontal-list gap-2mm flex-vertical-center">
                        <span style={{ background: "#2d3f54", color: "#c8ddff", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>{l.azione}</span>
                        <span className="title small color-subtitle" style={{ marginLeft: "auto" }}>{l.data_aggiornamento ? new Date(l.data_aggiornamento).toLocaleString() : ""}</span>
                    </div>
                    {l.utilizzatore && <span className="title small">👤 {l.utilizzatore}</span>}
                    {l.note && <span className="title small color-subtitle">{l.note}</span>}
                </div>
            ))}
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
                    if (view === "form") setView(isEdit ? "detail" : "list");
                    else if (view === "logs") setView("detail");
                    else setView("list");
                }}>
                    <Icon icon="ARROW_BACK" />
                </span>
                <div className="horizontal-list gap-2mm">
                    <span className="title medium">Asset Manager</span>
                </div>
                <div className="spacer" />
                {view === "list" && <Button icon="ADD" onClick={openAdd}>Aggiungi asset</Button>}
                {view === "detail" && selected && (
                    <>
                        <Button icon="EDIT" onClick={() => openEdit(selected)}>Modifica</Button>
                        <Button icon="FIND_IN_PAGE" onClick={() => loadLogs(selected)}>Vedi Log</Button>
                    </>
                )}
            </div>

            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "form" && renderForm()}
            {view === "detail" && selected && renderDetail(selected)}
            {view === "logs" && renderLogs()}

            {/* Transfer modal */}
            {transferOpen && selected && (
                <Modal
                    open={transferOpen}
                    onClose={() => setTransferOpen(false)}
                    busy={loading}
                    title="Rendi / Trasferisci"
                    icon="SYNC"
                    style={{ width: "min(92vw, 480px)" }}>
                    <div className="vertical-list gap-3mm" style={{ padding: "1em" }}>
                        <FpInput label="Nuovo utilizzatore" initialValue={tUtilizzatore} onChange={(e) => setTUtilizzatore(e.target.value ?? "")} placeholder="Nome persona" />
                        <FpInput label="Note condizioni" initialValue={tNote} onChange={(e) => setTNote(e.target.value ?? "")} placeholder="Condizioni, danni..." />
                        <div>
                            <span className="title small" style={{ display: "block", marginBottom: 6 }}>Stato</span>
                            <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                                {STATI.map((s) => (
                                    <button key={s} className="button rounded-m" onClick={() => setTStato(s)}
                                        style={tStato === s ? { background: STATO_COLOR[s], borderColor: STATO_COLOR[s], color: "#fff" } : {}}>
                                        {STATO_LABEL[s]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bottom-toolbar" style={{ marginTop: 10 }}>
                            <Button type="button" className="danger" icon="CANCEL" busy={loading} onClick={() => setTransferOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <div className="spacer"></div>
                            <Button type="button" className="success" icon="CHECK" busy={loading} onClick={saveTransfer}>
                                {t("common.confirm")}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
