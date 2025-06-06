import { CSSProperties } from "react";

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
    icon?: string;
    imageUrl?: string;
    iconCSS?: CSSProperties;
    public getDescription (locale?: string): string {
        return this.description
        ?? this.id?.toString()
        ?? this.code
        ?? "";
    }
    constructor(id?: number, code?: string, description?: string,
        icon?: string, imageUrl?: string, iconCSS?: CSSProperties) {
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