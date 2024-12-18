import { ApiErrorResponse, ApiResponse, RequestAction, runRequest } from "../api/global";
import { SponsorType, UserData } from "../api/user";

export type HeaderData = {
    fursonaName?: string,
    propicPath?: string,
    loggedIn: boolean,
    error: boolean,
    sponsorType: SponsorType
}

export const EMPTY_HEADER_DATA: HeaderData = {
    error: false,
    loggedIn: false,
    fursonaName: undefined,
    propicPath: undefined,
    sponsorType: SponsorType.NONE
};

export interface HeaderApiResponse extends UserData, ApiResponse {}

export class HeaderApiAction implements RequestAction<HeaderApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/me/display";
    onSuccess: (status: number, body?: HeaderApiResponse) => void = (status: number, body?: HeaderApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export function getHeaderUserData (): Promise<HeaderData> {
    return new Promise<HeaderData> ((resolve, reject) => {
        runRequest(new HeaderApiAction(), undefined, undefined).then ((response) => {
            const data = response as HeaderApiResponse;
            const toReturn: HeaderData = {
                fursonaName: data.fursonaName,
                propicPath: data.propicUrl,
                error: false,
                loggedIn: true,
                sponsorType: data.sponsorship ?? SponsorType.NONE
            }
            resolve(toReturn);
        }).catch ((err) => {
            resolve(EMPTY_HEADER_DATA);
        });
    })
}