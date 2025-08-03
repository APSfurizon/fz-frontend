import { CSSProperties } from "react";
import { InputEntity } from "./components/input";
import { MaterialIcon } from "@/components/icon";

export type TranslatableString = Record<string, string>;

export function translate(data: Record<string, string>, locale: string, fallback: boolean = true): string {
    if (fallback) {
        return data ? data[locale] ?? data["en"] ?? Object.values(data)[0] : "";
    } else {
        return data ? data[locale] ?? "" : "";
    }
    
}

export function translateNullable(data?: Record<string, string>, locale?: string,
    fallback: boolean = true): string | undefined {
        if (fallback) {
            return data && locale ? data[locale] ?? data["en"] ?? Object.values(data)[0] : undefined;
        } else {
            return data && locale ? data[locale] ?? undefined : undefined;
        }
}

export class TranslatableInputEntity extends InputEntity {
    translatedDescription?: TranslatableString;
    public getDescription (locale?: string): string {
        return translateNullable(this.translatedDescription, locale, false)
        ?? this.description
        ?? this.id?.toString()
        ?? this.code
        ?? "";
    }
    constructor(id?: number, code?: string, description?: string,
        icon?: MaterialIcon, imageUrl?: string, iconCSS?: CSSProperties,
        translatedDescription?: TranslatableString) {
            super (id, code, description, icon, imageUrl, iconCSS);
            this.translatedDescription = translatedDescription;
    }
}