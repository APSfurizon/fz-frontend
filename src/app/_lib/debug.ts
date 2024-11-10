import { SponsorType, UserPictureData } from "./api/user";
import { AutoInputSearchResult } from "./components/autoInput";
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
        sponsorType: SponsorType.SPONSOR
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

/**
 * @deprecated for test purposes only
 */
export function getAutoInputUserData (): Promise<AutoInputSearchResult[]> {
    const toReturn: AutoInputSearchResult[] = [
        {id: 1, description: "Drew", imageUrl: EMPTY_PROFILE_PICTURE_SRC},
        {id: 0, description: "Jan", imageUrl: EMPTY_PROFILE_PICTURE_SRC},
        {id: 4, description: "Reix", imageUrl: EMPTY_PROFILE_PICTURE_SRC},
        {id: 3, description: "Stark", imageUrl: EMPTY_PROFILE_PICTURE_SRC},
        {id: 2, description: "Stranck", imageUrl: EMPTY_PROFILE_PICTURE_SRC},
        {id: 5, description: "Utentone", imageUrl: EMPTY_PROFILE_PICTURE_SRC},
    ]
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        setTimeout(()=>resolve(toReturn), 0);
    })
}
