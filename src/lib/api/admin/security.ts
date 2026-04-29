import { ApiAction, ApiErrorResponse, ApiResponse, RequestType, SimpleApiResponse } from "../global";

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface SecurityAsset {
    data: number;
    fileName?: string;
    updateId?: number;
    tag: string;
    tipo: string;
    device_modello: string;
    seriale?: string;
    stato: "disponibile" | "in_uso" | "non_disponibile";
    utilizzatore?: string;
    note?: string;
    foto?: { url: string }[];
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

export class GetSecurityAssetsApiAction extends ApiAction<SecurityAssetsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/security/assets";
}

export class GetSecurityAssetLogsApiAction extends ApiAction<SecurityAssetLogsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/security/assets/logs";
    hasPathParams = true;
}

export class CreateSecurityAssetApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "admin/security/assets";
}

export class UpdateSecurityAssetApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.PATCH;
    urlAction = "admin/security/assets";
}

export class TransferSecurityAssetApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.PATCH;
    urlAction = "admin/security/assets/transfer";
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

export class GetSecurityHazardsApiAction extends ApiAction<SecurityHazardsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/security/hazards";
}

export class CreateSecurityHazardApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "admin/security/hazards";
}

export class UpdateSecurityHazardApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.PATCH;
    urlAction = "admin/security/hazards";
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
    items: SecurityLostItem[];
}

export class GetSecurityLostItemsApiAction extends ApiAction<SecurityLostItemsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/security/lost";
}

export class CreateSecurityLostItemApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "admin/security/lost";
}

export class UpdateSecurityLostItemApiAction extends ApiAction<SimpleApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.PATCH;
    urlAction = "admin/security/lost";
}
