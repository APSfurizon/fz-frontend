import { getAutoInputUserData } from "../debug";

export interface AutoInputSearchResult {
    id: number,
    description: string,
    imageUrl?: string
}

export interface AutoInputTypeManager {
    loadByIds: (ids: number[]) => Promise<AutoInputSearchResult[]>,
    searchByValues: (value: string, filterIds?: number[]) => Promise<AutoInputSearchResult[]>,
}

export enum AutoInputType {
    USER,
    DEBUG_USER
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

    searchByValues (value: string, filterIds?: number[]): Promise<AutoInputSearchResult[]> {
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

export function getAutoInputTypeManager (type: AutoInputType): AutoInputTypeManager | undefined {
    switch (type) {
        case AutoInputType.DEBUG_USER:
            return AutoInputDebugUserManager.get();
        default:
            return undefined;
    }
}
