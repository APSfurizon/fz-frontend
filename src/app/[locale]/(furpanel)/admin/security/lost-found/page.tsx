'use client'
import { useEffect, useRef, useState } from "react";
import useTitle from "@/components/hooks/useTitle";
import { useModalUpdate } from "@/components/context/modalProvider";
import { runRequest } from "@/lib/api/global";
import {
    SecurityLostItem,
    GetSecurityLostItemsApiAction,
    CreateSecurityLostItemApiAction,
    UpdateSecurityLostItemApiAction,
} from "@/lib/api/admin/security";
import Button from "@/components/input/button";
import FpInput from "@/components/input/fpInput";
import ImagePreviewModal from "@/components/imagePreviewModal";
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";
import { useRouter } from "next/navigation";

const SECURITY_IMAGE_THUMB_SIZE = 108;
const SECURITY_ACCENT_COLOR = "#9061ff";
const SECURITY_ACCENT_TEXT = "#fff8f5";
const SECURITY_BADGE_STYLE = {
    display: "inline-flex",
    width: "fit-content",
    alignSelf: "flex-start",
};

export default function SecurityLostAndFoundPage() {
    useTitle("Security - Lost and Found");
    const { showModal } = useModalUpdate();
    const router = useRouter();

    const [items, setItems] = useState<SecurityLostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConsegnati, setShowConsegnati] = useState(false);
    const [view, setView] = useState<"list" | "form" | "detail">("list");
    const [selected, setSelected] = useState<SecurityLostItem | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const initialLoadDone = useRef(false);

    // Form state
    const [fLuogo, setFLuogo] = useState("");
    const [fDescrizione, setFDescrizione] = useState("");
    const [fFoundBy, setFFoundBy] = useState("");
    const [fProprietario, setFProprietario] = useState("");
    const [fStatus, setFStatus] = useState<"smarrito" | "consegnato">("smarrito");

    const loadItems = () => {
        setLoading(true);
        runRequest({ action: new GetSecurityLostItemsApiAction() })
            .then((res) => setItems(res.items ?? [...(res.smarriti ?? []), ...(res.consegnati ?? [])]))
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (initialLoadDone.current) return;
        initialLoadDone.current = true;
        loadItems();
    }, []);

    const smarriti = items.filter((i) => i.status === "smarrito");
    const consegnati = items.filter((i) => i.status === "consegnato");
    const displayed = showConsegnati ? consegnati : smarriti;

    const resetForm = () => {
        setFLuogo(""); setFDescrizione(""); setFFoundBy(""); setFProprietario(""); setFStatus("smarrito");
    };

    const openAdd = () => { resetForm(); setIsEdit(false); setView("form"); };
    const openEdit = (item: SecurityLostItem) => {
        setFLuogo(item.luogo_ritrovo ?? ""); setFDescrizione(item.descrizione ?? "");
        setFFoundBy(item.found_by ?? ""); setFProprietario(item.proprietario ?? "");
        setFStatus(item.status); setSelected(item); setIsEdit(true); setView("form");
    };

    const saveItem = () => {
        if (!fDescrizione.trim() && !fLuogo.trim()) {
            showModal("Dati mancanti", <span>Inserisci almeno la descrizione o il luogo</span>);
            return;
        }
        const body = new FormData();
        body.append("luogo_ritrovo", fLuogo.trim());
        body.append("descrizione", fDescrizione.trim());
        body.append("found_by", fFoundBy.trim());
        body.append("proprietario", fProprietario.trim());
        body.append("status", fStatus);
        if (isEdit && selected) {
            body.append("itemId", String(selected.data));
            if (selected.fileName) body.append("fileName", selected.fileName);
            if (selected.updateId) body.append("expectedUpdateId", String(selected.updateId));
        }
        setLoading(true);
        const action = isEdit ? new UpdateSecurityLostItemApiAction() : new CreateSecurityLostItemApiAction();
        runRequest({ action, body })
            .then(() => { resetForm(); setView("list"); loadItems(); })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const markConsegnato = (item: SecurityLostItem) => {
        const body = new FormData();
        body.append("itemId", String(item.data));
        if (item.fileName) body.append("fileName", item.fileName);
        if (item.updateId) body.append("expectedUpdateId", String(item.updateId));
        body.append("status", "consegnato");
        setLoading(true);
        runRequest({ action: new UpdateSecurityLostItemApiAction(), body })
            .then(() => { loadItems(); setView("list"); })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const formatDateTime = (value?: number) => {
        if (!value) return undefined;
        return new Date(value).toLocaleString();
    };

    const renderList = () => (
        <div className="vertical-list gap-2mm">
            {/* Tabs */}
            <div className="horizontal-list gap-2mm">
                <button className="button rounded-m" style={{ flex: 1, background: (!showConsegnati) ? SECURITY_ACCENT_COLOR : "transparent", color: (!showConsegnati) ? SECURITY_ACCENT_TEXT : "#888", fontWeight: (!showConsegnati) ? 700 : 400, border: (!showConsegnati) ? `2px solid ${SECURITY_ACCENT_COLOR}` : "2px solid #666" }}
                    onClick={() => setShowConsegnati(false)}>
                    Smarriti ({smarriti.length})
                </button>
                <button className="button rounded-m" style={{ flex: 1, background: showConsegnati ? SECURITY_ACCENT_COLOR : "transparent", color: showConsegnati ? SECURITY_ACCENT_TEXT : "#888", fontWeight: showConsegnati ? 700 : 400, border: showConsegnati ? `2px solid ${SECURITY_ACCENT_COLOR}` : "2px solid #666" }}
                    onClick={() => setShowConsegnati(true)}>
                    Consegnati ({consegnati.length})
                </button>
            </div>

            <div className="vertical-list gap-2mm table-container title rounded-m furpanel-table-container">
                {displayed.length === 0 && <span className="title normal color-subtitle">Nessun oggetto</span>}
                {displayed.map((item, idx) => (
                    <div key={`${item.data}_${idx}`} className="rounded-m"
                        style={{ padding: "0.75em", margin: 0, cursor: "pointer", display: "flex", flexDirection: "row", gap: "0.75em", alignItems: "flex-start", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a" }}
                        onClick={() => { setSelected(item); setView("detail"); }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="title normal" style={{ fontWeight: 700, display: "block" }}>{item.descrizione || "—"}</span>
                            {item.luogo_ritrovo && <span className="title small color-subtitle">📍 {item.luogo_ritrovo}</span>}
                            {item.found_by && <span className="title small color-subtitle" style={{ display: "block" }}>👤 {item.found_by}</span>}
                            <span className="title small color-subtitle" style={{ opacity: 0.7 }}>{item.data ? new Date(item.data).toLocaleDateString() : ""}</span>
                        </div>
                        {(item.immagini?.length ?? 0) > 0 && (
                            <span style={{ background: SECURITY_ACCENT_COLOR, color: SECURITY_ACCENT_TEXT, padding: "3px 8px", borderRadius: 8, fontSize: 12, flexShrink: 0 }}>🖼 {item.immagini!.length}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="vertical-list gap-3mm">
            <span className="title large" style={{ marginBottom: 8 }}>{isEdit ? "Modifica oggetto" : "Nuovo oggetto smarrito"}</span>
            <FpInput label="Luogo di ritrovamento" initialValue={fLuogo} onChange={(e) => setFLuogo(e.target.value ?? "")} placeholder="Es. Padiglione A, ingresso..." />
            <FpInput label="Descrizione *" initialValue={fDescrizione} onChange={(e) => setFDescrizione(e.target.value ?? "")} placeholder="Descrizione dell'oggetto..." />
            <FpInput label="Trovato da" initialValue={fFoundBy} onChange={(e) => setFFoundBy(e.target.value ?? "")} placeholder="Nome di chi ha trovato" />
            <FpInput label="Proprietario" initialValue={fProprietario} onChange={(e) => setFProprietario(e.target.value ?? "")} placeholder="Nome del proprietario (se noto)" />
            <div className="horizontal-list gap-4mm" style={{ flexWrap: "wrap", marginTop: 10, marginBottom: 10 }}>
                {(["smarrito", "consegnato"] as const).map((s) => (
                    <label key={s} className="small" htmlFor={`status_${s}`} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input
                            id={`status_${s}`}
                            type="radio"
                            name="fStatus"
                            value={s}
                            checked={fStatus === s}
                            onChange={() => setFStatus(s)}
                        />
                        {s === "smarrito" ? "Smarrito" : "Consegnato"}
                    </label>
                ))}
            </div>
            <div className="horizontal-list gap-2mm" style={{ marginTop: 10 }}>
                <Button onClick={() => { resetForm(); setView(isEdit ? "detail" : "list"); }}>Annulla</Button>
                <Button icon="SAVE" busy={loading} onClick={saveItem}>Salva</Button>
            </div>
        </div>
    );

    const renderDetail = (item: SecurityLostItem) => {
        const isConsegnato = item.status === "consegnato";
        const rows: [string, string | undefined][] = [
            ["Luogo ritrovo", item.luogo_ritrovo],
            ["Descrizione", item.descrizione],
            ["Trovato da", item.found_by],
            ["Proprietario", item.proprietario],
            ["Data ritrovo", formatDateTime(item.data_ritrovo)],
            ["Data riconsegna", formatDateTime(item.data_riconsegna)],
            ["Inserito da", item.ricognizione],
            ["Registrato il", formatDateTime(item.data_registrazione ?? item.data)],
        ];
        return (
            <div className="vertical-list gap-3mm">
                <div className="horizontal-list gap-2mm flex-vertical-center" style={{ marginBottom: 6 }}>
                    <span className="title large" style={{ flex: 1 }}>{item.descrizione || "—"}</span>
                    <span style={{ ...SECURITY_BADGE_STYLE, background: isConsegnato ? "#27ae60" : "#c0392b", color: "#fff", padding: "4px 14px", borderRadius: 8, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {isConsegnato ? "CONSEGNATO" : "SMARRITO"}
                    </span>
                </div>
                {rows.filter(([, v]) => !!v).map(([label, value]) => (
                    <div key={label} className="horizontal-list gap-2mm" style={{ borderBottom: "1px solid #ffffff15", paddingBottom: 6 }}>
                        <span className="title small color-subtitle" style={{ minWidth: 160 }}>{label}</span>
                        <span className="title small">{value}</span>
                    </div>
                ))}
                {((item.immagini?.length ?? 0) > 0 || (item?.foto?.length ?? 0) > 0) && (
                    <div className="vertical-list gap-2mm" style={{ marginTop: 8 }}>
                        <span className="title small color-subtitle">Foto ({item.immagini?.length ?? item.foto?.length ?? 0})</span>
                        <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                            {(item.immagini ?? item.foto ?? []).map((img, idx) => {
                                const url = typeof img === "string" ? img : img.url;
                                return (
                                    <ImagePreviewModal
                                        key={idx}
                                        imageUrl={`/api/image-proxy?url=${encodeURIComponent(url)}`}
                                        alt={`${item.descrizione || "Oggetto"} — foto ${idx + 1}`}
                                        thumbSize={SECURITY_IMAGE_THUMB_SIZE}
                                        title={`${item.descrizione || "Oggetto"} — foto ${idx + 1}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
                {!isConsegnato && (
                    <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap", marginTop: 10 }}>
                        <Button icon="CHECK" style={{ background: "#27ae60" }} onClick={() => {
                            if (confirm("Confermi la consegna dell'oggetto?")) markConsegnato(item);
                        }}>Segna Consegnato</Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="stretch-page compact-main">
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Button icon="ARROW_BACK" onClick={() => {
                    if (view === "list") {
                        router.push("/admin");
                        return;
                    }
                    setView(isEdit ? "detail" : "list");
                }}>Indietro</Button>
                <div className="spacer" />
                {view === "list" && <Button icon="ADD" onClick={openAdd}>Nuovo oggetto smarrito</Button>}
                {view === "detail" && selected && <Button icon="EDIT" onClick={() => openEdit(selected)}>Modifica</Button>}
            </div>
            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "form" && renderForm()}
            {view === "detail" && selected && renderDetail(selected)}
        </div>
    );
}
