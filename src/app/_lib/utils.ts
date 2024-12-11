import { ApiDetailedErrorResponse, ApiErrorDetail, ApiErrorResponse } from "./api/global";
import { Coordinates } from "./components/upload";

export function nullifyEmptyStrings (values?: (string | undefined)[]) {
    return values?.map(s => nullifyEmptyString(s));
}

export function nullifyEmptyString (value?: string) {
    return value ? value.length > 0 ? value : undefined : undefined;
}

export function getErrorBody (error?: ApiErrorResponse): String | undefined {
    if (!error) {
        return undefined;
    } else {
        if ("errors" in error && error["errors"]) {
            const detail: ApiDetailedErrorResponse = error as ApiDetailedErrorResponse;
            return `${(detail.errors ?? []).join(", ")} (id=${error.requestId})`;
        } else {
            return `${error.errorMessage} (id=${error.requestId})`;
        }
    }
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
