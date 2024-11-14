import { ApiResponse, ApiErrorResponse, ApiRequest } from "../api/global"

/**
 * Describes which endpoint the be called, the type of body, type of response and type of error response
 */
export interface FormAction<T extends ApiRequest, U extends ApiResponse, V extends ApiErrorResponse> {
    authenticated: boolean,
    dtoBuilder: FormDTOBuilder<T>,
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    urlAction: string,
    onSuccess: (status: number, body?: U) => void,
    onFail: (status: number, body?: V) => void
}

/**
 * Describes how to create the Data Transfer Object, describing which type will be creating,
 * mapping field names to its values
 */
export interface FormDTOBuilder<T> {
    mapToDTO: (data: FormData) => T
}