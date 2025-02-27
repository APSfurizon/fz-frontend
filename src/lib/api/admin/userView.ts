import { OrderData } from "../booking";
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
    orders: OrderData[]
}

/**
 * Uses path param: users/view/id
 */
export class GetUserAdminViewAction implements ApiAction<GetUserAdminViewResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "users/view";
}

export interface UserIdRequestData {
    userId: number,
}

export class BanUserAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "authentication/ban";
}


export class UnbanUserAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "authentication/unban";
}