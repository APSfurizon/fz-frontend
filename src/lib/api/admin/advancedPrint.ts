import { FursuitDetails } from "../badge/fursuits"
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global"
import { MediaData } from "../media"
import { SponsorType, UserData } from "../user"

export type BadgeSearchData = {
    orderQuery?: string,
    serialQuery?: string
}

export type CommonBadgeData = {
    orderCode: string,
    orderSerial: number
}

export type FursuitBadge = CommonBadgeData & {
    fursuit: FursuitDetails,
    ownerUserId: number
}

export type RegularBadgeUser = {
    userId: number,
    fursonaName: string,
    locale: string,
    propic?: MediaData,
    sponsorship: SponsorType
}

export type RegularBadge = CommonBadgeData & {
    user: UserData
}

export interface SearchRegularBadgesResponse extends ApiResponse {
    userBadges: RegularBadge[]
}

export class SearchRegularBadgesApiAction extends ApiAction<SearchRegularBadgesResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/export/badges/preview/user";
}

export interface SearchFursuitBadgesResponse extends ApiResponse {
    fursuitBadges: FursuitBadge[]
}

export class SearchFursuitBadgesApiAction extends ApiAction<SearchFursuitBadgesResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/export/badges/preview/fursuits";
}