import { AutoInputFilter, AutoInputSearchResult, filterLoaded } from "../../components/autoInput";
import { FormApiAction, FormDTOBuilder, getData } from "../../components/dataForm";
import { buildSearchParams, toError } from "../../utils";
import { runRequest } from "../networking/main";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../networking/types";
import {
  AutoInputRoomInviteManager,
  CompleteUserData,
  toSearchResult,
  UserData,
  UserPersonalInfo,
  UserSearchAction,
} from "../user";

export interface MembershipCard {
  cardId: number;
  cardNo: string | null;
  idInYear: number;
  issueYear: number;
  userOwnerId: number;
  createdForOrderId: number;
  registered: boolean;
  signedAt: string | null;
  sentByEmail: boolean;
}

export interface UserCardData {
  membershipCard?: MembershipCard;
  userInfo: UserPersonalInfo;
  email: string;
  user: UserData;
  fromOrderCode?: string;
  duplicate: boolean;
}

export interface GetCardsApiResponse extends ApiResponse {
  cards: UserCardData[];
  canAddCards: boolean;
  usersAtCurrentEventWithoutCard: CompleteUserData[];
}

export class GetCardsApiAction extends ApiAction<GetCardsApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "membership/get-cards";
}

export interface ChangeCardRegisterStatusApiData {
  membershipCardId: number;
  registered: boolean;
}

export class ChangeCardRegisterStatusApiAction extends ApiAction<boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "membership/set-membership-card-registration-status";
}

export class AutoInputUserAddCardManager extends AutoInputRoomInviteManager {
  searchByValues(
    value: string,
    locale?: string,
    filter?: AutoInputFilter,
    filterOut?: AutoInputFilter,
    additionalValues?: any
  ): Promise<AutoInputSearchResult[]> {
    return new Promise((resolve, reject) => {
      runRequest({
        action: new UserSearchAction(),
        searchParams: buildSearchParams({
          name: value,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          "filter-no-membership-card-for-year": additionalValues?.[0] as string,
        }),
      })
        .then((results) => {
          const users = results.users.map((usr) => toSearchResult(usr));
          resolve(filterLoaded(users, filter, filterOut));
        })
        .catch((e) => reject(toError(e)));
    });
  }
}

export interface AddCardApiData {
  userId: number;
}

export class AddCardDTOBuilder implements FormDTOBuilder<AddCardApiData> {
  mapToDTO = (data: FormData) => {
    const toReturn: AddCardApiData = {
      userId: parseInt(getData(data, "userId") ?? "0"),
    };
    return toReturn;
  };
}

export class AddCardFormAction extends FormApiAction<AddCardApiData, boolean, ApiErrorResponse> {
  method = RequestType.POST;
  authenticated = true;
  dtoBuilder = new AddCardDTOBuilder();
  urlAction = "membership/add-card";
}

export function convertCardlessUser(userData: CompleteUserData): UserCardData {
  return {
    duplicate: false,
    email: userData.email,
    user: userData.user.user,
    fromOrderCode: userData.user.orderCode,
    membershipCard: undefined,
    userInfo: userData.personalInfo,
  };
}
