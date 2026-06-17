import {
  MOBILE_ADMIN_TOKEN_STORAGE_NAME,
  MOBILE_FURIZON_AUTH_HEADER,
  API_BASE_URL,
  API_MOBILE_URL,
} from "@/lib/constants";
import { getCookie, templateReplace } from "@/lib/utils";
import {
  ApiResponse,
  ApiErrorResponse,
  RequestData,
  Endpoint,
  ApiRequest,
  FormRequestData,
  createApiErrorResponse,
} from "./types";
import { getToken } from "./utils";

export function runRequest<U extends ApiResponse | boolean | Response, V extends ApiErrorResponse>(
  data: RequestData<U, V>
): Promise<U> {
  return new Promise((resolve, reject) => {
    // Calc headers
    const headers = new Headers();

    if (data.body instanceof FormData == false) headers.append("Content-type", "application/json");

    const token = getToken();
    const adminToken = getCookie(MOBILE_ADMIN_TOKEN_STORAGE_NAME);

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
      [Endpoint.MOBILE]: API_MOBILE_URL ?? "",
    }[data.action.endpoint];
    endpointUrl += [data.action.urlAction, ...(data.additionalPath ?? [])].join("/");
    if (useSearchParams) endpointUrl += "?" + data.searchParams!.toString();
    if (data.action.hasPathParams && data.pathParams) {
      endpointUrl = templateReplace(endpointUrl, data.pathParams);
    }
    const fetchOptions: RequestInit = {
      method: data.action.method,
      body: data.body ? (data.body instanceof FormData ? data.body : JSON.stringify(data.body)) : null,
      headers: headers,
    };

    // Execute fetch
    fetch(endpointUrl, fetchOptions)
      .then((fulfilledData) => {
        const contentType = fulfilledData.headers.get("content-type");
        const correlationId = fulfilledData.headers.get("X-Correlation-Id") ?? "";
        // In case of controlled fail
        if (!fulfilledData.ok) {
          // Return unknown error if no json error
          if (!contentType || contentType.indexOf("application/json") < 0) {
            const errorData = createApiErrorResponse({
              status: fulfilledData.status,
              errors: [
                {
                  code: "UNKNOWN",
                  message: "Unknown error",
                },
              ],
              requestId: correlationId,
            });
            reject(errorData);
            return;
          }
          // Try decode the error
          fulfilledData
            .json()
            .then((rawData) => {
              const errorData = rawData as V;
              errorData.status = fulfilledData.status;
              reject(errorData);
            })
            .catch(() => {
              // If error decoding fails
              reject(
                createApiErrorResponse({
                  requestId: correlationId,
                  status: fulfilledData.status,
                  errors: [
                    {
                      code: "PARSE_ERROR",
                      message: "Could not interpret error data",
                    },
                  ],
                })
              );
            });
        } else {
          if (data.action.rawResponse) {
            resolve(fulfilledData as U);
            return;
          }
          if (!contentType || contentType.indexOf("application/json") < 0) {
            const responseData: ApiResponse = {
              status: fulfilledData.status,
              requestId: correlationId,
            };
            resolve(responseData as U);
            return;
          }
          fulfilledData
            .json()
            .then((jsonData) => {
              resolve(jsonData as U);
            })
            .catch((reason) => {
              // If error decoding fails
              reject(
                createApiErrorResponse({
                  requestId: correlationId,
                  status: fulfilledData.status,
                  errors: [
                    {
                      code: "PARSE_ERROR",
                      message: (reason as string) ?? "Could not interpret data",
                    },
                  ],
                })
              );
            });
        }
      })
      .catch((rejectedData) => {
        // If any network error occurs
        let errorName = (rejectedData as object).constructor?.name ?? "UNKNOWN_ERROR";
        let errorMessage = "Unknown error has occurred";
        if (rejectedData instanceof Error) {
          errorName = rejectedData.name;
          errorMessage = rejectedData.message;
        }
        reject(
          createApiErrorResponse({
            status: 0,
            requestId: "",
            errors: [
              {
                code: errorName,
                message: errorMessage,
              },
            ],
          })
        );
      });
  });
}
export function runFormRequest<T extends ApiRequest, U extends ApiResponse | boolean, V extends ApiErrorResponse>(
  data: FormRequestData<T, U, V>
): Promise<U> {
  // Build the DTO if present
  let body: T | undefined = undefined;
  if (data) {
    const parsedBody = data.action.dtoBuilder.mapToDTO(data.body);
    body = data.bodyModification ? data.bodyModification(parsedBody) : parsedBody;
  }
  return runRequest({
    body,
    action: data.action,
    pathParams: data.pathParams,
    additionalPath: data.additionalPath,
    searchParams: data.searchParams,
  });
}
