import { OptionRendererParams, SelectGroup, SelectItem } from "@/lib/components/fpSelect";
import { inputEntityIdExtractor } from "@/lib/components/input";
import { TranslatableInputEntity } from "@/lib/translations";
import { areEquals } from "@/lib/utils";
import "@/styles/components/fpSelect.scss";
import { useLocale } from "next-intl";
import Image from "next/image";
import { CSSProperties, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "../icon";
import { useFormContext } from "./dataForm";

type FpSelectProps = {
  fieldName?: string;
  items: (SelectGroup | SelectItem)[];
  className?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  label?: string;
  multiple?: boolean;
  onChange?: (selected?: TranslatableInputEntity) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  disabled?: boolean;
  initialValue?: string;
  itemExtractor?: (entity: TranslatableInputEntity) => string | number | undefined;
  hasError?: boolean;
  helpText?: string | React.ReactNode;
  optionRenderer?: (params: OptionRendererParams) => React.ReactNode;
};

export default function FpSelect({
  items,
  className,
  style,
  labelStyle,
  label,
  onChange,
  placeholder,
  readOnly = false,
  required = false,
  disabled = false,
  initialValue,
  fieldName,
  itemExtractor = inputEntityIdExtractor,
  helpText,
  optionRenderer,
}: Readonly<FpSelectProps>) {
  const locale = useLocale();
  const [selectedItem, setSelectedItem] = useState<TranslatableInputEntity>();
  const [lastInitialValue, setLastInitialValue] = useState<string | number>();
  const mappedItems = useMemo(() => getMappedItems(items), [items]);
  const { formReset = false, formDisabled = false, onFormChange, formLoading } = useFormContext();

  const defaultItem = useMemo(
    () => (required && mappedItems ? [...mappedItems.values()][0] : undefined),
    [mappedItems]
  );
  const defaultItemValue = useMemo(() => {
    const item = selectedItem ?? defaultItem;
    return item ? (itemExtractor(item) ?? "") : "";
  }, [selectedItem, defaultItem]);

  const isDisabled = formDisabled || disabled || formLoading || readOnly;

  function getMappedItems(items: (SelectGroup | SelectItem)[]): Map<string, TranslatableInputEntity> {
    let toReturn: Map<string, TranslatableInputEntity> = new Map();
    for (const item of items) {
      if (item instanceof SelectGroup) {
        toReturn = new Map([...toReturn.entries(), ...getMappedItems(item.items).entries()]);
      } else if (item instanceof SelectItem) {
        const extractedId = itemExtractor(item);
        if (!extractedId) continue;
        toReturn.set(String(extractedId), item);
      }
    }
    return toReturn;
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
  const shouldReserveMediaSpace = useMemo(
    () =>
      [
        ...items.filter((i) => i instanceof SelectItem),
        ...items.filter((i) => i instanceof SelectGroup).flatMap((i) => i.items),
      ].some((i) => i.icon || i.imageUrl),
    [items]
  );

  const onSelect = useCallback(
    (id?: string | number | null) => {
      if (!mappedItems || id === undefined) return;
      const valueToSet = id ? mappedItems.get(String(id)) : undefined;
      setSelectedItem(valueToSet);
      if (onChange) onChange(valueToSet);
      if (onFormChange) onFormChange(fieldName, valueToSet ? itemExtractor(valueToSet) : null);
      popoverRef.current?.hidePopover();
    },
    [mappedItems]
  );

  useEffect(() => {
    if (
      mappedItems &&
      [...mappedItems.keys()].length > 0 &&
      initialValue !== undefined &&
      (!areEquals(initialValue, lastInitialValue) || formReset)
    ) {
      setSelectedItem(mappedItems.get(initialValue));
      setLastInitialValue(initialValue);
    } else if (formReset) {
      setSelectedItem(mappedItems && initialValue ? mappedItems.get(initialValue) : undefined);
      if (onFormChange) onFormChange(fieldName);
    }
  }, [initialValue, mappedItems, formReset]);

  /**Select component label */
  const selectLabel = `fpSelect-${fieldName}-${useId()}`;
  const selectPopoverId = `fpSelect-popover-${fieldName}-${useId()}`;
  const anchorNameStyle: CSSProperties = { anchorName: `--${selectLabel}` };
  const positionAnchorStyle: CSSProperties = { positionAnchor: `--${selectLabel}` };

  const isSelected = useCallback(
    (item: TranslatableInputEntity) => {
      if (!selectedItem) return false;
      return itemExtractor(selectedItem) === itemExtractor(item);
    },
    [selectedItem]
  );

  const renderSelectItem = (item: SelectItem) =>
    optionRenderer ? (
      optionRenderer({
        id: itemExtractor(item),
        item,
        selected: isSelected(item),
        onClick: () => onSelect(itemExtractor(item)),
      })
    ) : (
      <button
        key={itemExtractor(item)}
        type="button"
        tabIndex={0}
        onClick={() => onSelect(itemExtractor(item))}
        className={[
          "fp-select__option",
          "rounded-s",
          "horizontal-list",
          "align-items-center",
          "gap-2mm",
          isSelected(item) ? "fp-select__option--selected" : "",
        ].join(" ")}
      >
        {shouldReserveMediaSpace &&
          (item.icon || item.imageUrl ? (
            <>
              {item.icon && <Icon style={item.iconCSS} icon={item.icon} />}
              {item.imageUrl && (
                <Image alt="" className="rounded-l" unoptimized width={32} height={32} src={item.imageUrl} />
              )}
            </>
          ) : (
            <div className="fp-select__filler" style={{ width: 32, height: 32 }}></div>
          ))}
        <span className="title small">{item.getDescription(locale)}</span>
      </button>
    );

  const renderSelectList = (toRender: (SelectGroup | SelectItem)[]) => {
    return toRender.map((item, index) => {
      if (item instanceof SelectGroup) {
        return (
          <div key={index} tabIndex={-1} className="fp-select__group" role="group">
            <span className="fp-select__group__header title bold average color-subtitle reset">
              {item.getDescription(locale)}
            </span>
            <div className="fp-select__group__items">{item.items.map((item) => renderSelectItem(item))}</div>
          </div>
        );
      } else {
        return renderSelectItem(item);
      }
    });
  };

  const popoverRef = useRef<HTMLDivElement>(null);
  const [listOpen, setListOpen] = useState(false);
  useEffect(() => {
    const toggleListener = (e: ToggleEvent) => {
      setListOpen(e.newState === "open");
    };
    popoverRef.current?.addEventListener("beforetoggle", toggleListener);
    return () => popoverRef.current?.removeEventListener("beforetoggle", toggleListener);
  }, []);

  return (
    <>
      <div className={`fp-input ${className ?? ""}`} style={style}>
        {label && (
          <label
            htmlFor={selectLabel}
            className={`title semibold small margin-bottom-1mm ${required ? "required" : ""}`}
            style={{ ...labelStyle }}
          >
            {label}
          </label>
        )}
        <input
          tabIndex={-1}
          className="suppressed-input"
          aria-hidden
          type="text"
          name={fieldName}
          value={defaultItemValue ?? ""}
          required={required}
          readOnly
        ></input>
        <button
          role="listbox"
          type="button"
          disabled={isDisabled}
          popoverTarget={selectPopoverId}
          className={[
            "input-container",
            "horizontal-list",
            "align-items-center",
            "rounded-s",
            "margin-bottom-1mm",
            listOpen ? "input-container--open" : "",
          ].join(" ")}
          style={{ ...anchorNameStyle }}
        >
          {shouldReserveMediaSpace &&
            (selectedItem && (selectedItem.icon || selectedItem.imageUrl) ? (
              <>
                {selectedItem.icon && <Icon style={selectedItem.iconCSS} icon={selectedItem.icon} />}
                {selectedItem.imageUrl && (
                  <Image alt="" className="rounded-l" unoptimized width={32} height={32} src={selectedItem.imageUrl} />
                )}
              </>
            ) : (
              <div className="fp-select__filler" style={{ width: 32, height: 32 }}></div>
            ))}
          {selectedItem && (
            <span className="fp-select__text title small">{selectedItem?.getDescription(locale) ?? placeholder}</span>
          )}
          {!selectedItem && <span className="fp-select__text title small color-subtitle">{placeholder}</span>}
          <div className="spacer"></div>
          <Icon containerClassName="fp-select__chevron" icon="ARROW_DROP_DOWN" />
        </button>
        {helpText && <span className="help-text tiny descriptive color-subtitle">{helpText}</span>}
      </div>
      <div
        className="fp-select__list rounded-s"
        popover="auto"
        ref={popoverRef}
        id={selectPopoverId}
        style={positionAnchorStyle}
      >
        {!required && (
          <div className="rounded-s fp-select__option fp-select__option--empty" onClick={() => onSelect(null)}></div>
        )}
        {/* eslint-disable-next-line react-hooks/refs */}
        {renderSelectList(items)}
      </div>
    </>
  );
}
