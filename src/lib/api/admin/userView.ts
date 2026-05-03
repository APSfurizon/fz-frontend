import {
    AutoInputFilter,
    AutoInputManager,
    AutoInputSearchResult,
    filterLoaded,
    filterSearchResult,
    SearchType
} from "@/lib/components/autoInput";
import { BadgeStatusApiResponse } from "../badge/badge";
import { Board, SponsorshipType } from "../booking";
import { ConventionEvent } from "../counts";
import { ExchangeStatusApiResponse } from "../exchange";
import { ApiAction, ApiErrorResponse, ApiRequest, ApiResponse, RequestType, runRequest } from "../global";
import { OrderStatus } from "../order";
import { Permissions } from "../permission";
import { RoomInfoResponse } from "../room";
import { ExtraDays, UserData, UserPersonalInfo } from "../user";
import { MembershipCard } from "./membershipManager";
import { buildSearchParams } from "@/lib/utils";
import { GetRoleByIdApiAction, GetAllRolesApiAction, SearchRoleApiAction, RoleBaseData } from "./role";
import { FormApiAction, FormDTOBuilder, getData } from "@/lib/components/dataForm";

export interface FullOrder {
    code: string,
    orderStatus: OrderStatus,
    sponsorship: SponsorshipType,
    extraDays: ExtraDays,
    dailyDays: string[],
    pretixRoomItemId: number,
    roomCapacity: number,
    hotelInternalName: string,
    roomInternalName: string,
    pretixOrderSecret: string,
    checkinSecret: string,
    hasMembership: boolean,
    ticketPositionId: number,
    ticketPositionPosid: number,
    roomPositionId: number,
    roomPositionPosid: number,
    earlyPositionId: number,
    latePositionId: number,
    extraFursuits: number,
    buyerEmail: string,
    buyerPhone: string,
    buyerUser: string
    buyerLocale: string,
    requiresAttention: boolean,
    internalComment: string,
    checkinText: string,
    orderSerialInEvent: number,
    orderOwnerUserId: number,
    orderOwner: any,
    userFinder: any,
    eventId: number,
    orderEvent: ConventionEvent,
    eventFinder: any,
    id: number,
    dailyDaysBitmask: number,
    daily: boolean,
    dailyDaysDates: string[],
    membership: boolean,
    board: Board,
}

export type UserViewRoles = {
    roleId: number,
    displayName: string,
    internalName: string,
    roleAdmincountPriority: number,
    showInNosecount: boolean
};

export interface GetUserAdminViewResponse extends ApiResponse {
    personalInfo: UserPersonalInfo,
    membershipCards: MembershipCard[],
    email: string,
    banned: boolean,
    orders: FullOrder[]
    currentRoomdata?: RoomInfoResponse,
    exchanges: ExchangeStatusApiResponse,
    otherRooms: RoomInfoResponse[],
    showInNousecount: boolean,
    badgeData: BadgeStatusApiResponse,
    roles: UserViewRoles[],
    permissions: Permissions[]
}

export interface GetUserSecurityViewResponse extends ApiResponse {
    firstName: string | null,
    lastName: string | null,
    sex: string | null,
    gender: string | null,
    birthday: string | null,
    phoneNumber: string | null,
    prefixPhoneNumber: string | null,
    allergies: string | null,
    telegramUsername: string | null,
    currentMembershipCard: MembershipCard | null,
    email: string | null,
    currentOrder: SecurityOrder | null,
    currentRoomdata?: RoomInfoResponse,
    badgeData: BadgeStatusApiResponse,
    roles: UserViewRoles[],
    sponsorNames: SecuritySponsorEntry[]
}

export interface SecurityOrder {
    code: string,
    orderStatus: OrderStatus,
    sponsorship: SponsorshipType,
    dailyDaysDates: string[],
    board: string,
    dailyDays: string[],
    pretixRoomItemId: number,
    roomCapacity: number,
    hotelInternalName: string,
    roomInternalName: string,
    orderSerialInEvent: number,
    id: number,
    daily: boolean,
}

export interface SecuritySponsorEntry {
    eventId: number,
    sponsorNames: { sponsors: { sponsor: string; sponsorNames: Record<string, string> }[] },
}

/**
 * Uses path param: users/view/id
 */
export class GetUserAdminViewAction extends ApiAction<GetUserAdminViewResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    hasPathParams = true;
    urlAction = "users/view/{id}";
}

/**
 * Uses path param: users/security/view/{id}
 */
export class GetUserSecurityViewAction extends ApiAction<GetUserSecurityViewResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    hasPathParams = true;
    urlAction = "users/security/view/{id}";
}

export interface UserIdRequestData {
    userId: number,
}

export class BanUserAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/ban";
}


export class UnbanUserAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/unban";
}

export interface ViewOrderLinkResponse extends ApiResponse {
    link: string
}

export class ViewOrderLinkApiAction extends ApiAction<ViewOrderLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "orders-workflow/generate-pretix-control-order-link";
}

export interface ShowInNosecountApiInput {
    userId: number,
    showInNosecount: boolean
}

export class ShowInNosecountApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "users/show-in-nosecount";
}

export interface AddUserToRoleApiData extends ApiRequest {
    userId: number,
    tempRole: boolean
}

export class AddUserToRoleFormApiAction extends FormApiAction<AddUserToRoleApiData, boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    hasPathParams = true;
    urlAction = "roles/{id}/add-user";
    dtoBuilder: FormDTOBuilder<AddUserToRoleApiData> = {
        mapToDTO(data) {
            const toReturn: AddUserToRoleApiData = {
                userId: parseInt(getData(data, "userId") ?? "0"),
                tempRole: getData(data, "tempRole") === "true"
            };
            return toReturn;
        },
    };
}

export class RemoveUserFromRoleApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    hasPathParams = true;
    urlAction = "roles/{id}/remove-user";
}

// 1 char
export class AutoInputRolesManager implements AutoInputManager {
    codeOnly: boolean = false;

    loadByIds(filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            runRequest({
                action: new GetRoleByIdApiAction(),
                pathParams: { "id": filter.filteredIds.at(0) }
            }).then(result => {
                const roles = [result].map(role => this.toSearchResult(role));
                resolve(filterLoaded(roles, filter));
            });
        });
    }

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve) => {
            runRequest({
                action: new SearchRoleApiAction(),
                searchParams: buildSearchParams({ "query": value })
            }).then(results => {
                const roles = results.roles?.map(usr => this.toSearchResult(usr));
                resolve(
                    filterLoaded(roles, filter, filterOut)
                );
            });
        });
    }

    isPresent(): Promise<boolean> {
        return runRequest({
            action: new GetAllRolesApiAction()
        }).then(result => !!result.roles?.length)
    };

    toSearchResult(data: RoleBaseData) {
        const toReturn = new AutoInputSearchResult();
        toReturn.id = data.roleId;
        toReturn.code = data.internalName;
        toReturn.icon = "GROUPS";
        toReturn.description = data.displayName;
        return toReturn;
    }
}

export class AutoInputCustomUserManager implements AutoInputManager {
    private users: AutoInputSearchResult[] = [];

    constructor(users: UserData[]) {
        this.users = users.map(u => {
            return new AutoInputSearchResult(u.userId, undefined, u.fursonaName, undefined, u.propic?.mediaUrl);
        });
    }

    codeOnly = false;

    loadByIds(filter: AutoInputFilter) {
        return Promise.resolve(filterLoaded(this.users, filter))
    };

    searchByValues(value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter) {
        return Promise.resolve(filterSearchResult(value, SearchType.RANKED, this.users, locale, filter, filterOut));
    };

    isPresent() {
        return Promise.resolve(this.users && this.users.length > 0);
    }
}