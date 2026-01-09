import { CSSProperties } from "react";
import { InputEntity } from "./components/input";
import { MaterialIcon } from "@/components/icon";
import { DEFAULT_TRANSLATION_KEY } from "./constants";

export type TranslatableString = Record<string, string>;

export function translate(data: Record<string, string>, locale: string, fallback: boolean = true): string {
    const key = locale.toLowerCase();
    const partial = key.replace("-", "_").split("_")[0];
    if (fallback) {
        return data ? data[key] ?? data[partial] ?? data[DEFAULT_TRANSLATION_KEY] ?? Object.values(data)[0] : "";
    } else {
        return data ? data[key] ?? data[partial] ?? "" : "";
    }
    
}

export function translateNullable(data?: Record<string, string>, locale?: string,
    fallback: boolean = true): string | undefined {
        const key = locale?.toLowerCase();
        const partial = key?.replace("-", "_").split("_")[0];
        if (fallback) {
            return data && key && partial
                ? data[key] ?? data[partial] ?? data[DEFAULT_TRANSLATION_KEY] ?? Object.values(data)[0]
                : undefined;
        } else {
            return data && key && partial ? data[key] ?? data[partial] ?? undefined : undefined;
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