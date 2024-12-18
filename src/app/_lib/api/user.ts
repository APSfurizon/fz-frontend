import { HeaderData } from "../components/header";

export const ENDPOINTS = Object.freeze({
    HEADER_DATA: "header/data",
});

export enum SponsorType {
    NONE = "NONE",
    SPONSOR = "SPONSOR",
    SUPER = "SUPER_SPONSOR"
}

export type UserData = {
    userId: number,
    fursonaName?: string,
    locale?: string,
    propicUrl?: string,
    sponsorship: SponsorType
}

export const EMPTY_USER_PICTURE: UserData = {
    userId: -1,
    fursonaName: undefined,
    locale: undefined,
    propicUrl: undefined,
    sponsorship: SponsorType.NONE
};

export function getUserPicture (fromHeader: HeaderData): UserData {
    return {
        userId: -1,
        fursonaName: fromHeader.fursonaName,
        propicUrl: fromHeader.propicPath,
        sponsorship: fromHeader.sponsorType
    };
}