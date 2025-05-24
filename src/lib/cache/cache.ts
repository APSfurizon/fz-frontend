import { ApiErrorResponse, runRequest } from "../api/global";
import { AutoInputCountriesApiAction, AutoInputStatesApiAction, Place, PlaceApiResponse } from "../api/geo";
import { buildSearchParams } from "../utils";
import { GetPermissionsApiAction, GetPermissionsResponse } from "../api/admin/role";

export function getParamsHash(...p: any[]) {
    var crypto = require('crypto')
    var shasum = crypto.createHash('sha1');
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
        let paramsHash = getParamsHash(p);
        return new Promise((resolve, reject) => {
            let now = new Date();
            if ((this.lastFetchTime.getTime() - now.getTime()) < this.duration && this.cachedDataMap && this.cachedDataMap[paramsHash]) {
                resolve(this.cachedDataMap[paramsHash]);
            } else {
                this.loadData(p)
                    .then((result: T) => {
                        if (!this.cachedDataMap) this.cachedDataMap = {};
                        this.lastFetchTime = new Date();
                        this.cachedDataMap[paramsHash] = result;
                        resolve(result);
                    }).catch((err) => reject(err));
            }
        });
    };
}

export class CachedCountries extends CachedData<Boolean | PlaceApiResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData(...p: any[]) {
        return runRequest(new AutoInputCountriesApiAction());
    }
}

export const CACHED_COUNTRIES = new CachedCountries();

export class CachedStates extends CachedData<Boolean | PlaceApiResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData(...p: string[]) {
        return runRequest(new AutoInputStatesApiAction(), undefined, undefined, buildSearchParams({ "code": p[0] ?? "" }));
    }
}

export const CACHED_STATES = new CachedStates();

export class CachedPermissions extends CachedData<Boolean | GetPermissionsResponse | ApiErrorResponse> {
    duration: number = 1 * 24 * 60 * 60; // One day
    loadData(...p: string[]) {
        return runRequest(new GetPermissionsApiAction());
    }
}

export const CACHED_PERMISSIONS = new CachedPermissions();