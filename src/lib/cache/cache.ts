import { ApiErrorResponse, runRequest } from "../api/global";
import { AutoInputCountriesApiAction, AutoInputStatesApiAction, PlaceApiResponse } from "../api/geo";
import { buildSearchParams } from "../utils";
import { GetPermissionsApiAction, GetPermissionsResponse } from "../api/admin/role";
import * as crypto from "crypto";

export function getParamsHash(...p: any[]) {
    const shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(p));
    return shasum.digest('hex');
}

export type CacheTuple<T = any> = {
    /**UTC Fetch time in milliseconds (unix epoch)*/
    fetchTime: number,
    /**Actual stored value*/
    value: T
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 2 minutes

export abstract class CachedData<T> {
    duration: number = DEFAULT_CACHE_DURATION;
    abstract loadData(...p: any[]): Promise<T>;
    cachedDataMap: Map<string, CacheTuple<T>> = new Map();

    get(...p: any[]): Promise<T> {
        if (!p) p = [];
        const paramsHash = getParamsHash(p);
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const data = this.cachedDataMap.get(paramsHash);
            const diff = now - (data?.fetchTime ?? 0);
            if (data && diff < this.duration) {
                resolve(data!.value);
            } else {
                this.loadData(p)
                    .then((result: T) => {
                        const data: CacheTuple<T> = {
                            fetchTime: now,
                            value: result
                        };
                        this.cachedDataMap.set(paramsHash, data);
                        resolve(result);
                    }).catch((err) => reject(err));
            }
        });
    };
}

export class CachedCountries extends CachedData<boolean | PlaceApiResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData() {
        return runRequest({ action: new AutoInputCountriesApiAction() });
    }
}

export const CACHED_COUNTRIES = new CachedCountries();

export class CachedStates extends CachedData<boolean | PlaceApiResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData(...p: string[]) {
        return runRequest({
            action: new AutoInputStatesApiAction(),
            searchParams: buildSearchParams({ "code": p[0] ?? "" })
        });
    }
}

export const CACHED_STATES = new CachedStates();

export class CachedPermissions extends CachedData<boolean | GetPermissionsResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData() {
        return runRequest({ action: new GetPermissionsApiAction() });
    }
}

export const CACHED_PERMISSIONS = new CachedPermissions();