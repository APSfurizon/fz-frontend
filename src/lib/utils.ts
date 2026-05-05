import { ApiErrorResponse } from "./api/global";
import { getFlagEmoji } from "./components/userPicture";
import {
    API_IMAGE_URL, APP_VERSION, CHANGELOGS_ENABLED,
    MEMBERSHIP_STARTING_YEAR, READ_CHANGELOG_STORAGE_NAME
} from "./constants";

export const DAY_TS = 1000 * 60 * 60 * 24,
    HOUR_TS = 1000 * 60 * 60,
    MINUTE_TS = 1000 * 60,
    SECOND_TS = 1000;

export function nullifyEmptyStrings(values?: (string | undefined)[]) {
    return values?.map(s => nullifyEmptyString(s));
}

export function nullifyEmptyString(value?: string) {
    return value && value.length > 0 ? value.trim() : undefined;
}

export function stripProperties(toChange: any, fields: string[]) {
    const toReturn = { ...toChange };
    for (const fieldName of Object.keys(toChange)) {
        if (toReturn[fieldName] === null || fields.includes(fieldName))
            toReturn[fieldName] = undefined;
    }
    return toReturn;
}

export function getCountdown(ts: number): number[] {
    let base = ts;
    const days = Math.floor(base / DAY_TS);
    base -= days * DAY_TS;
    const hours = Math.floor(base / HOUR_TS);
    base -= hours * HOUR_TS;
    const minutes = Math.floor(base / MINUTE_TS);
    base -= minutes * MINUTE_TS;
    const seconds = Math.floor(base / SECOND_TS);
    return [days, hours, minutes, seconds];
}

export function isEmpty(str?: string) {
    return !str || !str.length;
}

export function copyContent(e: HTMLElement | HTMLInputElement) {
    if (e.textContent) {
        navigator.clipboard.writeText(e.textContent);
        return true;
    } else if ("value" in e) {
        navigator.clipboard.writeText(e.value);
        return true;
    } else {
        return false;
    }
}

export function buildSearchParams(init: Record<string, string | string[]>): URLSearchParams {
    const params = new URLSearchParams();
    Object.keys(init).forEach(key => {
        if (init[key] instanceof Array) {
            init[key].forEach(value => params.append(key, value));
        } else {
            params.append(key, init[key])
        }
    })
    return params;
}

export function setCookie(cookieName: string, value: string, expiry: Date,
    path: string = "/", sameSite: string = "lax") {
    document.cookie = `${cookieName}=${value};expires=${expiry.toUTCString()};path=${path};sameSite=${sameSite}`;
}

export function getCookie(cookieName: string) {
    const name = cookieName + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function cssClass(data: Record<string, boolean>) {
    return Object.keys(data).map(key => data[key] == true ? key : "").join(" ");
}

export function areEquals(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function firstOrUndefined(a: any[] | undefined): any | undefined {
    return a && a.length > 0 ? a[0] : undefined;
}

export function firstOrEmpty(a: any[]): any[] {
    return a[0] ? [a[0]] : [];
}

export function stripUrl(uri: string) {
    const url = new URL(uri);
    const params = new URLSearchParams(url.searchParams);
    params.forEach((v, k) => url.searchParams.delete(k));
    return url.toString();
}

export function padStart(x: number) {
    return ("" + x).padStart(2, "0");
}

export const years = Array(((new Date().getUTCFullYear()) - MEMBERSHIP_STARTING_YEAR) + 3)
    .fill(0).map((i, index) => index).map((i) => MEMBERSHIP_STARTING_YEAR + i);

export function getImageUrl(src?: string): string | undefined {
    return src && src.length > 0 ? new URL(src, API_IMAGE_URL).href : undefined;
}

export function shouldShowChangelog(): boolean {
    const readVersion = localStorage.getItem(READ_CHANGELOG_STORAGE_NAME);
    const lastVersion = nullifyEmptyString(readVersion ?? "");
    return CHANGELOGS_ENABLED && (!lastVersion || lastVersion !== APP_VERSION);
}

export function errorCodeToApiError(err: string): ApiErrorResponse {
    return {
        errorMessage: err
    };
}

export function resultSelf<A, R>(arg1: A): R {
    return arg1 as any as R;
}

export function mapLanguageToFlag(lang: string) {
    const value = lang.split("-")[1]?.toLowerCase() ?? lang.toLowerCase();
    switch (value) {
        case "en":
            return getFlagEmoji("gb");
        default:
            return getFlagEmoji(value)
    }
}

export function getCountArray(index: number, limit: number, min: number, max: number) {
    const toReturn: number[] = [];
    const half = Math.floor(limit / 2);
    let start = index - half;
    const diffStart = Math.abs(start - Math.max(start, min));
    const end = index + 1 + half + diffStart;
    const diffEnd = Math.abs(end - Math.min(end, max));
    start -= diffEnd;

    for (let i = Math.max(start, min); i < Math.min(end, max); i++) {
        toReturn.push(i)
    }
    return toReturn;
}

export function getParentDirectory(path: string, repetition: number = 1): string {
    let toReturn = path;
    if (!toReturn.endsWith("/")) toReturn += "/";
    toReturn += ".."
    return repetition > 1 ? getParentDirectory(toReturn, --repetition) : toReturn;
}

export function toEnum<T>(data: any, t: T) {
    if (!data) return undefined;
    return t[data as keyof typeof t];
}

export function today() {
    return dateToParam(new Date());
}

export function dateToParam(date: Date) {
    return `${date.getFullYear()}-` +
        `${String(date.getMonth() + 1).padStart(2, '0')}-` +
        `${String(date.getDate()).padStart(2, '0')}`;
}

export function templateReplace(toReplace: string, templateMap: Record<string, any>): string {
    let toReturn = toReplace;
    for (const key of Object.keys(templateMap)) {
        toReturn = toReturn.replaceAll(`{${key}}`, templateMap[key]);
    }
    return toReturn;
}

export const SCHEDULE_DEFAULT_TIME_ZONE = "Europe/Rome";

function toTimeZoneWallClock(date: Date, timeZone: string): Date {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const values = formatter
        .formatToParts(date)
        .reduce<Record<string, number>>((acc, part) => {
            if (part.type !== "literal") {
                acc[part.type] = Number.parseInt(part.value, 10);
            }
            return acc;
        }, {});

    return new Date(
        values.year,
        (values.month ?? 1) - 1,
        values.day ?? 1,
        values.hour ?? 0,
        values.minute ?? 0,
        values.second ?? 0,
    );
}

function parseDateWithoutTimeZone(value: string): Date | null {
    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
    );
    if (!match) {
        return null;
    }

    const [, year, month, day, hour = "00", minute = "00", second = "00"] = match;
    return new Date(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10) - 1,
        Number.parseInt(day, 10),
        Number.parseInt(hour, 10),
        Number.parseInt(minute, 10),
        Number.parseInt(second, 10),
    );
}

export function parseDateForTimeZone(
    value?: string | null,
    timeZone: string = SCHEDULE_DEFAULT_TIME_ZONE,
): Date | null {
    const raw = value?.trim();
    if (!raw) {
        return null;
    }

    const hasExplicitTimeZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw);

    if (!hasExplicitTimeZone) {
        const localDate = parseDateWithoutTimeZone(raw);
        if (localDate && !Number.isNaN(localDate.getTime())) {
            return localDate;
        }
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return toTimeZoneWallClock(parsed, timeZone);
}