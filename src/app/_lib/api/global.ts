import { FormApiAction as FormApiAction } from "../components/dataForm"
import { API_BASE_URL, TOKEN_STORAGE_NAME } from "../constants";

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
export interface RequestAction<U extends ApiResponse, V extends ApiErrorResponse> {
    authenticated: boolean,
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    urlAction: string,
    onSuccess: (status: number, body?: U) => void,
    onFail: (status: number, body?: V) => void
}

export function getToken (): string | null {
    return localStorage.getItem(TOKEN_STORAGE_NAME);
}

export function runRequest (action: RequestAction<ApiResponse, ApiErrorResponse>, body?: ApiRequest, searchParams?: Record<string, string>): Promise<ApiResponse | ApiErrorResponse> {
    return new Promise ((resolve, reject) => {
        // Calc headers
        const headers = new Headers({
            'Content-type': 'application/json',
            'Authorization': action.authenticated ? getToken () ?? '' : ''
        });
        // Calc url
        let useSearchParams = searchParams && Object.keys (searchParams).length > 0;
        const endpointUrl = `${API_BASE_URL}${action.urlAction}${useSearchParams ? "?"+new URLSearchParams(searchParams).toString() : ""}`
        fetch(endpointUrl, {method: action.method, body: body ? JSON.stringify(body) : null, headers: headers}).then((fulfilledData) => {
            // In case of controlled fail
            if (!fulfilledData.ok) {
                try {
                    // Try decode the error
                    fulfilledData.json().then((data: ApiDetailedErrorResponse) => {
                        data.status = fulfilledData.status;
                        action.onFail && action.onFail(fulfilledData.status, data);
                        reject(data);
                    });
                } catch (err) {
                    // Return a simple error response
                    const data: ApiErrorResponse = {
                        status: fulfilledData.status,
                        errorMessage: ""+err,
                        requestId: fulfilledData.headers.get('X-Correlation-Id') ?? undefined
                    }
                    action.onFail && action.onFail(fulfilledData.status, data);
                    reject(data);
                }
            } else {
                fulfilledData.json().then ((data) => {
                    action.onSuccess (fulfilledData.status, data);
                    resolve (data);
                }).catch ((reason) => {
                    reject (reason);
                });
            }
        }).catch ((rejectedData) => {
            // If any network error occurs
            const data: ApiErrorResponse = {
                status: -1,
                errorMessage: ""+rejectedData,
                requestId: undefined
            }
            action.onFail && action.onFail(-1, data);
            reject(data);
        });
    });
}

export function runFormRequest (action: FormApiAction<ApiRequest, ApiResponse, ApiErrorResponse>, data?: FormData, searchParams?: Record<string, string>): Promise<ApiResponse | ApiErrorResponse> {
    // Build the DTO if present
    let body: any = undefined;
    if (data){
        body = action.dtoBuilder.mapToDTO (data);
    }
    return runRequest(action, body, searchParams);
}