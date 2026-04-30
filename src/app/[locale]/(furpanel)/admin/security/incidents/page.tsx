'use client'
import useTitle from "@/components/hooks/useTitle";
import Button from "@/components/input/button";
import FpInput from "@/components/input/fpInput";
import LoadingPanel from "@/components/loadingPanel";
import ErrorMessage from "@/components/errorMessage";
import Modal from "@/components/modal";
import ImagePreviewModal from "@/components/imagePreviewModal";
import { useModalUpdate } from "@/components/context/modalProvider";
import { runRequest } from "@/lib/api/global";
import {
    AddSecurityIncidentMessageApiAction,
    CreateSecurityIncidentApiAction,
    GetSecurityIncidentDetailApiAction,
    GetSecurityIncidentsApiAction,
    SecurityIncident,
    UpdateSecurityIncidentApiAction,
} from "@/lib/api/admin/security";
import { UserDisplayAction } from "@/lib/api/user";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const INCIDENT_BADGE_STYLE = {
    display: "inline-flex",
    width: "fit-content",
    alignSelf: "flex-start",
    padding: "4px 12px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
};

function splitCsvNames(value?: string | null) {
    return (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

function formatReportDate(value?: number) {
    if (!value) return "";
    const date = new Date(value);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
}

export default function SecurityIncidentsPage() {
    useTitle("Registro Incidenti");
    const router = useRouter();
    const { showModal } = useModalUpdate();

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [view, setView] = useState<"list" | "create" | "detail">("list");

    const [reports, setReports] = useState<SecurityIncident[]>([]);
    const [disabledReports, setDisabledReports] = useState<SecurityIncident[]>([]);
    const [historyReports, setHistoryReports] = useState<SecurityIncident[]>([]);
    const [selected, setSelected] = useState<SecurityIncident | null>(null);
    const [currentUserName, setCurrentUserName] = useState("");

    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPeople, setNewPeople] = useState("");
    const [newImportant, setNewImportant] = useState(true);
    const [newImage, setNewImage] = useState<File | null>(null);

    const [replyMessage, setReplyMessage] = useState("");
    const [replyImage, setReplyImage] = useState<File | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailPeople, setDetailPeople] = useState("");
    const [detailImportant, setDetailImportant] = useState(false);
    const [detailSuspend, setDetailSuspend] = useState(false);
    const [detailHistory, setDetailHistory] = useState(false);

    const importantReports = useMemo(() => reports.filter((item) => !!item.importante), [reports]);
    const regularReports = useMemo(() => reports.filter((item) => !item.importante), [reports]);

    const resetCreateForm = () => {
        setNewTitle("");
        setNewDescription("");
        setNewPeople("");
        setNewImportant(true);
        setNewImage(null);
    };

    const loadCurrentUser = () => {
        runRequest({ action: new UserDisplayAction() })
            .then((response) => setCurrentUserName(response.display?.fursonaName ?? ""))
            .catch(() => setCurrentUserName(""));
    };

    const loadReports = (history = showHistory) => {
        const params = new URLSearchParams();
        params.set("filter", "ALL");
        if (history) params.set("id", "cronologia");

        setLoading(true);
        return runRequest({ action: new GetSecurityIncidentsApiAction(), searchParams: params })
            .then((response) => {
                const mappedReports = (response.reports ?? []).map((item) => ({
                    ...item,
                    textData: formatReportDate(item.data),
                }));
                const mappedDisabled = (response.disabledReports ?? []).map((item) => ({
                    ...item,
                    textData: formatReportDate(item.data),
                }));

                if (history) {
                    setHistoryReports([...(mappedReports ?? []), ...(mappedDisabled ?? [])]
                        .sort((a, b) => (b.data ?? 0) - (a.data ?? 0)));
                } else {
                    setReports(mappedReports);
                    setDisabledReports(mappedDisabled);
                }
            })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const refreshList = () => {
        setRefreshing(true);
        loadReports().finally(() => setRefreshing(false));
    };

    const openDetail = (item: SecurityIncident) => {
        const params = new URLSearchParams();
        params.set("reportId", String(item.data));
        if (item.fileName) params.set("fileName", item.fileName);
        if (item.folder) params.set("folder", item.folder);

        setLoading(true);
        runRequest({ action: new GetSecurityIncidentDetailApiAction(), searchParams: params })
            .then((response) => {
                const report = {
                    ...response.report,
                    fileName: response.report.fileName ?? item.fileName,
                    folder: response.report.folder ?? item.folder,
                    textData: formatReportDate(response.report.data),
                };
                setSelected(report);
                setView("detail");
                setReplyMessage("");
                setReplyImage(null);
            })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const saveIncident = () => {
        const message = newDescription.trim();
        if (message.length < 3) {
            showModal("Dati mancanti", <span>Inserisci una descrizione di almeno 3 caratteri</span>);
            return;
        }

        const body = new FormData();
        body.append("from", currentUserName || "Security");
        body.append("persone_coinvolte", newPeople.trim());
        body.append("titolo", (newTitle.trim() || message.split("\n")[0]).trim());
        body.append("messaggio", message);
        body.append("importante", newImportant ? "1" : "0");
        if (newImage) body.append("logo", newImage);

        setLoading(true);
        runRequest({ action: new CreateSecurityIncidentApiAction(), body })
            .then(() => {
                resetCreateForm();
                setView("list");
                loadReports(false);
            })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const sendReply = () => {
        if (!selected) return;
        const message = replyMessage.trim();
        if (message.length < 1) return;

        const body = new FormData();
        body.append("from", currentUserName || "Security");
        body.append("messaggio", message);
        body.append("reportId", String(selected.data));
        if (selected.fileName) body.append("fileName", selected.fileName);
        if (selected.updateId) body.append("expectedUpdateId", selected.updateId);
        if (replyImage) body.append("logo", replyImage);

        setLoading(true);
        runRequest({ action: new AddSecurityIncidentMessageApiAction(), body })
            .then((response) => {
                const report = {
                    ...response.report,
                    fileName: response.report.fileName ?? selected.fileName,
                    folder: response.report.folder ?? selected.folder,
                    textData: formatReportDate(response.report.data),
                };
                setSelected(report);
                setReplyMessage("");
                setReplyImage(null);
                refreshList();
            })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    const openEditMeta = () => {
        if (!selected) return;
        setDetailPeople(selected.persone_coinvolte ?? "");
        setDetailImportant(!!selected.importante && selected.folder !== "cronologia");
        setDetailSuspend(!!selected.sospeso && selected.folder !== "cronologia");
        setDetailHistory(selected.folder === "cronologia");
        setDetailsModalOpen(true);
    };

    const saveMeta = () => {
        if (!selected) return;
        const body = {
            filename: String(selected.data),
            fileName: selected.fileName,
            folder: selected.folder,
            persone_coinvolte: detailPeople,
            importante: detailHistory ? false : detailImportant,
            sospeso: detailHistory ? true : detailSuspend,
            cronologia: detailHistory,
            expectedUpdateId: selected.updateId,
        };

        setLoading(true);
        runRequest({ action: new UpdateSecurityIncidentApiAction(), body })
            .then((response) => {
                setDetailsModalOpen(false);
                if (detailHistory) {
                    setSelected(null);
                    setView("list");
                    loadReports(showHistory);
                    return;
                }
                setSelected((prev) => prev ? {
                    ...prev,
                    persone_coinvolte: detailPeople,
                    importante: detailImportant,
                    sospeso: detailSuspend,
                    updateId: response.updateId ?? prev.updateId,
                } : prev);
                refreshList();
            })
            .catch((err) => showModal("Errore", <ErrorMessage error={err} />))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useEffect(() => {
        // In React StrictMode (dev), first mount is intentionally replayed.
        // Defer and cancel here so only the committed mount performs the fetch.
        const deferredLoad = setTimeout(() => {
            loadReports(showHistory);
        }, 0);

        return () => clearTimeout(deferredLoad);
    }, [showHistory]);

    const renderBadge = (label: string, color: string) => (
        <span style={{ ...INCIDENT_BADGE_STYLE, background: color, color: "#fff" }}>{label}</span>
    );

    const renderReportCard = (item: SecurityIncident, disabled = false) => {
        const messageCount = item.messaggi?.length ?? 0;
        const isHistory = item.folder === "cronologia";
        return (
            <div key={`${item.data}_${item.fileName ?? "report"}`}
                className="rounded-m"
                style={{ padding: "0.75em", margin: 0, cursor: "pointer", display: "flex", gap: "0.75em", alignItems: "flex-start", background: "var(--table-header-row-bg)", border: "1px solid #00000030", boxShadow: "0px 1px 6px 0px #0000002a", opacity: disabled ? 0.85 : 1 }}
                onClick={() => openDetail(item)}>
                <div style={{ flex: 1 }}>
                    <div className="horizontal-list gap-2mm flex-vertical-center" style={{ flexWrap: "wrap", marginBottom: 4 }}>
                        {item.importante && !isHistory && renderBadge("Importante", "#f39c12")}
                        {item.sospeso && !isHistory && renderBadge("Sospesa", "#7f8c8d")}
                        {isHistory && renderBadge("Storico", "#8e44ad")}
                        <span className="title small color-subtitle">{item.textData}</span>
                    </div>
                    <span className="title normal" style={{ fontWeight: 700, display: "block" }}>{item.titolo || "Senza titolo"}</span>
                    {item.from && <span className="title small color-subtitle" style={{ display: "block", marginTop: 2 }}>👤 {item.from}</span>}
                    {item.messaggio && <span className="title small color-subtitle" style={{ display: "block", marginTop: 2 }}>{item.messaggio}</span>}
                </div>
                <span className="title small color-subtitle" style={{ whiteSpace: "nowrap" }}>Messaggi ({messageCount})</span>
            </div>
        );
    };

    const renderList = () => (
        <div className="vertical-list gap-2mm">
            {showHistory ? (
                <div className="vertical-list gap-2mm table-container title rounded-m furpanel-table-container">
                    <span className="title normal color-subtitle">Storico ({historyReports.length})</span>
                    {historyReports.length === 0 && <span className="title normal color-subtitle">Nessuna segnalazione nello storico</span>}
                    {historyReports.map((item) => renderReportCard(item, true))}
                </div>
            ) : (
                <>
                    <div className="vertical-list gap-2mm table-container title rounded-m furpanel-table-container">
                        <span className="title normal color-subtitle">Segnalazioni importanti ({importantReports.length})</span>
                        {importantReports.length === 0 && <span className="title small color-subtitle">Nessuna segnalazione importante</span>}
                        {importantReports.map((item) => renderReportCard(item))}
                    </div>
                    <div className="vertical-list gap-2mm table-container title rounded-m furpanel-table-container">
                        <span className="title normal color-subtitle">Segnalazioni ({regularReports.length})</span>
                        {regularReports.length === 0 && <span className="title small color-subtitle">Nessuna segnalazione attiva</span>}
                        {regularReports.map((item) => renderReportCard(item))}
                    </div>
                    <div className="vertical-list gap-2mm table-container title rounded-m furpanel-table-container">
                        <span className="title normal color-subtitle">Segnalazioni sospese ({disabledReports.length})</span>
                        {disabledReports.length === 0 && <span className="title small color-subtitle">Nessuna segnalazione sospesa</span>}
                        {disabledReports.map((item) => renderReportCard(item, true))}
                    </div>
                </>
            )}
        </div>
    );

    const renderCreate = () => (
        <div className="vertical-list gap-3mm">
            <span className="title large">Nuova segnalazione</span>
            <FpInput label="Titolo" initialValue={newTitle} onChange={(e) => setNewTitle(e.target.value ?? "")} placeholder="Titolo segnalazione" />
            <FpInput label="Persone coinvolte" initialValue={newPeople} onChange={(e) => setNewPeople(e.target.value ?? "")} placeholder="Nome1, Nome2, ..." />
            <div className="vertical-list gap-2mm">
                <span className="title small">Descrizione</span>
                <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Descrivi l'incidente..."
                    style={{ minHeight: 140, padding: 12, borderRadius: 10, border: "1px solid #ffffff15", background: "#0e1621", color: "#fff", resize: "vertical" }}
                />
            </div>
            <div className="vertical-list gap-2mm">
                <span className="title small">Screenshot / immagine</span>
                <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] ?? null)} />
                {newImage && <span className="title small color-subtitle">{newImage.name}</span>}
            </div>
            <label className="horizontal-list gap-2mm flex-vertical-center" style={{ width: "fit-content" }}>
                <input type="checkbox" checked={newImportant} onChange={(e) => setNewImportant(e.target.checked)} />
                <span className="title small">Segna come importante</span>
            </label>
            <div className="horizontal-list gap-2mm">
                <Button onClick={() => { resetCreateForm(); setView("list"); }}>Annulla</Button>
                <Button icon="SEND" busy={loading} onClick={saveIncident}>Invia</Button>
            </div>
        </div>
    );

    const renderDetail = (item: SecurityIncident) => {
        const people = splitCsvNames(item.persone_coinvolte);
        return (
            <div className="vertical-list gap-3mm">
                <div className="vertical-list gap-2mm">
                    <span className="title large">{item.titolo || "Segnalazione"}</span>
                    <div className="horizontal-list gap-2mm flex-vertical-center" style={{ flexWrap: "wrap" }}>
                        {item.importante && renderBadge("Importante", "#f39c12")}
                        {item.sospeso && item.folder !== "cronologia" && renderBadge("Sospesa", "#7f8c8d")}
                        {item.folder === "cronologia" && renderBadge("Storico", "#8e44ad")}
                    </div>
                    <span className="title small color-subtitle">Segnalato da: {item.from || "-"}</span>
                    <span className="title small color-subtitle">{item.textData}</span>
                </div>

                {people.length > 0 && (
                    <div className="vertical-list gap-2mm">
                        <span className="title small color-subtitle">Persone coinvolte</span>
                        <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                            {people.map((name, idx) => (
                                <span key={`${name}_${idx}`} style={{ ...INCIDENT_BADGE_STYLE, background: "#132033", color: "#fff" }}>{name}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="vertical-list furpanel-table-container">
                    {(item.messaggi ?? []).map((message, idx) => (
                        <div key={`${message.id ?? idx}_${message.data ?? idx}`} className="main-dialog rounded-m" style={{ padding: "0.75em", display: "flex", flexDirection: "row", gap: "0.75em", alignItems: "flex-start" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="horizontal-list gap-2mm flex-vertical-center" style={{ flexWrap: "wrap" }}>
                                    <span className="title small" style={{ fontWeight: 700 }}>{message.from || "-"}</span>
                                    <span className="title small color-subtitle">{formatReportDate(message.data)}</span>
                                </div>
                                {message.messaggio && <span className="title small" style={{ display: "block", marginTop: 6 }}>{message.messaggio}</span>}
                            </div>
                            {message.logoUrl && (
                                <ImagePreviewModal
                                    imageUrl={`/api/image-proxy?url=${encodeURIComponent(message.logoUrl)}`}
                                    alt={`${item.titolo || "Segnalazione"} - allegato ${idx + 1}`}
                                    thumbSize={108}
                                    title={(message.messaggio?.trim() || item.titolo || "Anteprima immagine").slice(0, 48)}
                                />
                            )}
                        </div>
                    ))}
                    {(item.messaggi?.length ?? 0) === 0 && <span className="title small color-subtitle">Nessun messaggio disponibile</span>}
                </div>

                {item.folder !== "cronologia" && (
                    <div className="vertical-list gap-2mm">
                        <span className="title small color-subtitle">Aggiungi messaggio</span>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Scrivi un messaggio..."
                            style={{ minHeight: 100, padding: 12, borderRadius: 10, border: "1px solid #ffffff15", background: "#0e1621", color: "#fff", resize: "vertical" }}
                        />
                        <input type="file" accept="image/*" onChange={(e) => setReplyImage(e.target.files?.[0] ?? null)} />
                        {replyImage && <span className="title small color-subtitle">{replyImage.name}</span>}
                    </div>
                )}

                <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                    {item.folder !== "cronologia" && <Button icon="SEND" busy={loading} disabled={!replyMessage.trim()} onClick={sendReply}>Invia messaggio</Button>}
                </div>
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
                    setView("list");
                }}>Indietro</Button>

                {view === "list" && <Button onClick={refreshList} busy={refreshing}>Aggiorna</Button>}

                <div className="spacer" />

                {view === "list" && (
                    <>
                        <Button icon="ADD" onClick={() => { resetCreateForm(); setView("create"); }}>Aggiungi</Button>
                        <Button onClick={() => setShowHistory((prev) => !prev)}>{showHistory ? "Segnalazioni" : "Storico"}</Button>
                    </>
                )}

                {view === "detail" && selected && <Button icon="EDIT" onClick={openEditMeta}>Modifica</Button>}
            </div>

            {loading && view === "list" && <LoadingPanel />}
            {!loading && view === "list" && renderList()}
            {view === "create" && renderCreate()}
            {view === "detail" && selected && renderDetail(selected)}

            <Modal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Modifica segnalazione" icon="EDIT" style={{ width: "min(92vw, 520px)" }}>
                <div className="vertical-list gap-3mm">
                    <FpInput label="Persone coinvolte" initialValue={detailPeople} onChange={(e) => setDetailPeople(e.target.value ?? "")} placeholder="Nome1, Nome2, ..." />
                    <label className="horizontal-list gap-2mm flex-vertical-center" style={{ width: "fit-content" }}>
                        <input type="checkbox" checked={detailImportant} onChange={(e) => {
                            const checked = e.target.checked;
                            setDetailImportant(checked);
                            if (checked) {
                                setDetailSuspend(false);
                                setDetailHistory(false);
                            }
                        }} />
                        <span className="title small">Segna come importante</span>
                    </label>
                    <label className="horizontal-list gap-2mm flex-vertical-center" style={{ width: "fit-content" }}>
                        <input type="checkbox" checked={detailSuspend} onChange={(e) => {
                            const checked = e.target.checked;
                            setDetailSuspend(checked);
                            if (checked) {
                                setDetailImportant(false);
                                setDetailHistory(false);
                            }
                        }} />
                        <span className="title small">Sospendi segnalazione</span>
                    </label>
                    <label className="horizontal-list gap-2mm flex-vertical-center" style={{ width: "fit-content" }}>
                        <input type="checkbox" checked={detailHistory} onChange={(e) => {
                            const checked = e.target.checked;
                            setDetailHistory(checked);
                            if (checked) {
                                setDetailImportant(false);
                                setDetailSuspend(false);
                            }
                        }} />
                        <span className="title small">Storicizza segnalazione</span>
                    </label>
                    <div className="horizontal-list gap-2mm">
                        <Button onClick={() => setDetailsModalOpen(false)}>Annulla</Button>
                        <Button icon="CHECK" busy={loading} onClick={saveMeta}>Aggiorna</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
