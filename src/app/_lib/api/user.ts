import { HeaderData } from "../components/header";

export const ENDPOINTS = Object.freeze({
    HEADER_DATA: "header/data",
});

export enum SponsorType {
    NONE = "NONE",
    SPONSOR = "SPONSOR",
    SUPER = "SUPER_SPONSOR"
}

export type UserPictureData = {
    nickname?: string,
    profile_picture_url?: string,
    country?: string,
    sponsorType: string
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