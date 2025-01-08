import { FormApiAction as FormApiAction } from "../components/dataForm"
import { API_BASE_URL, TOKEN_STORAGE_NAME } from "../constants";
import { getCookie } from "../utils";

export interface ApiRequest {}

export interface ApiResponse {
    status?: number,
    requestId?: string
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

export function isDetailedError (err: ApiErrorResponse | ApiDetailedErrorResponse) {
    return (err as ApiDetailedErrorResponse).errors !== undefined;
}

/**
 * Describes which endpoint the be called, the type of body, type of response and type of error response
 */
export interface ApiAction<U extends ApiResponse | Boolean, V extends ApiErrorResponse> {
    authenticated: boolean,
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    urlAction: string,
    onSuccess: (status: number, body?: U) => void,
    onFail: (status: number, body?: V) => void
}

export function getToken (): string | null {
    return getCookie(TOKEN_STORAGE_NAME);
}

export function runRequest (action: ApiAction<any, any>, pathParams?: string[], body?: ApiRequest, searchParams?: URLSearchParams): Promise<Boolean | ApiResponse | ApiErrorResponse> {
    return new Promise ((resolve, reject) => {
        // Calc headers
        const headers = new Headers({
            'Content-type': 'application/json',
        });

        const token = getToken ();

        if (action.authenticated && token && token.length > 0) {
            headers.append('Authorization', token);
        }
        
        // Calc url
        let useSearchParams = !!searchParams;
        const endpointUrl = `${API_BASE_URL}${[action.urlAction, ...pathParams ?? []].join("/")}${useSearchParams ? "?"+ (searchParams?.toString() ?? "") : ""}`
        fetch(endpointUrl, {method: action.method, body: body ? JSON.stringify(body) : null, headers: headers}).then((fulfilledData) => {
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
                        action.onFail && action.onFail(fulfilledData.status, data);
                        reject(data);
                        return;
                    }
                    // Try decode the error
                    fulfilledData.json().then((data: ApiDetailedErrorResponse) => {
                        data.status = fulfilledData.status;
                        action.onFail && action.onFail(fulfilledData.status, data);
                        reject(data);
                    });
                } catch (err) {
                    const errorBody = (""+err);
                    // Return a simple error response
                    const data: ApiErrorResponse = {
                        status: fulfilledData.status,
                        errorMessage: errorBody.length > 0 ? errorBody : undefined,
                        requestId: correlationId
                    }
                    action.onFail && action.onFail(fulfilledData.status, data);
                    reject(data);
                }
            } else {
                try {
                    if (!contentType || contentType.indexOf("application/json") < 0) {
                        const data: ApiResponse = {
                            status: fulfilledData.status,
                            requestId: correlationId
                        };
                        action.onSuccess (fulfilledData.status, data);
                        resolve (data);
                        return;
                    }
                    fulfilledData.json().then ((data) => {
                        action.onSuccess (fulfilledData.status, data);
                        resolve (data);
                    }).catch ((reason) => {
                        action.onFail && action.onFail(-1, reason);
                        reject (reason);
                    });
                } catch (e) {
                    action.onFail && action.onFail(-1, e);
                    reject (e);
                }
            }
        }).catch ((rejectedData) => {
            // If any network error occurs
            const data: ApiErrorResponse = {
                status: -1,
                errorMessage: ""+rejectedData,
                requestId: rejectedData?.response?.headers?.get('X-Correlation-Id')
            }
            action.onFail && action.onFail(-1, data);
            reject(data);
        });
    });
}

export function runFormRequest (action: FormApiAction<ApiRequest, ApiResponse, ApiErrorResponse>, pathParams?: string[], data?: FormData, searchParams?: URLSearchParams): Promise<Boolean | ApiResponse | ApiErrorResponse> {
    // Build the DTO if present
    let body: any = undefined;
    if (data){
        body = action.dtoBuilder.mapToDTO (data);
    }
    return runRequest(action, pathParams, body, searchParams);
}