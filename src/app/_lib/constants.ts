import { DEVICE_TYPE } from "./utils";

export const EMPTY_PROFILE_PICTURE_SRC = "/images/profile.png";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090/api/v1/';
export const TOKEN_STORAGE_NAME = "fz-token";
export const UPLOAD_MIN_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MIN_SIZE ?? "256");
export const UPLOAD_MAX_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE ?? "4096");
export const MEMBERSHIP_STARTING_YEAR = parseInt(process.env.NEXT_PUBLIC_MEMBERSHIP_START_YEAR ?? "2024");

// Security
export const SESSION_DURATION = parseInt(process.env.NEXT_PUBLIC_SESSION_DURATION ?? "7");
export const REGEX_AUTHENTICATED_URLS = /^\/([A-z]{2}){0,1}(?:\/(?!(login|recover|register|nosecount|recover\/confirm)).+)?$/gmi;

// Event related data
export const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME ?? "Furizon";
export const EVENT_BANNER = process.env.NEXT_PUBLIC_EVENT_BANNER ?? "https://furizon.net/wp-content/uploads/2024/11/ZenithCover-Resized.jpeg"
export const EVENT_LOGO = process.env.NEXT_PUBLIC_EVENT_LOGO ?? "https://furizon.net/wp-content/uploads/2024/11/ZenithLogoResized.png";
export const EVENT_CURRENCY = process.env.NEXT_PUBLIC_EVENT_CURRENCY ?? "EUR";

export const SHOW_APP_BANNER = (process.env.NEXT_PUBLIC_SHOW_APP_BANNER ?? false) === "true";

export const APP_LINKS: Record<string, string> = {"android": "https://play.google.com/store/apps/details?id=com.furizon2023", "apple": "https://apps.apple.com/it/app/furizon/id6502957058"};

export const BOOKING_ENABLED = (process.env.NEXT_PUBLIC_BOOKING_ENABLED ?? false) === "true";
export const BADGE_ENABLED = (process.env.NEXT_PUBLIC_BADGE_ENABLED ?? false) === "true";
export const ROOM_ENABLED = (process.env.NEXT_PUBLIC_ROOM_ENABLED ?? false) === "true";
export const UPLOAD_ENABLED = (process.env.NEXT_PUBLIC_UPLOAD_ENABLED ?? false) === "true";
export const DEBUG_ENABLED = (process.env.NEXT_PUBLIC_DEBUG_ENABLED ?? false) === "true";