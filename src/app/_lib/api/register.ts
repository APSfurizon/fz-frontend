import { CachedCountries, CachedStates } from "../cache/cache";
import { AutoInputSearchResult, CountrySearchResult } from "../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { getFlagEmoji } from "../components/userPicture";
import { TOKEN_STORAGE_NAME } from "../constants";
import { nullifyEmptyString, nullifyEmptyStrings } from "../utils";
import { ApiErrorResponse, ApiResponse, RequestAction, runRequest } from "./global";

/*****************************/
/*         Entities          */
/*****************************/

export interface RegisterPersonalInfo {
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
}

export interface RegisterData {
    email?: string;
    password?: string;
    fursonaName?: string;
    personalUserInformation?: RegisterPersonalInfo;
}

export interface RegisterResponse extends ApiResponse {
    success: boolean
}

export class RegisterDTOBuilder implements FormDTOBuilder<RegisterData> {
    mapToDTO = (data: FormData) => {
        let personalUserInformation: RegisterPersonalInfo = {
            firstName:          nullifyEmptyString(data.get('firstName')?.toString ()),
            lastName:           nullifyEmptyString(data.get('lastName')?.toString ()),
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
    onSuccess: (status: number, body?: RegisterResponse) => void = (status: number, body?: RegisterResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

/**Either a country or a region */
export interface Place {
    name: string,
    code: string,
    phonePrefix: string,
}

export interface PlaceApiResponse extends ApiResponse {
    data: Place[]
}

export class AutoInputCountriesApiAction implements RequestAction<PlaceApiResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "states/get-countries";
    onSuccess: (status: number, body?: PlaceApiResponse) => void = (status: number, body?: PlaceApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export class AutoInputStatesApiAction implements RequestAction<PlaceApiResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "states/by-country";
    onSuccess: (status: number, body?: PlaceApiResponse) => void = (status: number, body?: PlaceApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

const CACHED_COUNTRIES = new CachedCountries();
const CACHED_STATES = new CachedStates();


export function getAutoInputCountries (showNumber?: boolean): Promise<CountrySearchResult[]> {
    return new Promise<CountrySearchResult[]> ((resolve, reject) => {
        CACHED_COUNTRIES.get().then ((data) => {
            const parsed = data as PlaceApiResponse;
            resolve (parsed.data.map ((place, index) => {
                const toReturn: CountrySearchResult = {
                    id: index,
                    code: place.code,
                    description: `${place.name}${showNumber ? ` (${place.phonePrefix})` : ""}`,
                    icon: getFlagEmoji(place.code),
                    phonePrefix: place.phonePrefix
                };
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
                const toReturn: AutoInputSearchResult = {
                    id: index,
                    code: place.code,
                    description: place.name
                };
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}