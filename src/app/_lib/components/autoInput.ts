import { getAutoInputCountries, getAutoInputStates } from "../api/register";
import { getAutoInputUserData } from "../debug";

export interface AutoInputSearchResult {
    id?: number,
    description?: string,
    code?: string,
    icon?: string,
    imageUrl?: string,
}

export class AutoInputFilter {
    constructor(ids: number[], codes: string[]) {
        this.filteredIds = ids;
        this.filteredCodes = codes;
    }

    applyFilter(data: AutoInputSearchResult) {
        return data.code && this.filteredCodes.includes(data.code.trim()) || data.id && this.filteredIds.includes(data.id);
    } 

    filteredCodes: string[];
    filteredIds: number[];
}

export function getFilterForSelected (type: AutoInputTypeManager, data: (string | number)[]) {
    let ids: number[] = [];
    let codes: string[] = [];
    if (type.codeOnly) {
        codes = data.map (d => d as string);
    } else {
        ids = data.map (d => d as number);
    }
    return new AutoInputFilter(ids, codes);
}

export function filterSearchResult(query: string, results: AutoInputSearchResult[], filter?: AutoInputFilter, filterOut?: AutoInputFilter) {
    let value = query.trim().toLowerCase();
    return results.filter ((result) => (result.description?.toLowerCase().includes (value) || result.code?.toLowerCase().includes(value)) && (!filter || filter.applyFilter (result)) && (!filterOut || !filterOut.applyFilter (result)));
}

export function filterLoaded(results: AutoInputSearchResult[], filter?: AutoInputFilter) {
    return results.filter(result => !filter || filter?.applyFilter (result));
}

/**
 * @param T string if code is used, number if id is used
 */
export interface AutoInputTypeManager {
    /**Extract data's code only, do not use Ids */
    codeOnly: boolean,
    loadByIds: (filter: AutoInputFilter, additionalValues?: any) => Promise<AutoInputSearchResult[]>,
    searchByValues: (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any) => Promise<AutoInputSearchResult[]>,
    isPresent: () => Promise<boolean>
}

export class AutoInputDebugUserManager implements AutoInputTypeManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputUserData ().then (results => {
                resolve (filterLoaded(results, filter));
            });
        });
    }

    searchByValues (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputUserData ().then (results => {
                resolve (
                    filterSearchResult(value, results, filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            getAutoInputUserData ().then (results => {
                resolve (results.length > 0);
            });
        });
    };
}

export class AutoInputCountriesManager implements AutoInputTypeManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries ().then (results => {
                resolve (results.filter (result => filter.applyFilter(result)));
            });
        });
    }

    searchByValues (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries ().then (results => {
                resolve (
                    filterSearchResult(value, results, filter, filterOut)
                );
            });
        });
    }

    isPresent (additionalValue?: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries ().then (results => {
                resolve (results.length > 0);
            });
        });
    };
}

export class AutoInputStatesManager implements AutoInputTypeManager {
    codeOnly: boolean = true;

    loadByIds (filter: AutoInputFilter): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputStates ().then (results => {
                resolve (filterLoaded(results, filter));
            });
        });
    }

    searchByValues (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, countryCode?: string): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            if (!countryCode) resolve([]);
            getAutoInputStates (countryCode!).then (results => {
                resolve (
                    filterSearchResult(value, results, filter, filterOut)
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