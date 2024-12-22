import { ApiDetailedErrorResponse, ApiErrorDetail, ApiErrorResponse } from "./api/global";
import { Coordinates } from "./components/upload";

export function nullifyEmptyStrings (values?: (string | undefined)[]) {
    return values?.map(s => nullifyEmptyString(s));
}

export function nullifyEmptyString (value?: string) {
    return value ? value.length > 0 ? value : undefined : undefined;
}

export function getBiggestTimeUnit(ts: number): Intl.RelativeTimeFormatUnit {
    const second = 1000,
    minute = 60 * second,
    hour = 60 * minute,
    day = 24 * hour;
    if (ts >= day) return "day";
    else if (ts >= hour) return "hour";
    else if (ts >= minute) return "minute";
    else return "second";
}

export function translate(data: Record<string, string>, locale: string): string {
    return data[locale] ?? data["en"];
}

export function isEmpty (str?: string) {
    return !str || str.length === 0;
}

export function copyContent (e: HTMLElement) {
    if (e.textContent) {
        navigator.clipboard.writeText(e.textContent);
        return true;
    } else {
        return false;
    }
}

export function buildSearchParams (init: Record<string, string | string[]>): URLSearchParams {
    const params = new URLSearchParams();
    Object.keys(init).forEach(key => {
        if (init[key] instanceof Array){
            init[key].forEach(value =>params.append(key, value));
        } else {
            params.append(key, init[key])
        }
    })
    return params;
}
