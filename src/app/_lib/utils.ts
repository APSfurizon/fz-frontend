import { ApiDetailedErrorResponse, ApiErrorDetail, ApiErrorResponse } from "./api/global";
import { API_BASE_URL, API_IMAGE_URL, MEMBERSHIP_STARTING_YEAR } from "./constants";

export const DAY_TS = 1000 * 60 * 60 * 24,
            HOUR_TS = 1000 * 60 * 60,
            MINUTE_TS = 1000 * 60,
            SECOND_TS = 1000;


export function nullifyEmptyStrings (values?: (string | undefined)[]) {
    return values?.map(s => nullifyEmptyString(s));
}

export function nullifyEmptyString (value?: string) {
    return value ? value.length > 0 ? value.trim() : undefined : undefined;
}

export function getCountdown (ts: number): number[] {
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

export function translate(data: Record<string, string>, locale: string): string {
    return data ? data[locale] ?? data["en"] : "";
}

export function translateNullable(data?: Record<string, string>, locale?: string): string | undefined {
    return data && locale ? data[locale] ?? data["en"] : undefined;
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

export function extractSearchParams ( uri: string ) {
    // Get everything after the `?`
    const [ , paramString ] = uri.split( '?' );
  
    // Return parameters
    return new URLSearchParams( paramString );
}

export function stripUrl (uri: string) {
    const url = new URL(uri);
    const params = new URLSearchParams(url.searchParams);
    params.forEach((v, k)=>url.searchParams.delete(k));
    return url.toString();
}

export function padStart(x: number) {
    return (""+x).padStart(2, "0");
}

export const years = Array(((new Date().getUTCFullYear()) - MEMBERSHIP_STARTING_YEAR) + 3).fill(0).map((i, index)=>index).map((i)=>MEMBERSHIP_STARTING_YEAR+i);

export function getImageUrl (src?: string): string | undefined {
    return src && src.length > 0 ? new URL(src, API_IMAGE_URL).href : undefined;
}