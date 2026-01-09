import { MaterialIcon } from "@/components/icon";
import { CSSProperties } from "react";
import { dateToParam } from "../utils";


const HUNDRED_DAYS_IN_SECONDS = 3155760000;
/*** 100 years up to today */
export const HUNDRED_YEARS_BEFORE_TODAY = new Date((new Date().getTime() / 1000 - HUNDRED_DAYS_IN_SECONDS) * 1000);
export const HUNDRED_YEARS_AFTER_TODAY = new Date((new Date().getTime() / 1000 + HUNDRED_DAYS_IN_SECONDS) * 1000);
export const MIN_DATE = dateToParam(HUNDRED_YEARS_BEFORE_TODAY);
export const MAX_DATE = dateToParam(HUNDRED_YEARS_AFTER_TODAY);

/**
 * Defines an entity that points to a specific object or table in the backend.
 * 
 * MUST have at least a code or a numeric id, can also have both.
 * 
 * can have a dedicated image, description and icon
 */
export class InputEntity {
    id?: number;
    code?: string;
    description?: string;
    icon?: MaterialIcon | string;
    imageUrl?: string;
    iconCSS?: CSSProperties;
    public getDescription (): string {
        return this.description
        ?? this.id?.toString()
        ?? this.code
        ?? "";
    }
    constructor(id?: number, code?: string, description?: string,
        icon?: MaterialIcon, imageUrl?: string, iconCSS?: CSSProperties) {
            this.id = id;
            this.code = code;
            this.description = description;
            this.icon = icon;
            this.imageUrl = imageUrl;
            this.iconCSS = iconCSS;
    }
}

export const inputEntityIdExtractor = (entity: InputEntity) => {
    if (!entity.id) throw `Invalid id on entity ${JSON.stringify(entity)}`;
    return entity.id;
}

export const inputEntityCodeExtractor = (entity: InputEntity) => {
    if (!entity.code) throw `Invalid code on entity ${JSON.stringify(entity)}`;
    return entity.code;
}