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
}