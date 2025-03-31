import { TranslatableInputEntity, TranslatableString, translateNullable } from "../translations";

export class ComboboxItem extends TranslatableInputEntity {}

export class ComboboxGroup {
    description?: string;
    translatedDescription?: TranslatableString;
    items: ComboboxItem[] = [];
    public getDescription (locale?: string): string {
        return translateNullable(this.translatedDescription, locale, false)
        ?? this.description
        ?? "";
    }
    constructor(items: ComboboxItem[], description?: string, translatedDescription?: TranslatableString) {
        this.items = items;
        this.description = description;
        this.translatedDescription = translatedDescription;
    }

}