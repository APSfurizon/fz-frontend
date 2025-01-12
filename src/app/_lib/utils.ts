import { ApiDetailedErrorResponse, ApiErrorDetail, ApiErrorResponse } from "./api/global";
import { Coordinates } from "./components/upload";
import { MEMBERSHIP_STARTING_YEAR } from "./constants";

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

export function copyContent (e: HTMLElement | HTMLInputElement) {
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

export function getCookie(cookieName: string) {
    let name = cookieName + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
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

export enum DEVICE_TYPE {
    APPLE = "apple",
    ANDROID = "android",
    GENERIC = "generic"
}

export function getDeviceType (): DEVICE_TYPE {
    const UA = navigator.userAgent;
    if (/\b(Android)\b/i.test(UA))
        return DEVICE_TYPE.ANDROID;
    else if (/\b(iPad|iPod)\b/i.test(UA) || /\b(iPhone)\b/i.test(UA))
        return DEVICE_TYPE.APPLE;
    else
        return DEVICE_TYPE.GENERIC;
}

export function areEquals (a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function firstOrUndefined(a: any[] | undefined): any | undefined {
    return a && a.length > 0 ? a[0] : undefined;
}

export const years = Array(((new Date().getUTCFullYear()) - MEMBERSHIP_STARTING_YEAR) + 3).fill(0).map((i, index)=>index).map((i)=>MEMBERSHIP_STARTING_YEAR+i);