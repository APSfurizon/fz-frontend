import { ComboboxGroup, ComboboxItem } from "@/lib/components/combobox";
import { inputEntityIdExtractor, InputEntity } from "@/lib/components/input";
import { TranslatableInputEntity } from "@/lib/translations";
import { areEquals } from "@/lib/utils";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import "@/styles/components/combobox.css";
import { useLocale } from "next-intl";

export default function ComboBox({
    items, className, style, labelStyle, label, hasError = false,
    onChange, placeholder, readOnly = false, required = false,
    disabled = false, initialValue = "", fieldName, inputStyle,
    itemExtractor = inputEntityIdExtractor
}: Readonly<{
    fieldName: string,
    items: (ComboboxGroup|ComboboxItem)[],
    className?: string,
    style?: CSSProperties,
    labelStyle?: CSSProperties,
    label?: string,
    multiple?: boolean,
    onChange?: (selected?: TranslatableInputEntity) => void,
    placeholder?: string,
    readOnly?: boolean,
    required?: boolean,
    disabled?: boolean,
    initialValue?: string,
    inputStyle?: CSSProperties,
    itemExtractor?: (entity: InputEntity) => string|number,
    hasError?: boolean
}>) {
    const locale = useLocale();
    const [selectedItem, setSelectedItem] = useState<InputEntity> ();
    const [lastInitialValue, setLastInitialValue] = useState<string | number>();
    const [mappedItems, setMappedItems] = useState<Record<string, InputEntity>> ();

    function getMappedItems (items: (ComboboxGroup|ComboboxItem)[]): Record<string, InputEntity> {
        let mappedItems: Record<string, InputEntity> = {};
        for (const item of items) {
            if (item instanceof ComboboxGroup) {
                mappedItems = {...mappedItems, ...getMappedItems(item.items)};
            } else if (item instanceof ComboboxItem) {
                const extractedId = itemExtractor(item);
                if (!extractedId) continue;
                mappedItems[extractedId] = item;
            }
        }
        return mappedItems;
    }

    useEffect (()=>{
        if (!items) {
            setSelectedItem(undefined);
            return;
        }
        setMappedItems(getMappedItems(items));
    }, [items])

    useEffect(()=>{
        if (mappedItems && !areEquals(initialValue, lastInitialValue)) {
            setSelectedItem(mappedItems[initialValue]);
        }
        setLastInitialValue(initialValue);
    }, [initialValue]);

    const renderItems = (items: (ComboboxGroup|ComboboxItem)[]) => {
        return <>
            {items.map((item, idx)=>{
                if (item instanceof ComboboxGroup) {
                    return <optgroup key={idx}
                        label={item.getDescription()}
                        className="title average color-subtitle reset">
                            {renderItems(item.items)}
                    </optgroup>
                } else if (item instanceof ComboboxItem) {
                    return <option key={idx} value={itemExtractor(item)} className="title small">
                            {item.getDescription(locale)}
                    </option>
                } else {
                    return null;
                }
            })}
        </>
    }

    const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        if (!mappedItems || selectedValue === undefined) return;
        const valueToSet = mappedItems[selectedValue];
        setSelectedItem(valueToSet);
        if(onChange) onChange(valueToSet);
    }

    return <>
        <div className={`jan-input ${className ?? ""}`} style={{...style}}>
            {label && <label className={`title semibold small margin-bottom-1mm ${required ? "required" : ""}`}
                style={{...labelStyle}}>{label}</label>}
            <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName}
                defaultValue={selectedItem ? itemExtractor(selectedItem) : ""} required={required}></input>
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                <select disabled={readOnly || disabled} required={required} aria-readonly={readOnly}
                    defaultValue={selectedItem && itemExtractor(selectedItem)}
                    style={{...inputStyle}} onChange={onSelect}
                    className={`input-field title ${hasError ? "danger" : ""}`}>
                        <option disabled={required} className="title average italic" value="">{placeholder}</option>
                        {renderItems(items)}
                </select>
            </div>
        </div>
    </>
}