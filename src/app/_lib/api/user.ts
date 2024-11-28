import { HeaderData } from "../components/header";

export const ENDPOINTS = Object.freeze({
    HEADER_DATA: "header/data",
});

export enum SponsorType {
    NONE = 0,
    SPONSOR = 1,
    SUPER = 2
}

export type UserPictureData = {
    nickname?: string,
    profile_picture_url?: string,
    country?: string,
    sponsorType: number
}

export const EMPTY_USER_PICTURE: UserPictureData = {
    nickname: undefined,
    profile_picture_url: undefined,
    country: undefined,
    sponsorType: SponsorType.NONE
};

export function getUserPicture (fromHeader: HeaderData): UserPictureData {
    return {
        nickname: fromHeader.fursonaName,
        profile_picture_url: fromHeader.propicPath,
        sponsorType: fromHeader.sponsorType
    };
}