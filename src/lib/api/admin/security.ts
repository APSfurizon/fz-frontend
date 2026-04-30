import { ApiErrorResponse, ApiResponse, MobileApiAction, RequestType, SimpleApiResponse } from "../global";

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface SecurityAsset {
    id?: number;
    data: number;
    data_creazione?: number;
    data_modifica?: number;
    fileName?: string;
    updateId?: string;
    tag: string;
    device_tipo: string;
    device_modello: string;
    device_serial_number?: string;
    stato: "disponibile" | "in_uso" | "non_disponibile";
    utilizzatore_attuale?: string | null;
    utilizzatore_precedente?: string | null;
    note_condizioni?: string;
    creato_da?: string;
    modificato_da?: string;
    data_ritiro?: string | number | null;
    foto?: { url: string; path?: string }[];
}

export interface SecurityAssetsResponse extends ApiResponse {
    assets: SecurityAsset[];
}

export interface SecurityAssetLogsResponse extends ApiResponse {
    logs: SecurityAssetLog[];
}

export interface SecurityAssetLog {
    id?: number;
    asset_id?: number;
    azione: string;
    data_aggiornamento: number;
    utilizzatore?: string;
    note?: string;
}

export class GetSecurityAssetsApiAction extends MobileApiAction<SecurityAssetsResponse, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "security/loadAssets";
}

export class GetSecurityAssetLogsApiAction extends MobileApiAction<SecurityAssetLogsResponse, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "security/loadAssetLogs";
}

export class CreateSecurityAssetApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/saveAsset";
}

export class UpdateSecurityAssetApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/updateAsset";
}

export class TransferSecurityAssetApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/updateAsset";
}

// ─── Hazardous register ──────────────────────────────────────────────────────

export interface SecurityHazard {
    data: number;
    fileName?: string;
    updateId?: number;
    titolo: string;
    descrizione?: string;
    livello: "basso" | "medio" | "alto" | "critico";
    trovato_da?: string;
    proprietario_id?: string;
    proprietario_nickname?: string;
    foto?: { url: string }[];
}

export interface SecurityHazardsResponse extends ApiResponse {
    hazards: SecurityHazard[];
}

export class GetSecurityHazardsApiAction extends MobileApiAction<SecurityHazardsResponse, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "security/loadHazards";
}

export class CreateSecurityHazardApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/saveHazard";
}

export class UpdateSecurityHazardApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/updateHazard";
}

// ─── Lost & Found ────────────────────────────────────────────────────────────

export interface SecurityLostItem {
    data: number;
    fileName?: string;
    updateId?: number;
    data_registrazione?: number;
    data_ritrovo?: number;
    data_riconsegna?: number;
    luogo_ritrovo?: string;
    descrizione?: string;
    found_by?: string;
    proprietario?: string;
    ricognizione?: string;
    status: "smarrito" | "consegnato";
    immagini?: { url: string }[];
}

export interface SecurityLostItemsResponse extends ApiResponse {
    items?: SecurityLostItem[];
    smarriti?: SecurityLostItem[];
    consegnati?: SecurityLostItem[];
}

export class GetSecurityLostItemsApiAction extends MobileApiAction<SecurityLostItemsResponse, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "security/loadLostFound";
}

export class CreateSecurityLostItemApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/saveLostFound";
}

export class UpdateSecurityLostItemApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/updateLostFound";
}

// ─── Incidents / Security Log ───────────────────────────────────────────────

export interface SecurityIncidentMessage {
    id?: number;
    data?: number;
    from?: string | null;
    messaggio?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
}

export interface SecurityIncident {
    data: number;
    fileName?: string;
    folder?: string;
    textData?: string;
    titolo?: string | null;
    messaggio?: string | null;
    from?: string | null;
    persone_coinvolte?: string | null;
    sospeso?: boolean;
    importante?: boolean;
    updateId?: string;
    logo?: string | null;
    logoUrl?: string | null;
    messaggi?: SecurityIncidentMessage[];
}

export interface SecurityIncidentsResponse extends ApiResponse {
    countReports?: number;
    reports: SecurityIncident[];
    disabledReports?: SecurityIncident[];
}

export interface SecurityIncidentDetailResponse extends ApiResponse {
    report: SecurityIncident;
}

export interface SecurityIncidentUpdateResponse extends SimpleApiResponse {
    updateId?: string;
}

export class GetSecurityIncidentsApiAction extends MobileApiAction<SecurityIncidentsResponse, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "security/loadSecurity";
}

export class GetSecurityIncidentDetailApiAction extends MobileApiAction<SecurityIncidentDetailResponse, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "security/loadSecurityDetail";
}

export class CreateSecurityIncidentApiAction extends MobileApiAction<SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/saveSecurity";
}

export class AddSecurityIncidentMessageApiAction extends MobileApiAction<SecurityIncidentDetailResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/addSecurityMessage";
}

export class UpdateSecurityIncidentApiAction extends MobileApiAction<SecurityIncidentUpdateResponse, ApiErrorResponse> {
    method = RequestType.POST;
    urlAction = "security/changeSecurity";
}
