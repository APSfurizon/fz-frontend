import { SelectGroup, SelectItem } from "@/lib/components/fpSelect";
import { inputEntityIdExtractor, InputEntity } from "@/lib/components/input";
import { TranslatableInputEntity } from "@/lib/translations";
import { areEquals } from "@/lib/utils";
import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";
import "@/styles/components/fpSelect.css";
import { useLocale } from "next-intl";
import { useFormContext } from "./dataForm";

export default function FpSelect({
    items, className, style, labelStyle, label, hasError = false,
    onChange, placeholder, readOnly = false, required = false,
    disabled = false, initialValue = "", fieldName, inputStyle,
    itemExtractor = inputEntityIdExtractor
}: Readonly<{
    fieldName?: string,
    items: (SelectGroup | SelectItem)[],
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
    itemExtractor?: (entity: InputEntity) => string | number,
    hasError?: boolean
}>) {
    const locale = useLocale();
    const [selectedItem, setSelectedItem] = useState<InputEntity>();
    const [lastInitialValue, setLastInitialValue] = useState<string | number>();
    const [mappedItems, setMappedItems] = useState<Record<string, InputEntity>>();
    const { formReset = false, formDisabled = false, onFormChange, formLoading } = useFormContext();
    const defaultValue = useMemo(() => required && mappedItems ? mappedItems[Object.keys(mappedItems)[0]] : undefined, [mappedItems]);
    const selectDefaultValue = useMemo(() => {
        if (selectedItem) {
            return itemExtractor(selectedItem);
        } else if (defaultValue) {
            return itemExtractor(defaultValue);
        }
    }, [selectedItem, defaultValue]);
    const isDisabled = formDisabled || disabled || formLoading;

    function getMappedItems(items: (SelectGroup | SelectItem)[]): Record<string, InputEntity> {
        let mappedItems: Record<string, InputEntity> = {};
        for (const item of items) {
            if (item instanceof SelectGroup) {
                mappedItems = { ...mappedItems, ...getMappedItems(item.items) };
            } else if (item instanceof SelectItem) {
                const extractedId = itemExtractor(item);
                if (!extractedId) continue;
                mappedItems[extractedId] = item;
            }
        }
        return mappedItems;
    }

    // Re-map items when they change
    useEffect(() => {
        if (!items) {
            setSelectedItem(undefined);
            return;
        }
        setMappedItems(getMappedItems(items));
    }, [items])

    useEffect(() => {
        if (mappedItems && Object.keys(mappedItems ?? {}).length > 0 && initialValue !== undefined && (!areEquals(initialValue, lastInitialValue) || formReset)) {
            setSelectedItem(mappedItems[initialValue]);
            setLastInitialValue(initialValue);
        } else if (formReset) {
            setSelectedItem(undefined);
            onFormChange(fieldName);
        }
    }, [initialValue, mappedItems]);

    const renderItems = (items: (SelectGroup | SelectItem)[]) => {
        return <>
            {items.map((item, idx) => {
                if (item instanceof SelectGroup) {
                    return <optgroup key={idx}
                        label={item.getDescription()}
                        className="title average color-subtitle reset">
                        {renderItems(item.items)}
                    </optgroup>
                } else if (item instanceof SelectItem) {
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
        if (onChange) onChange(valueToSet);
        if (onFormChange) onFormChange(fieldName);
    }

    return <>
        <div className={`fp-input ${className ?? ""}`} style={{ ...style }}>
            {label && <label className={`title semibold small margin-bottom-1mm ${required ? "required" : ""}`}
                style={{ ...labelStyle }}>{label}</label>}
            <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName}
                defaultValue={selectDefaultValue} required={required}></input>
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                <select disabled={readOnly || isDisabled} aria-readonly={readOnly}
                    value={selectedItem && itemExtractor(selectedItem)}
                    style={{ ...inputStyle }}
                    onChange={onSelect}
                    className={`input-field title ${hasError ? "danger" : ""}`}>
                    <option disabled={required} className="title average italic" value="">{placeholder}</option>
                    {renderItems(items)}
                </select>
            </div>
        </div>
    </>
}