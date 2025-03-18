import { CachedCountries, CachedPermissions, CachedStates } from "../../cache/cache";
import { AutoInputSearchResult, CountrySearchResult } from "../../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { getFlagEmoji } from "../../components/userPicture";
import { nullifyEmptyString } from "../../utils";
import { GetPermissionsResponse } from "../admin/role";
import { ApiErrorResponse, ApiResponse, ApiAction } from "../global";
import { UserPersonalInfo } from "../user";

/*****************************/
/*         Entities          */
/*****************************/

export interface RegisterData {
    email?: string;
    password?: string;
    fursonaName?: string;
    personalUserInformation?: UserPersonalInfo;
}

export interface RegisterResponse extends ApiResponse {
    success: boolean
}

export class RegisterDTOBuilder implements FormDTOBuilder<RegisterData> {
    mapToDTO = (data: FormData) => {
        let personalUserInformation: UserPersonalInfo = {
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
            phoneNumber:        nullifyEmptyString(data.get('phoneNumber')?.toString ())
        };

        let toReturn: RegisterData = {
            email: data.get('email')?.toString (),
            password: data.get('password')?.toString (),
            fursonaName: data.get('fursonaName')?.toString(),
            personalUserInformation: personalUserInformation
        };
        return toReturn;
    }
}

export class RegisterFormAction implements FormApiAction<RegisterData, RegisterResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = false;
    dtoBuilder = new RegisterDTOBuilder ();
    urlAction = "authentication/register";
}

/**Either a country or a region */
export interface Place {
    name: string,
    code: string,
    phonePrefix: string,
    translatedDescription: Record<string, string>
}

export interface PlaceApiResponse extends ApiResponse {
    data: Place[]
}

export class AutoInputCountriesApiAction implements ApiAction<PlaceApiResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "states/get-countries";
}

export class AutoInputStatesApiAction implements ApiAction<PlaceApiResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "states/by-country";
}

const CACHED_COUNTRIES = new CachedCountries();
const CACHED_STATES = new CachedStates();
const CACHED_PERMISSIONS = new CachedPermissions();


export function getAutoInputCountries (showNumber?: boolean): Promise<CountrySearchResult[]> {
    return new Promise<CountrySearchResult[]> ((resolve, reject) => {
        CACHED_COUNTRIES.get().then ((data) => {
            const parsed = data as PlaceApiResponse;
            resolve (parsed.data.map ((place, index) => {
                const toReturn = new CountrySearchResult();
                toReturn.showPhoneNumber = showNumber;
                toReturn.id = index;
                toReturn.code = place.code;
                toReturn.description = `${place.name}${showNumber ? ` (${place.phonePrefix})` : ""}`;
                toReturn.icon = getFlagEmoji(place.code);
                toReturn.phonePrefix = place.phonePrefix;
                toReturn.translatedDescription = place.translatedDescription;
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}

export function getAutoInputStates (countryCode?: string): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        CACHED_STATES.get (countryCode).then ((data) => {
            const parsed = data as PlaceApiResponse;
            resolve (parsed.data.map ((place, index) => {
                const toReturn = new AutoInputSearchResult();
                toReturn.id = index;
                toReturn.code = place.code;
                toReturn.description = place.name;
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}

export function getAutoInputPermissions (): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        CACHED_PERMISSIONS.get ().then ((data) => {
            const parsed = data as GetPermissionsResponse;
            resolve (parsed.permissions.map ((permission, index) => {
                const toReturn = new AutoInputSearchResult();
                toReturn.id = index;
                toReturn.code = permission;
                toReturn.description = permission;
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}