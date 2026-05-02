import { FormApiAction } from "@/lib/components/dataForm"
import {
    ADMIN_TOKEN_STORAGE_NAME,
    API_BASE_URL,
    API_MOBILE_URL,
    MOBILE_FURIZON_AUTH_HEADER,
    TOKEN_STORAGE_NAME
} from "@/lib/constants";
import { getCookie, templateReplace } from "@/lib/utils";

export enum RequestType {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    PUT = "PUT"
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiRequest { }

export interface ApiResponse {
    status?: number;
    requestId?: string;
}

export interface SimpleApiResponse extends ApiResponse {
    success: boolean;
}

export interface ApiErrorResponse extends ApiResponse {
    errorMessage?: string;
}

export interface ApiDetailedErrorResponse extends ApiErrorResponse {
    errors: ApiErrorDetail[];
}

export interface ApiErrorDetail {
    message: string;
    code: string;
}

export interface ApiMessageResponse extends ApiResponse {
    message: string;
}

export function isDetailedError(err: ApiErrorResponse | ApiDetailedErrorResponse) {
    return (err as ApiDetailedErrorResponse).errors !== undefined;
}

export enum Endpoint {
    API,
    MOBILE
};

/**
 * Describes which endpoint the be called, the type of body, type of response and type of error response
 */
export abstract class ApiAction<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse> {
    endpoint: Endpoint = Endpoint.API;
    abstract authenticated: boolean;
    abstract method: RequestType;
    abstract urlAction: string;
    hasPathParams?: boolean;
    rawResponse?: boolean;
    onSuccess?: (status: number, body?: U) => void;
    onFail?: (status: number, body?: V) => void;
}

/**
 * Describes an api endpoint to the mobile app server
 */
export abstract class MobileApiAction<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse> extends ApiAction<U, V> {
    readonly authenticated: boolean = false;
    readonly endpoint = Endpoint.MOBILE;
}

export function getToken(): string | null {
    return `Bearer ${getCookie(TOKEN_STORAGE_NAME)}`;
}

export type RequestData<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse> = {
    action: ApiAction<U, V>;
    additionalPath?: string[];
    body?: ApiRequest | FormData;
    searchParams?: URLSearchParams;
    pathParams?: Record<string, any>;
}

export function runRequest<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse>
    (data: RequestData<U, V>): Promise<U> {
    return new Promise((resolve, reject) => {
        // Calc headers
        const headers = new Headers();

        if (data.body instanceof FormData == false) headers.append("Content-type", "application/json");

        const token = getToken();
        const adminToken = getCookie(ADMIN_TOKEN_STORAGE_NAME);

        headers.append("Accept-Language", getCookie("NEXT_LOCALE"));

        if (data.action.authenticated && token && token.length > 0) headers.append("Authorization", token);

        // Mobile backend headers:
        // - furizonauth: shared secret from env
        // - furizon_admin: user token from secondary login
        if (data.action.endpoint === Endpoint.MOBILE) {
            if (MOBILE_FURIZON_AUTH_HEADER.length > 0) {
                headers.append("furizonauth", MOBILE_FURIZON_AUTH_HEADER);
            }
            if (adminToken && adminToken.length > 0) {
                headers.append("furizon_admin", adminToken);
            }
        }

        // Calc url
        const useSearchParams = !!data.searchParams;
        let endpointUrl = {
            [Endpoint.API]: API_BASE_URL,
            [Endpoint.MOBILE]: API_MOBILE_URL ?? ""
        }[data.action.endpoint];
        endpointUrl += [data.action.urlAction, ...data.additionalPath ?? []].join("/");
        if (useSearchParams) endpointUrl += "?" + data.searchParams!.toString();
        if (data.action.hasPathParams && data.pathParams) {
            endpointUrl = templateReplace(endpointUrl, data.pathParams);
        }
        const fetchOptions: RequestInit = {
            method: data.action.method,
            body: data.body ? data.body instanceof FormData ? data.body : JSON.stringify(data.body) : null,
            headers: headers,
            cache: "no-store"
        }

        // Execute fetch
        fetch(endpointUrl, fetchOptions).then((fulfilledData) => {
            const contentType = fulfilledData.headers.get("content-type");
            const correlationId = fulfilledData.headers.get('X-Correlation-Id') ?? undefined;
            // In case of controlled fail
            if (!fulfilledData.ok) {
                try {
                    if (!contentType || contentType.indexOf("application/json") < 0) {
                        const errorData: ApiErrorResponse = {
                            status: fulfilledData.status,
                            errorMessage: "",
                            requestId: correlationId
                        };
                        if (data.action.onFail) data.action.onFail(fulfilledData.status, errorData as V);
                        reject(errorData);
                        return;
                    }
                    // Try decode the error
                    fulfilledData.json().then((rawData) => {
                        rawData.status = fulfilledData.status;
                        if (data.action.onFail) data.action.onFail(fulfilledData.status, rawData as V);
                        reject(rawData);
                    });
                } catch (err) {
                    const errorBody = ("" + err);
                    // Return a simple error response
                    const errorData: ApiErrorResponse = {
                        status: fulfilledData.status,
                        errorMessage: errorBody.length > 0 ? errorBody : undefined,
                        requestId: correlationId
                    }
                    if (data.action.onFail) data.action.onFail(fulfilledData.status, errorData as V);
                    reject(errorData);
                }
            } else {
                if (data.action.rawResponse) {
                    resolve(fulfilledData as U);
                    return;
                }
                try {
                    if (!contentType || contentType.indexOf("application/json") < 0) {
                        const responseData: ApiResponse = {
                            status: fulfilledData.status,
                            requestId: correlationId
                        };
                        if (data.action.onSuccess) data.action.onSuccess(fulfilledData.status, responseData as U);
                        resolve(responseData as U);
                        return;
                    }
                    fulfilledData.json().then((jsonData) => {
                        if (data.action.onSuccess) data.action.onSuccess(fulfilledData.status, jsonData);
                        resolve(jsonData);
                    }).catch((reason) => {
                        if (data.action.onFail) data.action.onFail(-1, reason);
                        reject(reason);
                    });
                } catch (e) {
                    if (data.action.onFail) data.action.onFail(-1, e as V);
                    reject(e);
                }
            }
        }).catch((rejectedData) => {
            // If any network error occurs
            const errorData: ApiErrorResponse = {
                status: -1,
                errorMessage: "" + rejectedData,
                requestId: rejectedData?.response?.headers?.get('X-Correlation-Id')
            }
            if (data.action.onFail) data.action.onFail(-1, errorData as V);
            reject(errorData);
        });
    });
}

export type FormRequestData<
    T extends ApiRequest,
    U extends ApiResponse | boolean,
    V extends ApiErrorResponse
> = {
    action: FormApiAction<T, U, V>;
    additionalPath?: string[];
    body: FormData;
    searchParams?: URLSearchParams;
    pathParams?: Record<string, any>;
}

export function runFormRequest<
    T extends ApiRequest,
    U extends ApiResponse | boolean,
    V extends ApiErrorResponse
>(data: FormRequestData<T, U, V>): Promise<U> {
    // Build the DTO if present
    let body: any = undefined;
    if (data) {
        body = data.action.dtoBuilder.mapToDTO(data.body);
    }
    return runRequest({
        body,
        action: data.action,
        pathParams: data.pathParams,
        additionalPath: data.additionalPath,
        searchParams: data.searchParams
    });
}