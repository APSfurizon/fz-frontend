import { getAutoInputCountries, getAutoInputStates } from "../api/register";
import { getAutoInputUserData } from "../debug";

export interface AutoInputSearchResult {
    id: number,
    description: string,
    code?: string,
    icon?: string,
    imageUrl?: string,
}

export interface AutoInputTypeManager {
    loadByIds: (ids: number[]) => Promise<AutoInputSearchResult[]>,
    searchByValues: (value: string, filterIds?: number[], additionalValues?: any) => Promise<AutoInputSearchResult[]>,
}

export enum AutoInputType {
    USER,
    DEBUG_USER,
    COUNTRIES,
    STATES
}

export class AutoInputDebugUserManager implements AutoInputTypeManager {
    static singleton?: AutoInputDebugUserManager;

    static get (): AutoInputDebugUserManager {
        if (!AutoInputDebugUserManager.singleton) AutoInputDebugUserManager.singleton = new AutoInputDebugUserManager();
        return AutoInputDebugUserManager.singleton;
    }

    loadByIds (ids: number[]): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputUserData ().then (results => {
                resolve (results.filter (result => ids.includes (result.id)));
            });
        });
    }

    searchByValues (value: string, filterIds?: number[], additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputUserData ().then (results => {
                resolve (
                    results.filter (
                        result => result.description.toLowerCase().includes (value.toLowerCase()) 
                        && !(filterIds ?? []).includes (result.id)
                    )
                );
            });
        });
    }
}

export class AutoInputCountriesManager implements AutoInputTypeManager {
    static singleton?: AutoInputCountriesManager;
    static get (): AutoInputCountriesManager {
        if (!AutoInputCountriesManager.singleton) AutoInputCountriesManager.singleton = new AutoInputCountriesManager();
        return AutoInputCountriesManager.singleton;
    }

    loadByIds (ids: number[]): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries ().then (results => {
                resolve (results.filter (result => ids.includes (result.id)));
            });
        });
    }

    searchByValues (value: string, filterIds?: number[]): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries ().then (results => {
                resolve (
                    results.filter (
                        result => result.description.toLowerCase().includes (value.toLowerCase()) 
                        && !(filterIds ?? []).includes (result.id)
                    )
                );
            });
        });
    }
}

export class AutoInputStatesManager implements AutoInputTypeManager {
    static singleton?: AutoInputStatesManager;
    static get (): AutoInputStatesManager {
        if (!AutoInputStatesManager.singleton) AutoInputStatesManager.singleton = new AutoInputStatesManager();
        return AutoInputStatesManager.singleton;
    }

    loadByIds (ids: number[]): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputCountries ().then (results => {
                resolve (results.filter (result => ids.includes (result.id)));
            });
        });
    }

    searchByValues (value: string, filterIds?: number[], additionalValues?: any): Promise<AutoInputSearchResult[]> {
        return new Promise((resolve, reject) => {
            getAutoInputStates (additionalValues).then (results => {
                resolve (
                    results.filter (
                        result => result.description.toLowerCase().includes (value.toLowerCase()) 
                        && !(filterIds ?? []).includes (result.id)
                    )
                );
            });
        });
    }
}

export function getAutoInputTypeManager (type: AutoInputType): AutoInputTypeManager | undefined {
    switch (type) {
        case AutoInputType.DEBUG_USER:
            return AutoInputDebugUserManager.get();
        case AutoInputType.COUNTRIES:
            return AutoInputCountriesManager.get();
        case AutoInputType.STATES:
            return AutoInputStatesManager.get();
        default:
            return undefined;
    }
}
