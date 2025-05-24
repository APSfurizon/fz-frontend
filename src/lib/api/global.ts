import { FormApiAction } from "@/lib/components/dataForm"
import { API_BASE_URL, TOKEN_STORAGE_NAME } from "@/lib/constants";
import { getCookie } from "@/lib/utils";

export enum RequestType {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    PUT = "PUT"
}

export interface ApiRequest { }

export interface ApiResponse {
    status?: number,
    requestId?: string
}

export interface SimpleApiResponse extends ApiResponse {
    success: boolean
}

export interface ApiErrorResponse extends ApiResponse {
    errorMessage?: string,
}

export interface ApiDetailedErrorResponse extends ApiErrorResponse {
    errors: ApiErrorDetail[],
}

export interface ApiErrorDetail {
    message: string,
    code: string
}

export function isDetailedError(err: ApiErrorResponse | ApiDetailedErrorResponse) {
    return (err as ApiDetailedErrorResponse).errors !== undefined;
}

/**
 * Describes which endpoint the be called, the type of body, type of response and type of error response
 */
export abstract class ApiAction<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse> {
    abstract authenticated: boolean;
    abstract method: RequestType;
    abstract urlAction: string;
    rawResponse?: boolean;
    onSuccess?: (status: number, body?: U) => void;
    onFail?: (status: number, body?: V) => void;
}

export function getToken(): string | null {
    return `Bearer ${getCookie(TOKEN_STORAGE_NAME)}`;
}

export function runRequest<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse>(action: ApiAction<U, V>, pathParams?: string[], body?: ApiRequest | FormData, searchParams?: URLSearchParams): Promise<U> {
    return new Promise((resolve, reject) => {
        // Calc headers
        const headers = new Headers();

        if (body instanceof FormData == false) {
            headers.append('Content-type', 'application/json');
        }

        const token = getToken();

        if (action.authenticated && token && token.length > 0) {
            headers.append('Authorization', token);
        }

        // Calc url
        let useSearchParams = !!searchParams;
        const endpointUrl = `${API_BASE_URL}${[action.urlAction, ...pathParams ?? []].join("/")}${useSearchParams ? "?" + (searchParams?.toString() ?? "") : ""}`
        fetch(endpointUrl, { method: action.method, body: body ? body instanceof FormData ? body : JSON.stringify(body) : null, headers: headers }).then((fulfilledData) => {
            const contentType = fulfilledData.headers.get("content-type");
            const correlationId = fulfilledData.headers.get('X-Correlation-Id') ?? undefined;
            // In case of controlled fail
            if (!fulfilledData.ok) {
                try {
                    if (!contentType || contentType.indexOf("application/json") < 0) {
                        let data: ApiErrorResponse = {
                            status: fulfilledData.status,
                            errorMessage: "",
                            requestId: correlationId
                        };
                        action.onFail && action.onFail(fulfilledData.status, data as V);
                        reject(data);
                        return;
                    }
                    // Try decode the error
                    fulfilledData.json().then((data) => {
                        data.status = fulfilledData.status;
                        action.onFail && action.onFail(fulfilledData.status, data as V);
                        reject(data);
                    });
                } catch (err) {
                    const errorBody = ("" + err);
                    // Return a simple error response
                    const data: ApiErrorResponse = {
                        status: fulfilledData.status,
                        errorMessage: errorBody.length > 0 ? errorBody : undefined,
                        requestId: correlationId
                    }
                    action.onFail && action.onFail(fulfilledData.status, data as V);
                    reject(data);
                }
            } else {
                if (action.rawResponse) {
                    resolve(fulfilledData as U);
                    return;
                }
                try {
                    if (!contentType || contentType.indexOf("application/json") < 0) {
                        const data: ApiResponse = {
                            status: fulfilledData.status,
                            requestId: correlationId
                        };
                        action.onSuccess && action.onSuccess(fulfilledData.status, data as U);
                        resolve(data as U);
                        return;
                    }
                    fulfilledData.json().then((data) => {
                        action.onSuccess && action.onSuccess(fulfilledData.status, data);
                        resolve(data);
                    }).catch((reason) => {
                        action.onFail && action.onFail(-1, reason);
                        reject(reason);
                    });
                } catch (e) {
                    action.onFail && action.onFail(-1, e as V);
                    reject(e);
                }
            }
        }).catch((rejectedData) => {
            // If any network error occurs
            const data: ApiErrorResponse = {
                status: -1,
                errorMessage: "" + rejectedData,
                requestId: rejectedData?.response?.headers?.get('X-Correlation-Id')
            }
            action.onFail && action.onFail(-1, data as V);
            reject(data);
        });
    });
}

export function runFormRequest(action: FormApiAction<ApiRequest, ApiResponse, ApiErrorResponse>, pathParams?: string[], data?: FormData, searchParams?: URLSearchParams): Promise<boolean | ApiResponse | ApiErrorResponse> {
    // Build the DTO if present
    let body: any = undefined;
    if (data) {
        body = action.dtoBuilder.mapToDTO(data);
    }
    return runRequest(action, pathParams, body, searchParams);
}