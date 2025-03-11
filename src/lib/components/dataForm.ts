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

export class DummyDTOBuilder implements FormDTOBuilder<any>{
    mapToDTO = (data: FormData) => {return {}}
}

export class DummyFormAction implements FormApiAction<any, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET"
    authenticated = true;
    dtoBuilder = new DummyDTOBuilder ();
    urlAction = "";
}
