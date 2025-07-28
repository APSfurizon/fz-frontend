import { ICONS } from "@/components/icon";
import {
    AutoInputFilter, AutoInputManager, AutoInputSearchResult, createSearchResult, filterLoaded,
    filterSearchResult, SearchType
} from "../components/autoInput";
import { FormApiAction, FormDTOBuilder, getData } from "../components/dataForm";
import { buildSearchParams } from "../utils";
import {
    ApiErrorResponse, ApiResponse, ApiAction, runRequest, SimpleApiResponse, ApiRequest,
    RequestType
} from "./global";
import { MediaData } from "./media";
import { UAParser } from "ua-parser-js";
import { SelectItem } from "../components/fpSelect";

export const REG_ITALIAN_FISCAL_CODE = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/gmi;

export interface UserSearchResult extends Partial<AutoInputSearchResult> {
    propic?: MediaData
}

export enum SponsorType {
    NONE = "NONE",
    SPONSOR = "SPONSOR",
    SUPER = "SUPER_SPONSOR"
}

export enum ExtraDays {
    NONE = "NONE",
    EARLY = "EARLY",
    LATE = "LATE",
    BOTH = "BOTH"
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
    user: { user: UserData, orderCode?: string },
    email: string,
    personalInfo: UserPersonalInfo,
    isBanned?: boolean
}

export interface UserPersonalInfo {
    id?: number;
    firstName?: string;
    lastName?: string;
    sex?: string;
    gender?: string;
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
    userId?: number;
    note?: string;
    telegramUsername?: string;
    idType?: string;
    idNumber?: string;
    idExpiry?: string;
    idIssuer?: string;
    shirtSize?: string;
}

export interface UserDisplayResponse extends ApiResponse {
    display: UserData,
    roles?: UserRole[],
    permissions?: string[]
}

export class UserDisplayAction extends ApiAction<UserDisplayResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "users/display/me";
}

export interface UserSearchResponse extends ApiResponse {
    users: UserSearchResult[]
}

export class UserSearchAction extends ApiAction<UserSearchResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "users/search/current-event";
}

/**
 * Defines the search service to look for users
 * @param additionalValues [0] = isAdminSearch = boolean
 */
export class AutoInputUsersManager implements AutoInputManager {
    codeOnly: boolean = false;

    loadByIds(filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            const params = buildSearchParams({ "id": filter.filteredIds.map(num => "" + num) })
            runRequest(new UserSearchAction(), ["by-id"], undefined, params).then(results => {
                const users = results.users.map(usr => toSearchResult(usr));
                resolve(filterLoaded(users, filter));
            });
        });
    }

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        const params = [...(additionalValues || [])]
        return new Promise((resolve) => {
            runRequest(new UserSearchAction(), undefined, undefined, buildSearchParams({ "name": value, "is-admin-search": params[0] ?? false })).then(results => {
                const users = results.users.map(usr => toSearchResult(usr));
                resolve(
                    filterLoaded(users, filter, filterOut)
                );
            });
        });
    }

    isPresent(): Promise<boolean> { return new Promise((resolve) => resolve(true)); };
}

export function toSearchResult(usr: UserSearchResult): AutoInputSearchResult {
    const toReturn = new AutoInputSearchResult();
    toReturn.id = usr.id;
    toReturn.code = usr.code;
    toReturn.icon = usr.icon;
    toReturn.description = usr.description;
    toReturn.imageUrl = usr.propic?.mediaUrl ?? undefined;
    return toReturn;
}

/**
 * Defines the search service to look for users to invite in rooms
 */
export class AutoInputRoomInviteManager extends AutoInputUsersManager {

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter,
        filterOut?: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            runRequest(new UserSearchAction(), undefined, undefined,
                buildSearchParams({ "name": value, "filter-not-in-room": "true" }))
                .then(results => {
                    const users = results.users.map(usr => toSearchResult(usr));
                    resolve(
                        filterLoaded(users, filter, filterOut)
                    );
                });
        });
    }
}

export class UpdatePersonalInfoDTOBuilder implements FormDTOBuilder<UserPersonalInfo> {
    mapToDTO = (data: FormData) => {
        const toReturn: UserPersonalInfo = {
            firstName:          getData(data, "firstName"),
            lastName:           getData(data, "lastName"),
            sex:                getData(data, "sex"),
            gender:             getData(data, "gender"),
            allergies:          getData(data, "allergies"),
            fiscalCode:         getData(data, "fiscalCode"),
            birthCity:          getData(data, "birthCity"),
            birthRegion:        getData(data, "birthRegion"),
            birthCountry:       getData(data, "birthCountry"),
            birthday:           getData(data, "birthday"),
            residenceAddress:   getData(data, "residenceAddress"),
            residenceZipCode:   getData(data, "residenceZipCode"),
            residenceCity:      getData(data, "residenceCity"),
            residenceRegion:    getData(data, "residenceRegion"),
            residenceCountry:   getData(data, "residenceCountry"),
            prefixPhoneNumber:  getData(data ,"phonePrefix"),
            phoneNumber:        getData(data, "phoneNumber"),
            userId:             parseInt(data.get("userId")?.toString() ?? "0"),
            id:                 parseInt(data.get("id")?.toString() ?? "0"),
            lastUpdatedEventId: undefined,
            note:               undefined,
            telegramUsername:   getData(data, "telegramUsername"),
            idType:             getData(data, "idType"),
            idNumber:           getData(data, "idNumber"),
            idIssuer:           getData(data, "idIssuer"),
            idExpiry:           getData(data, "idExpiry"),
            shirtSize:          getData(data, "shirtSize")
        };
        return toReturn;
    }
}

export class UpdatePersonalInfoFormAction extends FormApiAction<UserPersonalInfo, SimpleApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new UpdatePersonalInfoDTOBuilder();
    urlAction = "membership/update-personal-user-information";
}

export interface GetPersonalInfoResponse extends UserPersonalInfo, ApiResponse { }

export class GetPersonalInfoAction extends ApiAction<GetPersonalInfoResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "membership/get-personal-user-information";
}

export interface UserOrderLinkingData {
    orderCode: string,
    orderSecret: string
}

export class UserOrderLinkingAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "orders-workflow/link-order";
}

export function getAutoInputSexes() {
    return new Promise<AutoInputSearchResult[]>((resolve) => {
        resolve([
            createSearchResult({
                code: "M",
                translatedDescription: { "it": "Maschio", "en": "Male" },
                icon: ICONS.MALE
            }),
            createSearchResult({
                code: "F",
                translatedDescription: { "it": "Femmina", "en": "Female" },
                icon: ICONS.FEMALE
            }),
        ])
    });
}

export function getAutoInputGenders() {
    return new Promise<AutoInputSearchResult[]>((resolve) => {
        resolve([
            createSearchResult({
                code: "CisMan",
                translatedDescription: { "it": "Uomo cis", "en": "cis Man" }
            }),
            createSearchResult({
                code: "CisWoman",
                translatedDescription: { "it": "Donna cis", "en": "cis Woman" }
            }),
            createSearchResult({
                code: "TransMan",
                translatedDescription: { "it": "Uomo trans", "en": "trans Man" }
            }),
            createSearchResult({
                code: "TransWoman",
                translatedDescription: { "it": "Donna trans", "en": "trans Woman" }
            }),
            createSearchResult({
                code: "Agender",
                translatedDescription: { "it": "Agender", "en": "Agender" }
            }),
            createSearchResult({
                code: "BiGender",
                translatedDescription: { "it": "Bigender", "en": "Bigender" }
            }),
            createSearchResult({
                code: "Genderfluid",
                translatedDescription: { "it": "Genderfluid", "en": "Genderfluid" }
            }),
            createSearchResult({
                code: "Questioning",
                translatedDescription: { "it": "Questioning", "en": "Questioning" }
            }),
            createSearchResult({
                code: "Queer",
                translatedDescription: { "it": "Queer", "en": "Queer" }
            }),
            createSearchResult({
                code: "NonBinary",
                translatedDescription: { "it": "Non binario", "en": "Non-binary" }
            }),
            createSearchResult({
                code: "DemiBoy",
                translatedDescription: { "it": "Demiboy", "en": "Demiboy" }
            }),
            createSearchResult({
                code: "DemiGirl",
                translatedDescription: { "it": "Demigirl", "en": "Demigirl" }
            }),
            createSearchResult({
                code: "Intersex",
                translatedDescription: { "it": "Intersex", "en": "Intersex" }
            }),
            createSearchResult({
                code: "NoAnswer",
                translatedDescription: { "it": "Preferisco non rispondere", "en": "I prefer not to say" }
            }),
            createSearchResult({
                code: "NotListed",
                translatedDescription: { "it": "Non in lista", "en": "Not in this list" }
            })
        ])
    });
}

export const idTypeAnswers = [
    new SelectItem(undefined,
        "id_card",
        "Id card",
        ICONS.ID_CARD,
        undefined,
        undefined,
        { "it": "Carta d'identità", "en": "Identity Card" }
    ),
    new SelectItem(
        undefined,
        "driver_license",
        "Driver license",
        ICONS.DIRECTIONS_CAR,
        undefined,
        undefined,
        { "it": "Patente", "en": "Driver license" }
    ),
    new SelectItem(
        undefined,
        "passport",
        "Passport", 
        ICONS.PERSON_BOOK,
        undefined,
        undefined,
        { "it": "Passaporto", "en": "Passport" }
    )
];

export const shirtSizeAnswers = ['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl']
.map(sz => new SelectItem(
    undefined,
    sz,
    sz.toUpperCase(),
    undefined,
    undefined,
    undefined,
    undefined
));

export class AutoInputSexManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds(filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            getAutoInputSexes().then(results => {
                resolve(filterLoaded(results, filter));
            });
        });
    }

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            getAutoInputSexes().then(results => {
                resolve(
                    filterSearchResult(value, SearchType.RANKED, results, locale, filter, filterOut)
                );
            });
        });
    }

    isPresent(): Promise<boolean> { return new Promise((resolve) => resolve(true)); };
}

export class AutoInputGenderManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds(filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            getAutoInputGenders().then(results => {
                resolve(filterLoaded(results, filter));
            });
        });
    }

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter,
        filterOut?: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            getAutoInputGenders().then(results => {
                resolve(
                    filterSearchResult(value, SearchType.RANKED, results, locale, filter, filterOut)
                );
            });
        });
    }

    isPresent(): Promise<boolean> { return new Promise((resolve) => resolve(true)); };
}

export function getUaFriendly(userAgent: string) {
    const ua = UAParser(userAgent);
    return `${ua.browser} - ${ua.os}`
}

export interface UserSession {
    sessionId: string,
    userAgent: string,
    createdAt: string,
    lastUsageAt: string
}

export interface AllSessionsResponse extends ApiResponse {
    sessions: UserSession[]
}

export class GetAllSessionsAction extends ApiAction<AllSessionsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "users/me/sessions";
}

export interface DestroySessionData extends ApiRequest {
    sessionId: string
}

export class DestroySessionAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/destroy-session";
}

export class DestroyAllSessionsAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/destroy-all-sessions";
}