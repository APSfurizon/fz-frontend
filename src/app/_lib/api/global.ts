import { FormAction } from "../components/dataForm"
import { API_BASE_URL } from "../constants";

export interface ApiRequest {}

export interface ApiResponse {
    status: number
}

export interface ApiErrorResponse extends Response {
    errors: ApiErrorDetail[],
    requestId: string
}

export interface ApiErrorDetail {
    message: string,
    code: string
}

export function runRequest (action: FormAction<ApiRequest, ApiResponse, ApiErrorResponse>, data?: FormData) {
    // Build the DTO if present
    let body: any = undefined;
    if (data){
        body = action.dtoBuilder.mapToDTO (data);
    }
    const headers = new Headers();
    if (action.authenticated) {
        headers.append('Authorization', '12837123h123h12kj3h1k23hkj123h');
    }
    fetch(`${API_BASE_URL}${action.urlAction}`, {method: action.method, body: body, headers: headers}).then((fulfilledData) => {
        let response: ApiResponse = { status: fulfilledData.status };
        fulfilledData.json().then ((data) => {
            action.onSuccess (fulfilledData.status, data);
        })
    }).catch ((rejectedData) => {
        rejectedData.json().then ((data: ApiErrorResponse) => {
            action.onFail (rejectedData.status, data);
        })
    });
}