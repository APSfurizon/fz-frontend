import { ApiResponse, ApiErrorResponse, ApiRequest, ApiAction } from "../api/global"

/**
 * Describes which endpoint the be called, the type of body, type of response and type of error response
 * coming from a form
 */
export interface FormApiAction<T extends ApiRequest, U extends ApiResponse | Boolean, V extends ApiErrorResponse> extends ApiAction<U, V> {
    dtoBuilder: FormDTOBuilder<T>,
}

/**
 * Describes how to create the Data Transfer Object, describing which type will be creating,
 * mapping field names to its values
 */
export interface FormDTOBuilder<T> {
    mapToDTO: (data: FormData) => T
}