import { CSSProperties } from "react";
import { CACHED_COUNTRIES, CACHED_STATES, CachedCountries, CachedStates } from "../cache/cache";
import { AutoInputFilter, AutoInputManager, AutoInputSearchResult, filterLoaded, filterSearchResult, SearchType } from "../components/autoInput";
import { getFlagEmoji } from "../components/userPicture";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "./global";
import { TranslatableString } from "../translations";
import { firstOrEmpty } from "../utils";

/**Either a country or a region */
export interface Place {
    name: string,
    code: string,
    phonePrefix: string,
    translatedDescription: TranslatableString
}

export interface PlaceApiResponse extends ApiResponse {
    data: Place[]
}

export class AutoInputCountriesApiAction extends ApiAction<PlaceApiResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "states/get-countries";
}

export class AutoInputStatesApiAction extends ApiAction<PlaceApiResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "states/by-country";
}

export function getAutoInputCountries (showNumber?: boolean): Promise<CountrySearchResult[]> {
    return new Promise<CountrySearchResult[]> ((resolve, reject) => {
        CACHED_COUNTRIES.get().then ((data) => {
            const parsed = data as PlaceApiResponse;
            resolve (parsed.data.map ((place, index) => {
                const toReturn = new CountrySearchResult();
                toReturn.showPhoneNumber = showNumber;
                toReturn.id = index;
                toReturn.code = place.code;
                toReturn.description = `${place.name}${showNumber ? ` (${place.phonePrefix})` : ""}`;
                toReturn.icon = getFlagEmoji(place.code);
                toReturn.phonePrefix = place.phonePrefix;
                toReturn.translatedDescription = place.translatedDescription;
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}

export function getAutoInputStates (countryCode?: string): Promise<AutoInputSearchResult[]> {
    return new Promise<AutoInputSearchResult[]> ((resolve, reject) => {
        CACHED_STATES.get (countryCode).then ((data) => {
            const parsed = data as PlaceApiResponse;
            resolve (parsed.data.map ((place, index) => {
                const toReturn = new AutoInputSearchResult();
                toReturn.id = index;
                toReturn.code = place.code;
                toReturn.description = place.name;
                return toReturn;
            }));
        }).catch ((err) => {reject (err)});
    });
}

export class CountrySearchResult extends AutoInputSearchResult {
    phonePrefix?: string;
    showPhoneNumber?: boolean;
    iconCSS?: CSSProperties = {transform: 'translate(0%, -10%)'};
    public getDescription (locale?: string): string {
        return super.getDescription(locale) + (this.showPhoneNumber === true ? ` (${this.phonePrefix})` : "");
    }
}

export class AutoInputCountriesManager implements AutoInputManager {
    codeOnly: boolean = true;
    showNumber?: boolean = false;

    constructor(showNumber?: boolean) {
        this.showNumber = showNumber ?? false;
    }

    loadByIds (filter: AutoInputFilter, customIdExtractor?: (r: AutoInputSearchResult) => string | number): Promise<CountrySearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries (this.showNumber).then (results => {
                const countries = results.map(data=>{
                    if (customIdExtractor) {
                        if (this.codeOnly) {
                            data.code = customIdExtractor(data) as string ?? data.code;
                        } else {
                            data.id = customIdExtractor(data) as number ?? data.id;
                        }
                    }
                    return data;
                })
                const toReturn = countries.filter (result => filter.applyFilter(result));
                resolve (this.showNumber ? firstOrEmpty(toReturn) : toReturn);
            });
        });
    }

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter,
        additionalValues?: any): Promise<CountrySearchResult[]> {
            return new Promise((resolve, reject) => {
                getAutoInputCountries (this.showNumber).then (results => {
                    resolve (
                        filterSearchResult(value, SearchType.RANKED, results, locale, filter, filterOut)
                    );
                });
            });
    }

    isPresent (additionalValue?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries (this.showNumber).then (results => {
                resolve (results.length > 0);
            });
        });
    };
}

export class AutoInputStatesManager implements AutoInputManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter, customIdExtractor?: (r: AutoInputSearchResult) => string | number, additionalValues?: any[]): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputStates (additionalValues ? additionalValues[0] : undefined).then (results => {
                const filtered = filterLoaded(results, filter, undefined);
                resolve (filtered);
            });
        });
    }

    searchByValues (value: string, locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, countryCode?: string): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            if (!countryCode) resolve([]);
            getAutoInputStates (countryCode!).then (results => {
                resolve (
                    filterSearchResult(value, SearchType.RANKED, results, locale, filter, filterOut)
                );
            });
        });
    }

    isPresent (countryCode?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!countryCode) resolve(false);
            getAutoInputStates (countryCode!).then (results => {
                resolve (results.length > 0);
            });
        });
    };
}