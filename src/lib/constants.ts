export const EMPTY_PROFILE_PICTURE_SRC = "/images/profile.png";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090/api/v1/';
export const API_IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
export const TOKEN_STORAGE_NAME = "fz-token";

export const APP_HOSTNAME = process.env.NEXT_PUBLIC_APP_HOSTNAME ?? "";
export const APP_VERSION = process.env.version;
export const APP_GIT = "https://github.com/APSfurizon/";
export const APP_GIT_PROJECT = "https://github.com/APSfurizon/fz-frontend";
export const APP_GIT_PROJECT_RELEASE  = new URL("releases/tag/"+APP_VERSION, APP_GIT_PROJECT);
export const DEFAULT_TRANSLATION_KEY = "en-gb";

export const READ_CHANGELOG_STORAGE_NAME = "fz-read-changelog";
export const CHANGELOGS_ENABLED = (process.env.NEXT_PUBLIC_CHANGELOGS_ENABLED ?? true) === "true";

/****************/
/*****UPLOAD*****/
/****************/

/**Minimum size allowed to be cropped */
export const UPLOAD_SELECTOR_MIN_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_SELECTOR_MIN_SIZE ?? "60");
/**Maximum size allowed to be cropped */
export const UPLOAD_SELECTOR_MAX_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_SELECTOR_MAX_SIZE ?? "4096");
/**Maximum size for a profile picture, all profile pictures exceeding this will be scaled back */
export const PROFILE_UPLOAD_MAX_SIZE = parseInt(process.env.NEXT_PUBLIC_PROFILE_UPLOAD_MAX_SIZE ?? "500");
/**Maximum width of a full picture, all profile pictures exceeding this will be scaled back */
export const FULL_UPLOAD_MAX_WIDTH = parseInt(process.env.NEXT_PUBLIC_FULL_UPLOAD_MAX_WIDTH ?? "2500");
/**Maximum height of a full picture, all profile pictures exceeding this will be scaled back */
export const FULL_UPLOAD_MAX_HEIGHT = parseInt(process.env.NEXT_PUBLIC_FULL_UPLOAD_MAX_HEIGHT ?? "2500");

/****************/
/****SECURITY****/
/****************/

/**Session duration in days */
export const SESSION_DURATION = parseInt(process.env.NEXT_PUBLIC_SESSION_DURATION ?? "7");
/**Urls that need authentication */
// eslint-disable-next-line max-len
export const REGEX_AUTHENTICATED_URLS = /^(?:\/(?!(login|logging|logout|recover|register|nosecount|recover\/confirm|api\/og)).+)?$/gmi;
/**Urls that need to be skipped if user is authenticated */
// eslint-disable-next-line max-len
export const REGEX_SKIP_AUTHENTICATED = /^(?:\/(login|recover|register|recover\/confirm)(.+)?)?$/gmi;
/**Logout url */
export const REGEX_LOGOUT = /^(\/logout(.+)?)$/gmi;

// Event related data
export const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME ?? "Furizon";
export const EVENT_BANNER = process.env.NEXT_PUBLIC_EVENT_BANNER_URL ?? ""
export const EVENT_LOGO = process.env.NEXT_PUBLIC_EVENT_LOGO;
export const EVENT_CURRENCY = process.env.NEXT_PUBLIC_EVENT_CURRENCY ?? "EUR";
export const GROUP_CHAT_URL = process.env.NEXT_PUBLIC_GROUP_CHAT_URL;
export const MEMBERSHIP_STARTING_YEAR = parseInt(process.env.NEXT_PUBLIC_MEMBERSHIP_START_YEAR ?? "2024");

export const SHOW_APP_BANNER = (process.env.NEXT_PUBLIC_SHOW_APP_BANNER ?? false) === "true";

/****************/
/***APP*BANNER***/
/****************/

export const APP_LINKS: Record<string, string> = {
    android: process.env.NEXT_PUBLIC_PLAY_STORE_LINK ?? "",
    apple: process.env.NEXT_PUBLIC_APP_STORE_LINK ?? ""
};

/****************/
/******PAGES*****/
/****************/

export const BOOKING_ENABLED = (process.env.NEXT_PUBLIC_BOOKING_ENABLED ?? false) === "true";
export const BADGE_ENABLED = (process.env.NEXT_PUBLIC_BADGE_ENABLED ?? false) === "true";
export const ROOM_ENABLED = (process.env.NEXT_PUBLIC_ROOM_ENABLED ?? false) === "true";
export const UPLOAD_ENABLED = (process.env.NEXT_PUBLIC_UPLOAD_ENABLED ?? false) === "true";
export const DEBUG_ENABLED = (process.env.NEXT_PUBLIC_DEBUG_ENABLED ?? false) === "true";