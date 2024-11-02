import { SponsorType } from "../api/user";

export type HeaderData = {
    nickname?: string,
    profile_picture_url?: string,
    loggedIn: boolean,
    error: boolean,
    sponsorType: number
}

export const EMPTY_HEADER_DATA: HeaderData = {
    error: false,
    loggedIn: false,
    nickname: undefined,
    profile_picture_url: undefined,
    sponsorType: SponsorType.NONE
};