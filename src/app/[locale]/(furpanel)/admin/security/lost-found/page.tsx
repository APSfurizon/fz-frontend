'use client'
import { useEffect, useState } from "react";
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
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";

export default function SecurityLostAndFoundPage() {
    useTitle("Security - Lost and Found");
    const { showModal } = useModalUpdate();

    const [items, setItems] = useState<SecurityLostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConsegnati, setShowConsegnati] = useState(false);
    const [view, setView] = useState<"list" | "form" | "detail">("list");
    const [selected, setSelected] = useState<SecurityLostItem | null>(null);
    const [isEdit, setIsEdit] = useState(false);

    // Form state
    const [fLuogo, setFLuogo] = useState("");
    const [fDescrizione, setFDescrizione] = useState("");
    const [fFoundBy, setFFoundBy] = useState("");
    const [fProprietario, setFProprietario] = useState("");
    const [fStatus, setFStatus] = useState<"smarrito" | "consegnato">("smarrito");

    const loadItems = () => {
        setLoading(true);
        runRequest({ action: new GetSecurityLostItemsApiAction() })
            .then((res) => setItems(res.items ?? []))
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadItems(); }, []);

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
        if (item.updateId) body.append("updateId", String(item.updateId));
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
                <button className="button rounded-m" style={{ flex: 1, ...((!showConsegnati) ? { background: "var(--button-background-active)", color: "#fff" } : {}) }}
                    onClick={() => setShowConsegnati(false)}>
                    Smarriti ({smarriti.length})
                </button>
                <button className="button rounded-m" style={{ flex: 1, ...(showConsegnati ? { background: "var(--button-background-active)", color: "#fff" } : {}) }}
                    onClick={() => setShowConsegnati(true)}>
                    Consegnati ({consegnati.length})
                </button>
            </div>

            {displayed.length === 0 && <span className="title normal color-subtitle">Nessun oggetto</span>}
            {displayed.map((item, idx) => (
                <div key={`${item.data}_${idx}`} className="main-dialog rounded-m"
                    style={{ padding: "0.75em", cursor: "pointer", display: "flex", gap: "0.75em", alignItems: "center" }}
                    onClick={() => { setSelected(item); setView("detail"); }}>
                    <div style={{ flex: 1 }}>
                        <span className="title normal" style={{ fontWeight: 700, display: "block" }}>{item.descrizione || "—"}</span>
                        {item.luogo_ritrovo && <span className="title small color-subtitle">📍 {item.luogo_ritrovo}</span>}
                        {item.found_by && <span className="title small color-subtitle" style={{ display: "block" }}>👤 {item.found_by}</span>}
                        <span className="title small color-subtitle" style={{ opacity: 0.7 }}>{item.data ? new Date(item.data).toLocaleDateString() : ""}</span>
                    </div>
                    {(item.immagini?.length ?? 0) > 0 && (
                        <span style={{ background: "#1f6feb", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 12 }}>🖼 {item.immagini!.length}</span>
                    )}
                </div>
            ))}
            <Button icon="ADD" onClick={openAdd}>Nuovo oggetto smarrito</Button>
        </div>
    );

    const renderForm = () => (
        <div className="vertical-list gap-3mm">
            <span className="title large">{isEdit ? "Modifica oggetto" : "Nuovo oggetto smarrito"}</span>
            <FpInput label="Luogo di ritrovamento" initialValue={fLuogo} onChange={(v) => setFLuogo(v ?? "")} placeholder="Es. Padiglione A, ingresso..." />
            <FpInput label="Descrizione *" initialValue={fDescrizione} onChange={(v) => setFDescrizione(v ?? "")} placeholder="Descrizione dell'oggetto..." />
            <FpInput label="Trovato da" initialValue={fFoundBy} onChange={(v) => setFFoundBy(v ?? "")} placeholder="Nome di chi ha trovato" />
            <FpInput label="Proprietario" initialValue={fProprietario} onChange={(v) => setFProprietario(v ?? "")} placeholder="Nome del proprietario (se noto)" />
            <div className="horizontal-list gap-2mm">
                <button className="button rounded-m" style={{ flex: 1, ...(fStatus === "smarrito" ? { background: "#c0392b", borderColor: "#c0392b", color: "#fff" } : {}) }}
                    onClick={() => setFStatus("smarrito")}>Smarrito</button>
                <button className="button rounded-m" style={{ flex: 1, ...(fStatus === "consegnato" ? { background: "#27ae60", borderColor: "#27ae60", color: "#fff" } : {}) }}
                    onClick={() => setFStatus("consegnato")}>Consegnato</button>
            </div>
            <div className="horizontal-list gap-2mm">
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
                <span style={{ display: "inline-block", background: isConsegnato ? "#27ae60" : "#c0392b", color: "#fff", padding: "4px 14px", borderRadius: 8, fontWeight: 700 }}>
                    {isConsegnato ? "CONSEGNATO" : "SMARRITO"}
                </span>
                {rows.filter(([, v]) => !!v).map(([label, value]) => (
                    <div key={label} className="horizontal-list gap-2mm" style={{ borderBottom: "1px solid #ffffff15", paddingBottom: 6 }}>
                        <span className="title small color-subtitle" style={{ minWidth: 160 }}>{label}</span>
                        <span className="title small">{value}</span>
                    </div>
                ))}
                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                    {!isConsegnato && (
                        <Button icon="CHECK" style={{ background: "#27ae60" }} onClick={() => {
                            if (confirm("Confermi la consegna dell'oggetto?")) markConsegnato(item);
                        }}>Segna Consegnato</Button>
                    )}
                    <Button icon="EDIT" onClick={() => openEdit(item)}>Modifica</Button>
                    <Button onClick={() => setView("list")}>← Indietro</Button>
                </div>
            </div>
        );
    };

    return (
        <div className="stretch-page">
            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "form" && renderForm()}
            {view === "detail" && selected && renderDetail(selected)}
        </div>
    );
}
