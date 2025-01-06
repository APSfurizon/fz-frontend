import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";
import { UserData, UserPersonalInfo } from "../user";

export interface MembershipCard {
    cardId: number,
    idInYear: number,
    issueYear: number,
    userOwnerId: number,
    createdForOrderId: number,
    registered: true
}

export interface UserCardData {
    membershipCard: MembershipCard
    userInfo: UserPersonalInfo,
    user: UserData
}

export interface GetCardsApiResponse extends ApiResponse {
    response: UserCardData[],
    canAddCards: boolean
}

export class GetCardsApiAction implements ApiAction<GetCardsApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "membership/get-cards";
    onSuccess: (status: number, body?: GetCardsApiResponse) => void = (status: number, body?: GetCardsApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface ChangeCardRegisterStatusApiData {
    membershipCardId: number,
    registered: boolean
}

export class ChangeCardRegisterStatusApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "membership/set-membership-card-registration-status";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}