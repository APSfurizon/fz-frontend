'use client'
import { useEffect, useState } from "react";
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
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import { useRouter } from "next/navigation";

const STATI = ["disponibile", "in_uso", "non_disponibile"] as const;
const STATO_LABEL: Record<string, string> = { disponibile: "Disponibile", in_uso: "In uso", non_disponibile: "Non disponibile" };
const STATO_COLOR: Record<string, string> = { disponibile: "#27ae60", in_uso: "#f39c12", non_disponibile: "#c0392b" };

export default function SecurityAssetManagerPage() {
    useTitle("Security - Asset Manager");
    const { showModal } = useModalUpdate();
    const router = useRouter();

    const [assets, setAssets] = useState<SecurityAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStato, setFilterStato] = useState<string | null>(null);
    const [view, setView] = useState<"list" | "form" | "detail" | "logs">("list");
    const [selected, setSelected] = useState<SecurityAsset | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [logs, setLogs] = useState<SecurityAssetLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

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

    useEffect(() => { loadAssets(); }, []);

    const resetForm = () => { setFTag(""); setFTipo(""); setFModello(""); setFSerial(""); setFNote(""); setFStato("disponibile"); };

    const openAdd = () => { resetForm(); setIsEdit(false); setView("form"); };
    const openEdit = (a: SecurityAsset) => {
        setFTag(a.tag); setFTipo(a.tipo); setFModello(a.device_modello);
        setFSerial(a.seriale ?? ""); setFNote(a.note ?? ""); setFStato(a.stato);
        setSelected(a); setIsEdit(true); setView("form");
    };

    const saveItem = () => {
        const body = new FormData();
        body.append("tag", fTag.trim());
        body.append("tipo", fTipo.trim());
        body.append("modello", fModello.trim());
        body.append("seriale", fSerial.trim());
        body.append("note", fNote.trim());
        body.append("stato", fStato);
        if (isEdit && selected) {
            body.append("itemId", String(selected.data));
            if (selected.fileName) body.append("fileName", selected.fileName);
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
        body.append("utilizzatore", tUtilizzatore.trim());
        body.append("note", tNote.trim());
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
        runRequest({ action: new GetSecurityAssetLogsApiAction(), additionalPath: [String(a.data)] })
            .then((res) => setLogs(res.logs ?? []))
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => { setLogsLoading(false); setView("logs"); });
    };

    const filtered = filterStato ? assets.filter((a) => a.stato === filterStato) : assets;

    // ── Views ────────────────────────────────────────────────────────────────

    const renderList = () => (
        <div className="vertical-list gap-2mm">
            {/* Filter chips */}
            <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
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
            {filtered.length === 0 && <span className="title normal color-subtitle">Nessun asset</span>}
            {filtered.map((a) => (
                <div key={a.data} className="main-dialog rounded-m" style={{ padding: "0.75em", cursor: "pointer", display: "flex", gap: "0.75em", alignItems: "center" }}
                    onClick={() => { setSelected(a); setView("detail"); }}>
                    <div style={{ flex: 1 }}>
                        <div className="horizontal-list gap-2mm flex-vertical-center">
                            <span className="title small" style={{ background: "#1f3a5f", color: "#9ec1fa", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>{a.tag}</span>
                            <span className="title small" style={{ color: STATO_COLOR[a.stato], fontWeight: 700 }}>{STATO_LABEL[a.stato]}</span>
                        </div>
                        <span className="title normal" style={{ fontWeight: 700 }}>{[a.tipo, a.device_modello].filter(Boolean).join(" — ")}</span>
                        {a.utilizzatore && <span className="title small color-subtitle">👤 {a.utilizzatore}</span>}
                    </div>
                    {(a.foto?.length ?? 0) > 0 && (
                        <span style={{ background: "#1f6feb", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 12 }}>🖼 {a.foto!.length}</span>
                    )}
                </div>
            ))}
            <Button icon="ADD" onClick={openAdd}>Aggiungi asset</Button>
        </div>
    );

    const renderForm = () => (
        <div className="vertical-list gap-3mm">
            <span className="title large">{isEdit ? "Modifica asset" : "Nuovo asset"}</span>
            <FpInput label="Tag / Etichetta" initialValue={fTag} onChange={(v) => setFTag(v ?? "")} placeholder="Es. RADIO-01" />
            <FpInput label="Tipo dispositivo" initialValue={fTipo} onChange={(v) => setFTipo(v ?? "")} placeholder="Es. Radio, Tablet..." />
            <FpInput label="Modello" initialValue={fModello} onChange={(v) => setFModello(v ?? "")} placeholder="Es. Motorola XT1234" />
            <FpInput label="Numero seriale" initialValue={fSerial} onChange={(v) => setFSerial(v ?? "")} placeholder="S/N" />
            <FpInput label="Note condizioni" initialValue={fNote} onChange={(v) => setFNote(v ?? "")} placeholder="Condizioni, danni..." />
            <div>
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
            <div className="horizontal-list gap-2mm">
                <Button onClick={() => { resetForm(); setView(isEdit ? "detail" : "list"); }}>Annulla</Button>
                <Button icon="SAVE" busy={loading} onClick={saveItem}>Salva</Button>
            </div>
        </div>
    );

    const renderDetail = (a: SecurityAsset) => (
        <div className="vertical-list gap-3mm">
            <span className="title large">{[a.tag, a.device_modello].filter(Boolean).join(" — ") || "Dettaglio asset"}</span>
            <span style={{ display: "inline-block", background: STATO_COLOR[a.stato], color: "#fff", padding: "4px 14px", borderRadius: 8, fontWeight: 700 }}>{STATO_LABEL[a.stato]}</span>
            {[
                ["Tipo", a.tipo], ["Modello", a.device_modello], ["Seriale", a.seriale],
                ["Utilizzatore", a.utilizzatore], ["Note", a.note],
            ].filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label} className="horizontal-list gap-2mm" style={{ borderBottom: "1px solid #ffffff15", paddingBottom: 6 }}>
                    <span className="title small color-subtitle" style={{ minWidth: 140 }}>{label}</span>
                    <span className="title small">{value}</span>
                </div>
            ))}
            <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                <Button icon="EDIT" onClick={() => openEdit(a)}>Modifica</Button>
                <Button icon="SWAP_HORIZ" onClick={() => { setTUtilizzatore(""); setTNote(""); setTStato("disponibile"); setTransferOpen(true); }}>Rendi / Trasferisci</Button>
                <Button icon="HISTORY" onClick={() => loadLogs(a)}>Vedi Log</Button>
                <Button onClick={() => setView("list")}>← Indietro</Button>
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
            <Button onClick={() => setView("detail")}>← Indietro</Button>
        </div>
    );

    return (
        <div className="stretch-page">
            {/* Back button */}
            {view !== "list" && (
                <div style={{ marginBottom: 8 }}>
                    <Button icon="ARROW_BACK" onClick={() => {
                        if (view === "form") setView(isEdit ? "detail" : "list");
                        else if (view === "logs") setView("detail");
                        else setView("list");
                    }}>Indietro</Button>
                </div>
            )}

            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "form" && renderForm()}
            {view === "detail" && selected && renderDetail(selected)}
            {view === "logs" && renderLogs()}

            {/* Transfer modal */}
            {transferOpen && selected && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                    <div className="main-dialog rounded-m" style={{ width: "100%", maxWidth: 480 }}>
                        <span className="title large" style={{ display: "block", marginBottom: 16, textAlign: "center" }}>Rendi / Trasferisci</span>
                        <div className="vertical-list gap-3mm">
                            <FpInput label="Nuovo utilizzatore" initialValue={tUtilizzatore} onChange={(v) => setTUtilizzatore(v ?? "")} placeholder="Nome persona" />
                            <FpInput label="Note condizioni" initialValue={tNote} onChange={(v) => setTNote(v ?? "")} placeholder="Condizioni, danni..." />
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
                            <div className="horizontal-list gap-2mm">
                                <Button onClick={() => setTransferOpen(false)}>Annulla</Button>
                                <Button icon="SWAP_HORIZ" busy={loading} onClick={saveTransfer} style={{ background: "#e67e22" }}>Conferma</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
