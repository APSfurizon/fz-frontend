import { CSSProperties } from "react";
import { getAutoInputCountries, getAutoInputStates } from "../api/authentication/register";
import { MediaData } from "../api/media";
import { translateNullable } from "../utils";

export class AutoInputSearchResult {
    id?: number;
    translatedDescription?: Record<string, string>;
    description?: string;
    code?: string;
    icon?: string;
    imageUrl?: string;
    iconCSS?: CSSProperties;
    public getDescription (locale?: string): string {
        if (this.translatedDescription && locale) {
            return this.translatedDescription[locale] ?? this.description;
        } else if (this.description) {
            return this.description;
        } else {
            return this.id?.toString() ?? this.code ?? "";
        }
    }
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
        return (data.code !== undefined && this.filteredCodes.includes(data.code.trim())) || (data.id !== undefined && this.filteredIds.includes(data.id));
    } 

    filteredCodes: string[];
    filteredIds: number[];
}

export enum SearchType {
    DEFAULT,
    RANKED,
}

export type SearchRank = {
    data: AutoInputSearchResult,
    rank: number
}

export function filterSearchResult(query: string, searchType: SearchType, results: AutoInputSearchResult[], locale?: string, filter?: AutoInputFilter, filterOut?: AutoInputFilter) {
    let value = query.trim().toLowerCase();
    const filteredResults = results.filter ((result) => (!filter || filter.applyFilter (result)) && (!filterOut || !filterOut.applyFilter (result)));
    return applySearch(value, searchType, filteredResults, locale);
}

/**
 * Applies search based on type
 * @param query the query to seach
 * @param type the type of search to use
 * @param result the search result to test
 * @param locale the current locale to get the translated description
 */
export function applySearch (query: string, searchType: SearchType, results: AutoInputSearchResult[], locale?: string): AutoInputSearchResult[] {
    
    switch(searchType) {
        case SearchType.RANKED:
            const ranked = results.map(result => {
                const translatedDescription = translateNullable(result.translatedDescription, locale)?.toLowerCase();
                const ranks: number[] = [translatedDescription ?? result.description ?? result.code]
                    .map(dsc => dsc ? dsc.toLowerCase().trim().indexOf(query.toLowerCase().trim()) : -1)
                    .filter(r=>r>-1);
                if (ranks.length == 0) ranks.push(-1);
                return {
                    data: result,
                    rank: Math.min(...ranks)
                }
            });
            return ranked.filter(r=>r.rank>-1)
                .sort((a, b)=>a.rank - b.rank)
                .map(sortedResult=>sortedResult.data);
        default:
            return results.filter(result => {
                const translatedDescription = translateNullable(result.translatedDescription, locale)?.toLowerCase();
                result.description?.toLowerCase().includes(query) ||
                result.code?.toLowerCase().includes(query) ||
                translatedDescription?.includes(query)
            });
    }
}

export function filterLoaded(results: AutoInputSearchResult[], filterIn?: AutoInputFilter, filterOut?: AutoInputFilter) {
    return results.filter(result => (filterIn?.applyFilter (result) ?? true) && (!(filterOut?.applyFilter (result) ?? false)));
}

/**
 * Manages the autoinput fetching logic, from search to loading prefilled data
 * @param codeOnly string if code is used, number if id is used
 */
export interface AutoInputManager {
    /**Extract data's code only, do not use Ids */
    codeOnly: boolean,
    /**
     * 
     * @param filter filter out anything
     * @param customIdExtractor a custom way to extract the data from the item
     * @param additionalValues additional values to be used as search params
     */
    loadByIds: (filter: AutoInputFilter, customIdExtractor?: (r: AutoInputSearchResult) => string | number,
        additionalValues?: any) => Promise<AutoInputSearchResult[]>,
    /**
     * Executes a full text search
     * @param value the query to look
     * @param locale the locale to use to translate the items
     * @param filter filter out every item that's not in this filter
     * @param filterOut filter out every item that's in this filter
     * @param additionalValues additional values to be used as search params
     */
    searchByValues: (value: string, locale?: string,
        filter?: AutoInputFilter, filterOut?: AutoInputFilter,
        additionalValues?: any) => Promise<AutoInputSearchResult[]>,

    /**
     * To be used with requiresParam in autoinput, enables the component whenever the parameter is initialized and there are search results that are selectable
     * @param additionalValues  additional values to be used as search params
     */
    isPresent: (additionalValues?: any) => Promise<boolean>
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
                })
                resolve (results.filter (result => filter.applyFilter(result)));
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