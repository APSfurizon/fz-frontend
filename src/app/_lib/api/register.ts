import { AutoInputSearchResult } from "../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { getFlagEmoji } from "../components/userPicture";
import { TOKEN_STORAGE_NAME } from "../constants";
import { ApiErrorResponse, ApiResponse, RequestAction, runRequest } from "./global";

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
            firstName: data.get('firstName')?.toString (),
            lastName: data.get('lastName')?.toString (),
            fiscalCode: data.get('fiscalCode')?.toString (),
            birthCity: data.get('birthCity')?.toString (),
            birthRegion: data.get('birthRegion')?.toString (),
            birthCountry: data.get('birthCountry')?.toString (),
            birthday: data.get('birthday')?.toString (),
            residenceAddress: data.get('residenceAddress')?.toString (),
            residenceZipCode: data.get('residenceZipCode')?.toString (),
            residenceCity: data.get('residenceCity')?.toString (),
            residenceRegion: data.get('residenceRegion')?.toString (),
            residenceCountry: data.get('residenceCountry')?.toString (),
            phoneNumber: data.get('phoneNumber')?.toString ()
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
    code: string
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

export function getAutoInputCountries (): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        runRequest(new AutoInputCountriesApiAction (), undefined, undefined).then ((data) => {
            const parsed = data as PlaceApiResponse;
            resolve (parsed.data.map ((place, index) => {
                const toReturn: AutoInputSearchResult = {
                    id: index,
                    code: place.code,
                    description: place.name,
                    icon: getFlagEmoji(place.code)
                };
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}

export function getAutoInputStates (countryCode?: string): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        runRequest(new AutoInputStatesApiAction (), undefined, {"code": countryCode ?? ""}).then ((data) => {
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