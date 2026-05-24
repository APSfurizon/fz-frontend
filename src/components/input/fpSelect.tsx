import { SelectGroup, SelectItem } from "@/lib/components/fpSelect";
import { inputEntityIdExtractor, InputEntity } from "@/lib/components/input";
import { TranslatableInputEntity } from "@/lib/translations";
import { areEquals } from "@/lib/utils";
import { ChangeEvent, CSSProperties, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useFormContext } from "./dataForm";
import Icon, { MaterialIcon } from "../icon";
import Image from "next/image";
import "@/styles/components/fpSelect.scss";

type FpSelectProps = {
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
    itemExtractor?: (entity: TranslatableInputEntity) => string | number | undefined,
    hasError?: boolean,
    helpText?: string | React.ReactNode
};

export default function FpSelect({
    items, className, style, labelStyle, label, hasError = false,
    onChange, placeholder, readOnly = false, required = false,
    disabled = false, initialValue = "", fieldName, inputStyle,
    itemExtractor = inputEntityIdExtractor, helpText
}: Readonly<FpSelectProps>) {
    const locale = useLocale();
    const [selectedItem, setSelectedItem] = useState<TranslatableInputEntity>();
    const [lastInitialValue, setLastInitialValue] = useState<string | number>();
    const mappedItems = useMemo(() => getMappedItems(items), [items]);
    const { formReset = false, formDisabled = false, onFormChange, formLoading } = useFormContext();
    const defaultValue = useMemo(() => required && mappedItems ? mappedItems[Object.keys(mappedItems)[0]] : undefined, [mappedItems]);
    const selectDefaultValue = useMemo(() => {
        const item = selectedItem ?? defaultValue;
        return item ? itemExtractor(item) ?? "" : "";
    }, [selectedItem, defaultValue]);
    const isDisabled = formDisabled || disabled || formLoading;

    function getMappedItems(items: (SelectGroup | SelectItem)[]): Record<string, TranslatableInputEntity> {
        let mappedItems: Record<string, TranslatableInputEntity> = {};
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
    }, [items]);

    /**
     * Whether to reserve space for icons and images of items, for added ui stability
     */
    const shouldReserveMediaSpace = useMemo(() => [
        ...items.filter(i => i instanceof SelectItem),
        ...items.filter(i => i instanceof SelectGroup).flatMap(i => i.items)
    ].some(i => i.icon || i.imageUrl), [items]);

    useEffect(() => {
        if (mappedItems && Object.keys(mappedItems ?? {}).length > 0 && initialValue !== undefined && (!areEquals(initialValue, lastInitialValue) || formReset)) {
            setSelectedItem(mappedItems[initialValue]);
            setLastInitialValue(initialValue);
        } else if (formReset) {
            setSelectedItem(mappedItems ? mappedItems[initialValue] : undefined);
            if (onFormChange) onFormChange(fieldName);
        }
    }, [initialValue, mappedItems, formReset]);

    const onSelect = useCallback((id?: string | number | null) => {
        if (!mappedItems || id === undefined) return;
        const valueToSet = id ? mappedItems[id] : undefined;
        setSelectedItem(valueToSet);
        if (onChange) onChange(valueToSet);
        if (onFormChange) onFormChange(fieldName, valueToSet ? itemExtractor(valueToSet) : null);
        popoverRef.current?.hidePopover();
    }, [mappedItems, items]);

    /**Select component label */
    const selectLabel = `fpSelect-${fieldName}-${useId()}`;
    const selectPopoverId = `fpSelect-popover-${fieldName}-${useId()}`;
    const anchorNameStyle: CSSProperties = { anchorName: `--${selectLabel}` };
    const positionAnchorStyle: CSSProperties = { positionAnchor: `--${selectLabel}` };

    const isSelected = useCallback((item: TranslatableInputEntity) => {
        if (!selectedItem) return false;
        return itemExtractor(selectedItem) === itemExtractor(item);
    }, [selectedItem])

    const renderItems = useCallback((toRender: (SelectGroup | SelectItem)[]) => {
        return toRender.map((item, index) => {
            if (item instanceof SelectGroup) {
                return <div key={index}
                    tabIndex={-1}
                    className="fp-select__group"
                    role="group">
                    <span className="fp-select__group__header title bold average color-subtitle reset">
                        {item.getDescription(locale)}
                    </span>
                    <div className="fp-select__group__items">
                        {renderItems(item.items)}
                    </div>
                </div>
            } else {
                return <button key={index}
                    type="button"
                    tabIndex={0}
                    onClick={() => onSelect(itemExtractor(item))}
                    className={[
                        "fp-select__option",
                        "rounded-s",
                        "horizontal-list",
                        "align-items-center",
                        "gap-2mm",
                        isSelected(item) ? "fp-select__option--selected" : ""
                    ].join(" ")}
                    aria-selected={isSelected(item)}>
                    {shouldReserveMediaSpace && (item.icon || item.imageUrl
                        ? <>
                            {item.icon && <Icon style={item.iconCSS} icon={item.icon as MaterialIcon} />}
                            {item.imageUrl && <Image alt="" className="rounded-l" unoptimized width={32} height={32} src={item.imageUrl} />}
                        </>
                        : <div className="fp-select__filler" style={{ width: 32, height: 32 }}></div>
                    )}
                    <span className="title small">
                        {item.getDescription(locale)}
                    </span>
                </button>
            }
        })
    }, [shouldReserveMediaSpace, selectedItem]);

    const popoverRef = useRef<HTMLDivElement>(null);
    const [listOpen, setListOpen] = useState(false);
    useEffect(() => {
        const toggleListener = (e: ToggleEvent) => {
            setListOpen(e.newState === "open");
        };
        popoverRef.current?.addEventListener("beforetoggle", toggleListener);
        return () => popoverRef.current?.removeEventListener("beforetoggle", toggleListener);
    }, []);

    return <>
        <div className={`fp-input ${className ?? ""}`}
            style={style}>
            {label && <label htmlFor={selectLabel} className={`title semibold small margin-bottom-1mm ${required ? "required" : ""}`}
                style={{ ...labelStyle }}>{label}</label>}
            <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName}
                defaultValue={selectDefaultValue} required={required}></input>
            <button role="listbox"
                type="button"
                disabled={isDisabled}
                popoverTarget={selectPopoverId}
                className={[
                    "input-container",
                    "horizontal-list",
                    "align-items-center",
                    "rounded-s",
                    "margin-bottom-1mm",
                    listOpen ? "input-container--open" : ""
                ].join(" ")}
                style={{ ...anchorNameStyle }}>
                {shouldReserveMediaSpace && (selectedItem && (selectedItem.icon || selectedItem.imageUrl)
                    ? <>
                        {selectedItem.icon && <Icon style={selectedItem.iconCSS} icon={selectedItem.icon as MaterialIcon} />}
                        {selectedItem.imageUrl && <Image alt="" className="rounded-l" unoptimized width={32} height={32} src={selectedItem.imageUrl} />}
                    </>
                    : <div className="fp-select__filler" style={{ width: 32, height: 32 }}></div>
                )}
                {selectedItem && <span className="fp-select__text title small">
                    {selectedItem?.getDescription(locale) ?? placeholder}
                </span>}
                {!selectedItem && <span className="fp-select__text title small color-subtitle">
                    {placeholder}
                </span>}
                <div className="spacer"></div>
                <Icon containerClassName="fp-select__chevron" icon="ARROW_DROP_DOWN" />
            </button>
            {helpText &&
                <span className="help-text tiny descriptive color-subtitle">
                    {helpText}
                </span>}
        </div>
        <div className="fp-select__list rounded-s"
            popover="auto"
            ref={popoverRef}
            id={selectPopoverId}
            style={positionAnchorStyle}>
            {!required && <div className="rounded-s fp-select__option fp-select__option--empty"
                onClick={() => onSelect(null)}></div>}
            {renderItems(items)}
        </div >
    </>
}