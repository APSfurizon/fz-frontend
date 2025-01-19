import { getAutoInputCountries, getAutoInputStates } from "../api/authentication/register";
import { MediaData } from "../api/media";

export interface AutoInputSearchResult {
    id?: number,
    description?: string,
    code?: string,
    icon?: string,
    imageUrl?: string,
}

export interface UserSearchResult extends Partial<AutoInputSearchResult> {
   propic: MediaData
}

export class AutoInputFilter {
    constructor(ids: number[], codes: string[]) {
        this.filteredIds = ids;
        this.filteredCodes = codes;
    }

    static getForSelected (type: AutoInputManager, data: (string | number)[]): AutoInputFilter {
        let ids: number[] = [];
        let codes: string[] = [];
        if (type.codeOnly) {
            codes = data as string[];
        } else {
            ids = data as number[];
        }
        return new AutoInputFilter(ids, codes);
    }

    merge(toMerge: AutoInputFilter) {
        this.filteredCodes = Array.from(new Set([...this.filteredCodes, ...toMerge.filteredCodes]));
        this.filteredIds = Array.from(new Set([...this.filteredIds, ...toMerge.filteredIds]))
        return new AutoInputFilter (this.filteredIds, this.filteredCodes);
    }

    applyFilter(data: AutoInputSearchResult): boolean {
        return data.code != undefined && this.filteredCodes.includes(data.code.trim()) || data.id != undefined && this.filteredIds.includes(data.id);
    } 

    filteredCodes: string[];
    filteredIds: number[];
}

export function filterSearchResult(query: string, results: AutoInputSearchResult[], filter?: AutoInputFilter, filterOut?: AutoInputFilter) {
    let value = query.trim().toLowerCase();
    return results.filter ((result) => (result.description?.toLowerCase().includes (value) || result.code?.toLowerCase().includes(value)) && (!filter || filter.applyFilter (result)) && (!filterOut || !filterOut.applyFilter (result)));
}

export function filterLoaded(results: AutoInputSearchResult[], filterIn?: AutoInputFilter, filterOut?: AutoInputFilter) {
    return results.filter(result => (filterIn?.applyFilter (result) ?? true) && (!filterOut?.applyFilter (result) || true));
}

/**
 * @param T string if code is used, number if id is used
 */
export interface AutoInputManager {
    /**Extract data's code only, do not use Ids */
    codeOnly: boolean,
    loadByIds: (filter: AutoInputFilter, customIdExtractor?: (r: AutoInputSearchResult) => string | number, additionalValues?: any) => Promise<AutoInputSearchResult[]>,
    searchByValues: (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any) => Promise<AutoInputSearchResult[]>,
    isPresent: (additionalValues?: any) => Promise<boolean>
}

export interface CountrySearchResult extends AutoInputSearchResult {
    phonePrefix?: string
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
                })
                resolve (results.filter (result => filter.applyFilter(result as AutoInputSearchResult)) as CountrySearchResult[]);
            });
        });
    }

    searchByValues (value: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter, additionalValues?: any): Promise<CountrySearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries (this.showNumber).then (results => {
                resolve (
                    filterSearchResult(value, results, filter, filterOut) as CountrySearchResult[]
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

    loadByIds (filter: AutoInputFilter, customIdExtractor?: (r: AutoInputSearchResult) => string | number, additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputStates (additionalValues[0]).then (results => {
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