import { TranslatableInputEntity, TranslatableString } from "../translations";

export class ComboboxItem extends TranslatableInputEntity {}

export interface ComboboxGroup {
    label: string,
    description?: string;
    translatedDescription: TranslatableString,
    items: ComboboxItem[]
}