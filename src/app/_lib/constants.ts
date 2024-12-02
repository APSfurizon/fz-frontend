export const EMPTY_PROFILE_PICTURE_SRC = "/images/profile.png";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090/api/v1/';
export const TOKEN_STORAGE_NAME = "fz-token";
export const SESSION_DURATION = parseInt(process.env.NEXT_PUBLIC_SESSION_DURATION ?? "7");
export const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG_ENABLED === "true";
export const UPLOAD_MIN_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MIN_SIZE ?? "256");
export const UPLOAD_MAX_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE ?? "4096");
export const REGEX_AUTHENTICATED_URLS = /^\/([A-z]{2})(?:\/(?!(login|register|nosecount)).+)?$/gmi;