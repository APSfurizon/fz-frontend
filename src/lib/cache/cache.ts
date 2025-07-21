import { ApiErrorResponse, runRequest } from "../api/global";
import { AutoInputCountriesApiAction, AutoInputStatesApiAction, PlaceApiResponse } from "../api/geo";
import { buildSearchParams } from "../utils";
import { GetPermissionsApiAction, GetPermissionsResponse } from "../api/admin/role";

export function getParamsHash(...p: any[]) {
    const crypto = require('crypto')
    const shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(p));
    return shasum.digest('hex');
}

export abstract class CachedData<T> {
    duration: number = 120000;
    abstract loadData(...p: any[]): Promise<T>;
    lastFetchTime: Date = new Date();
    cachedDataMap?: Record<string, T>;
    get(...p: any[]): Promise<T> {
        if (!p) p = [];
        const paramsHash = getParamsHash(p);
        return new Promise((resolve, reject) => {
            const now = new Date();
            const diff = this.lastFetchTime.getTime() - now.getTime();
            if (diff < this.duration && this.cachedDataMap && this.cachedDataMap[paramsHash]) {
                resolve(this.cachedDataMap[paramsHash]);
            } else {
                this.loadData(p)
                    .then((result: T) => {
                        if (!this.cachedDataMap) this.cachedDataMap = {};
                        this.lastFetchTime = now;
                        this.cachedDataMap[paramsHash] = result;
                        resolve(result);
                    }).catch((err) => reject(err));
            }
        });
    };
}

export class CachedCountries extends CachedData<boolean | PlaceApiResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData() {
        return runRequest(new AutoInputCountriesApiAction());
    }
}

export const CACHED_COUNTRIES = new CachedCountries();

export class CachedStates extends CachedData<boolean | PlaceApiResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData(...p: string[]) {
        return runRequest(new AutoInputStatesApiAction(), undefined, undefined,
            buildSearchParams({ "code": p[0] ?? "" }));
    }
}

export const CACHED_STATES = new CachedStates();

export class CachedPermissions extends CachedData<boolean | GetPermissionsResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData() {
        return runRequest(new GetPermissionsApiAction());
    }
}

export const CACHED_PERMISSIONS = new CachedPermissions();