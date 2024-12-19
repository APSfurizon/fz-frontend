import { ApiErrorResponse, ApiResponse, RequestAction } from "./global";

export const ENDPOINTS = Object.freeze({
    HEADER_DATA: "header/data",
});

export enum SponsorType {
    NONE = "NONE",
    SPONSOR = "SPONSOR",
    SUPER = "SUPER_SPONSOR"
}

export type UserData = {
    userId: number,
    fursonaName?: string,
    locale?: string,
    propicUrl?: string,
    sponsorship: SponsorType
}

export interface UserDisplayResponse extends UserData, ApiResponse {}

export class UserDisplayAction implements RequestAction<UserDisplayResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/display/me";
    onSuccess: (status: number, body?: UserDisplayResponse) => void = (status: number, body?: UserDisplayResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}