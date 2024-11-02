import { SponsorType, UserPictureData } from "./api/user";
import { HeaderData } from "./components/header";
import { EMPTY_PROFILE_PICTURE_SRC } from "./constants";

/**
 * @deprecated for test purposes only
 */
export function getTestHeaderUserData (): Promise<HeaderData> {
    const toReturn: HeaderData = {
        error: false,
        loggedIn: true,
        nickname: 'Drew',
        profile_picture_url: EMPTY_PROFILE_PICTURE_SRC,
        sponsorType: SponsorType.SUPER
    };
    return new Promise<HeaderData> ((resolve, reject) => {
        setTimeout(()=>resolve(toReturn), 2000);
    })
}

/**
 * @deprecated for test purposes only
 */
export function getTestUserPictureData (): Promise<UserPictureData> {
    const toReturn: UserPictureData = {
        nickname: 'Drew',
        profile_picture_url: EMPTY_PROFILE_PICTURE_SRC,
        country: 'it',
        sponsorType: SponsorType.SPONSOR
    };
    return new Promise<UserPictureData> ((resolve, reject) => {
        setTimeout(()=>resolve(toReturn), 2000);
    })
}
