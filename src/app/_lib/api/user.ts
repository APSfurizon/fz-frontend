import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, filterLoaded, filterSearchResult } from "../components/autoInput";
import { buildSearchParams } from "../utils";
import { ApiErrorResponse, ApiResponse, ApiAction, runRequest } from "./global";

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

export interface UserPersonalInfo {
    id?: number;
    firstName?: string;
    lastName?: string;
    fiscalCode?: string;
    birthCity?: string;
    birthRegion?: string;
    birthCountry?: string;
    birthday?: string;
    residenceAddress?: string;
    residenceZipCode?: string;
    residenceCity?: string;
    residenceRegion?: string;
    residenceCountry?: string;
    prefixPhoneNumber?: string;
    phoneNumber?: string;
    lastUpdatedEventId?: number;
    userId?: number,
}

export interface UserDisplayResponse extends UserData, ApiResponse {}

export class UserDisplayAction implements ApiAction<UserDisplayResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/display/me";
    onSuccess: (status: number, body?: UserDisplayResponse) => void = (status: number, body?: UserDisplayResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface UserSearchResponse extends ApiResponse {
    users: AutoInputSearchResult[]
}

export class UserSearchAction implements ApiAction<UserSearchResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/search/current-event";
    onSuccess: (status: number, body?: UserSearchResponse) => void = (status: number, body?: UserSearchResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

/**
 * Defines the search service for users in rooms
 */
export class AutoInputRoomInviteManager implements AutoInputManager {
    codeOnly: boolean = false;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            runRequest (new UserSearchAction(), ["by-id"], undefined, undefined).then (results => {
                resolve (filterLoaded(results as AutoInputSearchResult[], filter));
            });
        });
    }

    searchByValues (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            runRequest (new UserSearchAction(), undefined, undefined, buildSearchParams({"fursona-name": value, "filter-not-in-room": "true"})).then (results => {
                const searchResult = results as UserSearchResponse;
                resolve (
                    filterLoaded(searchResult.users as AutoInputSearchResult[], filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> { return new Promise((resolve, reject) => resolve(true)); };
}