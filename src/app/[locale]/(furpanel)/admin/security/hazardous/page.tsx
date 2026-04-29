'use client'
import { useEffect, useState } from "react";
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
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";

const LIVELLI = ["basso", "medio", "alto", "critico"] as const;
const LIVELLO_LABEL: Record<string, string> = { basso: "Basso", medio: "Medio", alto: "Alto", critico: "Critico" };
const LIVELLO_COLOR: Record<string, string> = { basso: "#27ae60", medio: "#f39c12", alto: "#e67e22", critico: "#c0392b" };

export default function SecurityHazardousRegisterPage() {
    useTitle("Security - Hazardous Register");
    const { showModal } = useModalUpdate();

    const [hazards, setHazards] = useState<SecurityHazard[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterLivello, setFilterLivello] = useState<string | null>(null);
    const [view, setView] = useState<"list" | "form" | "detail">("list");
    const [selected, setSelected] = useState<SecurityHazard | null>(null);
    const [isEdit, setIsEdit] = useState(false);

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

    useEffect(() => { loadHazards(); }, []);

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
            showModal("Dati mancanti", <span>Inserisci almeno il titolo</span>);
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
        }
        setLoading(true);
        const action = isEdit ? new UpdateSecurityHazardApiAction() : new CreateSecurityHazardApiAction();
        runRequest({ action, body })
            .then(() => { resetForm(); setView("list"); loadHazards(); })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const filtered = filterLivello ? hazards.filter((h) => h.livello === filterLivello) : hazards;

    const renderList = () => (
        <div className="vertical-list gap-2mm">
            <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                <button className="button rounded-m" onClick={() => setFilterLivello(null)}
                    style={!filterLivello ? { background: "var(--button-background-active)" } : {}}>
                    <span className="title normal">Tutti ({hazards.length})</span>
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

            {filtered.length === 0 && <span className="title normal color-subtitle">Nessuna segnalazione</span>}
            {filtered.map((h) => (
                <div key={h.data} className="main-dialog rounded-m"
                    style={{ padding: "0.75em", cursor: "pointer", display: "flex", gap: "0.75em", alignItems: "flex-start", borderLeft: `4px solid ${LIVELLO_COLOR[h.livello]}` }}
                    onClick={() => { setSelected(h); setView("detail"); }}>
                    <div style={{ flex: 1 }}>
                        <div className="horizontal-list gap-2mm flex-vertical-center" style={{ marginBottom: 4 }}>
                            <span style={{ background: LIVELLO_COLOR[h.livello], color: "#fff", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 6 }}>{LIVELLO_LABEL[h.livello]}</span>
                            <span className="title small color-subtitle">{h.data ? new Date(h.data).toLocaleDateString() : ""}</span>
                        </div>
                        <span className="title normal" style={{ fontWeight: 700 }}>{h.titolo}</span>
                        {h.descrizione && <span className="title small color-subtitle" style={{ display: "block", marginTop: 2 }}>{h.descrizione}</span>}
                        {h.trovato_da && <span className="title small color-subtitle">👤 {h.trovato_da}</span>}
                    </div>
                    {(h.foto?.length ?? 0) > 0 && (
                        <span style={{ background: "#1f6feb", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 12 }}>📷 {h.foto!.length}</span>
                    )}
                </div>
            ))}
            <Button icon="ADD" onClick={openAdd}>Aggiungi segnalazione</Button>
        </div>
    );

    const renderForm = () => (
        <div className="vertical-list gap-3mm">
            <span className="title large">{isEdit ? "Modifica segnalazione" : "Nuova segnalazione"}</span>
            <FpInput label="Titolo *" initialValue={fTitolo} onChange={(v) => setFTitolo(v ?? "")} placeholder="Titolo segnalazione" />
            <FpInput label="Descrizione" initialValue={fDescrizione} onChange={(v) => setFDescrizione(v ?? "")} placeholder="Descrizione del pericolo..." />
            <FpInput label="Nickname Proprietario" initialValue={fProprietarioNick} onChange={(v) => setFProprietarioNick(v ?? "")} placeholder="Nickname" />
            <FpInput label="ID Proprietario" initialValue={fProprietarioId} onChange={(v) => setFProprietarioId(v ?? "")} placeholder="ID utente" />
            <div>
                <span className="title small" style={{ display: "block", marginBottom: 6 }}>Livello</span>
                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                    {LIVELLI.map((l) => (
                        <button key={l} className="button rounded-m" onClick={() => setFLivello(l)}
                            style={fLivello === l ? { background: LIVELLO_COLOR[l], borderColor: LIVELLO_COLOR[l], color: "#fff" } : {}}>
                            {LIVELLO_LABEL[l]}
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

    const renderDetail = (h: SecurityHazard) => (
        <div className="vertical-list gap-3mm">
            <span className="title large">{h.titolo}</span>
            <span style={{ display: "inline-block", background: LIVELLO_COLOR[h.livello], color: "#fff", padding: "4px 14px", borderRadius: 8, fontWeight: 700 }}>{LIVELLO_LABEL[h.livello]}</span>
            {[
                ["Descrizione", h.descrizione], ["Segnalato da", h.trovato_da],
                ["Proprietario", h.proprietario_nickname], ["ID Proprietario", h.proprietario_id],
                ["Data", h.data ? new Date(h.data).toLocaleString() : undefined],
            ].filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label} className="horizontal-list gap-2mm" style={{ borderBottom: "1px solid #ffffff15", paddingBottom: 6 }}>
                    <span className="title small color-subtitle" style={{ minWidth: 160 }}>{label}</span>
                    <span className="title small">{value}</span>
                </div>
            ))}
            <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                <Button icon="EDIT" onClick={() => openEdit(h)}>Modifica</Button>
                <Button onClick={() => setView("list")}>← Indietro</Button>
            </div>
        </div>
    );

    return (
        <div className="stretch-page">
            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "form" && renderForm()}
            {view === "detail" && selected && renderDetail(selected)}
        </div>
    );
}
