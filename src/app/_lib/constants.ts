export const EMPTY_PROFILE_PICTURE_SRC = "/images/profile.png";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090/api/v1/';
export const TOKEN_STORAGE_NAME = "fz-token";
export const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG_ENABLED === "true";
export const UPLOAD_MIN_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MIN_SIZE ?? "256");
export const UPLOAD_MAX_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE ?? "4096");

// Security
export const SESSION_DURATION = parseInt(process.env.NEXT_PUBLIC_SESSION_DURATION ?? "7");
export const REGEX_AUTHENTICATED_URLS = /^\/([A-z]{2})(?:\/(?!(login|register|nosecount)).+)?$/gmi;

// Event related data
export const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME ?? "Furizon";
export const EVENT_BANNER = process.env.NEXT_PUBLIC_EVENT_BANNER ?? "https://furizon.net/wp-content/uploads/2024/11/ZenithCover-Resized.jpeg"
export const EVENT_LOGO = process.env.NEXT_PUBLIC_EVENT_LOGO ?? "https://furizon.net/wp-content/uploads/2024/11/ZenithLogoResized.png";