import { AutoInputFilter, AutoInputSearchResult, filterLoaded } from "../../components/autoInput";
import { FormApiAction, FormDTOBuilder } from "../../components/dataForm";
import { buildSearchParams } from "../../utils";
import { ApiAction, ApiErrorResponse, ApiResponse, runRequest } from "../global";
import { AutoInputRoomInviteManager, CompleteUserData, toSearchResult, UserData, UserPersonalInfo, UserSearchAction, UserSearchResponse } from "../user";

export interface MembershipCard {
    cardId: number,
    cardNo: string,
    idInYear: number,
    issueYear: number,
    userOwnerId: number,
    createdForOrderId: number,
    registered: true,
}

export interface UserCardData {
    membershipCard: MembershipCard
    userInfo: UserPersonalInfo,
    email: string,
    user: UserData,
    fromOrderCode: string,
    duplicate: boolean
}

export interface GetCardsApiResponse extends ApiResponse {
    cards: UserCardData[],
    canAddCards: boolean,
    usersAtCurrentEventWithoutCard: CompleteUserData[]
}

export class GetCardsApiAction implements ApiAction<GetCardsApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "membership/get-cards";
}

export interface ChangeCardRegisterStatusApiData {
    membershipCardId: number,
    registered: boolean
}

export class ChangeCardRegisterStatusApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "membership/set-membership-card-registration-status";
}

export class AutoInputUserAddCardManager extends AutoInputRoomInviteManager {
    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            runRequest (new UserSearchAction(), undefined, undefined, buildSearchParams({"name": value, "filter-no-membership-card-for-year": additionalValues[0]})).then (results => {
                const searchResult = results as UserSearchResponse;
                const users = searchResult.users.map(usr=>toSearchResult(usr));
                resolve (
                    filterLoaded(users, filter, filterOut)
                );
            });
        });
    }
}

export interface AddCardApiData {
    userId: number
}

export class AddCardDTOBuilder implements FormDTOBuilder<AddCardApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: AddCardApiData = {
            userId: parseInt(data.get('userId')!.toString ()),
        };
        return toReturn;
    }
}

export class AddCardFormAction implements FormApiAction<AddCardApiData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new AddCardDTOBuilder ();
    urlAction = "membership/add-card";
}