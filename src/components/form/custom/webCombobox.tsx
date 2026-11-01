"use client";
import { TranslatableInputEntity } from "@/lib/translations";
import { ComboboxRoot, ComboboxRootProps } from "@base-ui/react";
import { useThrottledValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { useLocale } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../base";

function generateQueryKey() {
  const typedArray = new Uint32Array(5);
  crypto.getRandomValues(typedArray);
  return `webCombobox_${typedArray.join()}`;
}

type WebComboboxOption = NonNullable<any>;

export type WebComboboxKey = string[] | string;

export abstract class WebComboboxConfig<T extends WebComboboxOption, U = WebComboboxKey> {
  public inputThrottle = 300;
  public staleTime = 30_000;
  public abstract optionsRenderer(option: T, locale: string): React.ReactNode;
  public abstract selectionsRenderer(selection: T, locale: string): React.ReactNode;
  public abstract searchFn(): (query: string, signal: AbortSignal, locale: string) => Promise<T[]>;
  public abstract inquiringFn(): (values: U, signal: AbortSignal, locale: string) => Promise<T[]>;
  public abstract itemToValue(option: T): string;
  public itemToLabel(): (option: T, locale: string) => string {
    return (option: T, locale: string) => {
      if (option instanceof TranslatableInputEntity) {
        return option.getDescription(locale);
      }
      console.warn(`No label function has been provided for object ${String(option)}`);
      return "";
    };
  }
}

export type WebComboboxBaseProps<T = WebComboboxKey> = {
  config: WebComboboxConfig<any, T>;
  value?: T;
};

export type WebComboboxProps<T = WebComboboxKey> = Omit<ComboboxRootProps<T, boolean>, "value"> &
  WebComboboxBaseProps<T> &
  (
    | {
        multiple: true;
        max: number;
      }
    | {
        multiple?: false;
        max?: never;
      }
  );

export default function WebCombobox<T = WebComboboxKey>(props: Readonly<WebComboboxProps<T>>) {
  const locale = useLocale();
  const [queryBaseKey] = useState(generateQueryKey());
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<ComboboxValues>();

  const [throttledQuery] = useThrottledValue(query.trim(), {
    wait: props.config.inputThrottle,
    leading: true,
    trailing: true,
  });

  const searchQuery = useQuery({
    queryKey: [queryBaseKey, "search", throttledQuery, locale],
    queryFn: ({ signal }) => props.config.searchFn()(throttledQuery, signal, locale),
    enabled: throttledQuery.length >= 3,
    staleTime: props.config.staleTime,
    placeholderData: (prev) => prev,
  });

  // Selected data inquiring logic
  const selectedQuery = useQuery({
    queryKey: [queryBaseKey, "inquire", values, locale],
    queryFn: ({ signal }) => {
      if (values?.values) {
        return props.config.inquiringFn()(values.values, signal, locale);
      }
      return Promise.resolve([]);
    },
    enabled: !!values,
    staleTime: 0,
    gcTime: 0,
  });

  type ComboboxValues = {
    key: string;
    values?: T;
  };

  /** Items to display */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const itemsToShow = Array.from(new Set([...(searchQuery.data ?? []), ...(selectedQuery.data ?? [])]));
  /**
   * To updated new values in a way that react can detect
   * @param newValue The new selection data
   * @returns the new updated data in the state
   */
  const updateValues = (newValue?: T) => {
    let valueToSet = newValue ?? (props.multiple ? [] : ("" as T));
    if (props.multiple) {
      if (Array.isArray(newValue)) {
        valueToSet = newValue.filter((v) => v) as T;
      } else {
        valueToSet = [newValue] as T;
      }
    }
    setValues({
      key: generateQueryKey(),
      values: valueToSet as T,
    });
    return valueToSet;
  };
  /**
   * Updates the state with {@link updateValues} and notifies the provided {@link props.onValueChange}
   * @param newValue the new values
   */
  const onValueChange = (newValue: T, eventDetails: ComboboxRoot.ChangeEventDetails) => {
    const updatedValues = updateValues(newValue);
    props.onValueChange?.(updatedValues, eventDetails);
  };

  // External values management
  const [useExternalValue] = useState(!!props.value || !!props.onValueChange);
  // Updates the current value, without notifying the value change event, to prevent event loops
  useEffect(() => {
    if (!useExternalValue) return;
    updateValues(props.value);
  }, [props.value]);

  const getValue = () => {
    const valueToUse = useExternalValue ? props.value : values?.values;
    const wrappedValue = Array.isArray(valueToUse) ? valueToUse : [valueToUse];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (props.multiple ? wrappedValue : wrappedValue?.[0]) ?? null;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const shouldHideInput =
    getValue() &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    (!props.multiple || (props.multiple && Array.isArray(getValue()) && Array.from(getValue()).length >= props.max));

  return (
    <Combobox
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value={getValue()}
      items={itemsToShow}
      onValueChange={onValueChange}
      onInputValueChange={(e) => setQuery(e)}
      itemToStringValue={props.config.itemToValue}
      itemToStringLabel={(option) => (option ? props.config.itemToLabel()(option, locale) : "")}
      multiple={props.multiple}
      id={props.id}
      name={props.name}
      autoComplete={props.autoComplete}
      required={props.required}
      readOnly={props.readOnly}
    >
      {props.multiple && (
        <>
          <ComboboxChips>
            {selectedQuery.data?.map((item) => (
              <ComboboxChip key={props.config.itemToValue(item)}>
                {props.config.selectionsRenderer(item, locale)}
              </ComboboxChip>
            ))}
            <ComboboxChipsInput value={query} className={cn(shouldHideInput ? "hidden" : "")} />
          </ComboboxChips>
        </>
      )}
      {!props.multiple && (
        <>
          <ComboboxInput value={query} />
        </>
      )}
      <ComboboxContent className={cn(shouldHideInput ? "hidden" : "")}>
        <ComboboxEmpty>No items found</ComboboxEmpty>
        <ComboboxList>
          {searchQuery.data?.map((item) => (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <ComboboxItem
              key={`${queryBaseKey}_option_${props.config.itemToValue(item)}`}
              value={props.config.itemToValue(item)}
            >
              {props.config.optionsRenderer(item, locale)}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
