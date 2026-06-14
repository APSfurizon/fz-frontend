import { FormApiAction } from "@/lib/components/dataForm";

export enum RequestType {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
  PUT = "PUT",
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiRequest {}

export interface ApiResponse {
  status?: number;
  requestId?: string;
}

export interface SimpleApiResponse extends ApiResponse {
  success: boolean;
}

export interface ApiMessageResponse extends ApiResponse {
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse extends ApiResponse, Error {
  errors: ApiError[];
}

export enum Endpoint {
  API,
  MOBILE,
} /**
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

export abstract class MobileApiAction<
  U extends ApiResponse | boolean | Response,
  V extends ApiErrorResponse,
> extends ApiAction<U, V> {
  readonly authenticated: boolean = false;
  readonly endpoint = Endpoint.MOBILE;
}
export type RequestData<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse> = {
  action: ApiAction<U, V>;
  additionalPath?: string[];
  body?: ApiRequest | FormData;
  searchParams?: URLSearchParams;
  pathParams?: Record<string, any>;
};

export type FormRequestData<T extends ApiRequest, U extends ApiResponse | boolean, V extends ApiErrorResponse> = {
  action: FormApiAction<T, U, V>;
  additionalPath?: string[];
  body: FormData;
  bodyModification?: (data: T) => T;
  searchParams?: URLSearchParams;
  pathParams?: Record<string, any>;
};
