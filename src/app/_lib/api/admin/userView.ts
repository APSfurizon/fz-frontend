import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";
import { UserData, UserPersonalInfo } from "../user";

export interface UserAdminViewData {
    user: UserData,
    email: string,
    personalInfo: UserPersonalInfo,
    banned: boolean
}

export interface GetUserAdminViewResponse extends ApiResponse {
    user: UserAdminViewData,
    orders: Record<number, any>
}

/**
 * Uses path param: users/view/id
 */
export class GetUserAdminViewAction implements ApiAction<GetUserAdminViewResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/view";
    onSuccess: (status: number, body?: GetUserAdminViewResponse) => void = (status: number, body?: GetUserAdminViewResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface UserIdRequestData {
    userId: number,
}

export class BanUserAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "authentication/ban";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}


export class UnbanUserAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "authentication/unban";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}