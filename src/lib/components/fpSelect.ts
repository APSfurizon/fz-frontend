import { TranslatableInputEntity, TranslatableString, translateNullable } from "../translations";

export class SelectItem extends TranslatableInputEntity {}

export class SelectGroup {
    description?: string;
    translatedDescription?: TranslatableString;
    items: SelectItem[] = [];
    public getDescription (locale?: string): string {
        return translateNullable(this.translatedDescription, locale, false)
        ?? this.description
        ?? "";
    }
    constructor(items: SelectItem[], description?: string, translatedDescription?: TranslatableString) {
        this.items = items;
        this.description = description;
        this.translatedDescription = translatedDescription;
    }

}