import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, filterLoaded, filterSearchResult, UserSearchResult } from "../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { buildSearchParams, nullifyEmptyString } from "../utils";
import { ApiErrorResponse, ApiResponse, ApiAction, runRequest, SimpleApiResponse } from "./global";
import { MediaData } from "./media";

export enum SponsorType {
    NONE = "NONE",
    SPONSOR = "SPONSOR",
    SUPER = "SUPER_SPONSOR"
}

export type UserRole = {
    roleId: number,
    displayName: string,
    internalName: string
}

export type UserData = {
    userId: number,
    orderCode?: string,
    fursonaName?: string,
    locale?: string,
    propic?: MediaData,
    sponsorship: SponsorType
}

export type CompleteUserData = {
    user: {user: UserData, orderCode?: string},
    email: string,
    personalInfo: UserPersonalInfo,
    isBanned?: boolean
}

export interface UserPersonalInfo {
    id?: number;
    firstName?: string;
    lastName?: string;
    allergies?: string;
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
    note?: string,
}

export interface UserDisplayResponse extends ApiResponse {
    display: UserData,
    roles?: UserRole[],
    permissions?: string[]
}

export class UserDisplayAction implements ApiAction<UserDisplayResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/display/me";
}

export interface UserSearchResponse extends ApiResponse {
    users: UserSearchResult[]
}

export class UserSearchAction implements ApiAction<UserSearchResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/search/current-event";
}

/**
 * Defines the search service to look for users
 * @param additionalValues [0] = isAdminSearch = boolean
 */
export class AutoInputUsersManager implements AutoInputManager {
    codeOnly: boolean = false;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            const params = buildSearchParams({"id": filter.filteredIds.map(num=>""+num)})
            runRequest (new UserSearchAction(), ["by-id"], undefined, params).then (results => {
                const users = (results as UserSearchResponse).users.map(usr=>toSearchResult(usr));
                resolve (filterLoaded(users, filter));
            });
        });
    }

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            runRequest (new UserSearchAction(), undefined, undefined, buildSearchParams({"name": value, "is-admin-search": additionalValues[0] ?? false})).then (results => {
                const searchResult = results as UserSearchResponse;
                const users = searchResult.users.map(usr=>toSearchResult(usr));
                resolve (
                    filterLoaded(users, filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> { return new Promise((resolve, reject) => resolve(true)); };
}

export function toSearchResult (usr: UserSearchResult): AutoInputSearchResult {
    return {
        id: usr.id,
        code: usr.code,
        icon: usr.icon,
        description: usr.description,
        imageUrl: usr.propic?.mediaUrl ?? null
    }
}

/**
 * Defines the search service to look for users to invite in rooms
 */
export class AutoInputRoomInviteManager extends AutoInputUsersManager {

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            runRequest (new UserSearchAction(), undefined, undefined, buildSearchParams({"name": value, "filter-not-in-room": "true"})).then (results => {
                const searchResult = results as UserSearchResponse;
                const users = searchResult.users.map(usr=>toSearchResult(usr));
                resolve (
                    filterLoaded(users, filter, filterOut)
                );
            });
        });
    }
}

export class UpdatePersonalInfoDTOBuilder implements FormDTOBuilder<UserPersonalInfo> {
    mapToDTO = (data: FormData) => {
        let toReturn: UserPersonalInfo = {
            firstName:          nullifyEmptyString(data.get('firstName')?.toString ()),
            lastName:           nullifyEmptyString(data.get('lastName')?.toString ()),
            allergies:          nullifyEmptyString(data.get('allergies')?.toString ()),
            fiscalCode:         nullifyEmptyString(data.get('fiscalCode')?.toString ()),
            birthCity:          nullifyEmptyString(data.get('birthCity')?.toString ()),
            birthRegion:        nullifyEmptyString(data.get('birthRegion')?.toString ()),
            birthCountry:       nullifyEmptyString(data.get('birthCountry')?.toString ()),
            birthday:           nullifyEmptyString(data.get('birthday')?.toString ()),
            residenceAddress:   nullifyEmptyString(data.get('residenceAddress')?.toString ()),
            residenceZipCode:   nullifyEmptyString(data.get('residenceZipCode')?.toString ()),
            residenceCity:      nullifyEmptyString(data.get('residenceCity')?.toString ()),
            residenceRegion:    nullifyEmptyString(data.get('residenceRegion')?.toString ()),
            residenceCountry:   nullifyEmptyString(data.get('residenceCountry')?.toString ()),
            prefixPhoneNumber:  nullifyEmptyString(data.get('phonePrefix')?.toString ()),
            phoneNumber:        nullifyEmptyString(data.get('phoneNumber')?.toString ()),
            userId:             parseInt(data.get('userId')?.toString () ?? "0"),
            id:                 parseInt(data.get('id')?.toString () ?? "0")
        };
        return toReturn;
    }
}

export class UpdatePersonalInfoFormAction implements FormApiAction<UserPersonalInfo, SimpleApiResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new UpdatePersonalInfoDTOBuilder ();
    urlAction = "membership/update-personal-user-information";
}

export class GetPersonalInfoAction implements ApiAction<UserSearchResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "membership/get-personal-user-information";
}

export interface UserOrderLinkingData {
    orderCode: string,
    orderSecret: string
}

export class UserOrderLinkingAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "orders-workflow/link-order";
}