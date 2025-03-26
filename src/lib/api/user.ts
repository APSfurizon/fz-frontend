import { ICONS } from "@/components/icon";
import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, createSearchResult, filterLoaded, filterSearchResult, SearchType } from "../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { buildSearchParams, nullifyEmptyString } from "../utils";
import { getAutoInputPermissions } from "./admin/role";
import { ApiErrorResponse, ApiResponse, ApiAction, runRequest, SimpleApiResponse } from "./global";
import { MediaData } from "./media";

export interface UserSearchResult extends Partial<AutoInputSearchResult> {
    propic: MediaData
}

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
    const toReturn = new AutoInputSearchResult();
    toReturn.id = usr.id,
    toReturn.code = usr.code,
    toReturn.icon = usr.icon,
    toReturn.description = usr.description,
    toReturn.imageUrl = usr.propic?.mediaUrl ?? null
    return toReturn;
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
            sex:                nullifyEmptyString(data.get('sex')?.toString ()),
            gender:             nullifyEmptyString(data.get('gender')?.toString ()),
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

export function getAutoInputSexes () {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        resolve([
            createSearchResult({code: "M",
                translatedDescription: {"it": "Maschio", "en": "Male"},
                icon: ICONS.MALE
            }),
            createSearchResult({code: "F",
                translatedDescription: {"it": "Femmina", "en": "Female"},
                icon: ICONS.FEMALE
            }),
        ])
    });
}

export function getAutoInputGenders () {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        resolve([
            createSearchResult({code: "CisMan",
                translatedDescription: {"it": "Uomo cis", "en": "cis Man"}
            }),
            createSearchResult({code: "CisWoman",
                translatedDescription: {"it": "Donna cis", "en": "cis Woman"}
            }),
            createSearchResult({code: "TransMan",
                translatedDescription: {"it": "Uomo trans", "en": "trans Man"}
            }),
            createSearchResult({code: "TransWoman",
                translatedDescription: {"it": "Donna trans", "en": "trans Woman"}
            }),
            createSearchResult({code: "Agender",
                translatedDescription: {"it": "Agender", "en": "Agender"}
            }),
            createSearchResult({code: "BiGender",
                translatedDescription: {"it": "Bigender", "en": "Bigender"}
            }),
            createSearchResult({code: "Genderfluid",
                translatedDescription: {"it": "Genderfluid", "en": "Genderfluid"}
            }),
            createSearchResult({code: "Questioning",
                translatedDescription: {"it": "Questioning", "en": "Questioning"}
            }),
            createSearchResult({code: "Queer",
                translatedDescription: {"it": "Queer", "en": "Queer"}
            }),
            createSearchResult({code: "NonBinary",
                translatedDescription: {"it": "Non binario", "en": "Non-binary"}
            }),
            createSearchResult({code: "DemiBoy",
                translatedDescription: {"it": "Demiboy", "en": "Demiboy"}
            }),
            createSearchResult({code: "DemiGirl",
                translatedDescription: {"it": "Demigirl", "en": "Demigirl"}
            }),
            createSearchResult({code: "Intersex",
                translatedDescription: {"it": "Intersex", "en": "Intersex"}
            }),
            createSearchResult({code: "NoAnswer",
                translatedDescription: {"it": "Preferisco non rispondere", "en": "I prefer not to say"}
            }),
            createSearchResult({code: "NotListed",
                translatedDescription: {"it": "Non in lista", "en": "Not in this list"}
            })
        ])
    });
}

export class AutoInputSexManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputSexes ().then (results => {
                resolve (filterLoaded(results, filter));
            });
        });
    }

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputSexes ().then (results => {
                resolve (
                    filterSearchResult(value, SearchType.RANKED, results, locale, filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> { return new Promise((resolve, reject) => resolve(true)); };
}

export class AutoInputGenderManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputGenders ().then (results => {
                resolve (filterLoaded(results, filter));
            });
        });
    }

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputGenders ().then (results => {
                resolve (
                    filterSearchResult(value, SearchType.RANKED, results, locale, filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> { return new Promise((resolve, reject) => resolve(true)); };
}