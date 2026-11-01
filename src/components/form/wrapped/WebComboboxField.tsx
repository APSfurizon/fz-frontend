import { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import { FormComponentBaseProps, useFieldContext } from "..";
import { Field, FieldDescription, FieldError, FieldLabel } from "../base";
import WebCombobox, { WebComboboxKey, WebComboboxProps } from "../custom/webCombobox";

type TextFieldProps = FormComponentBaseProps & {
  type?: HTMLInputTypeAttribute;
  autocomplete?: HTMLInputAutoCompleteAttribute;
};

const separator = /(?<!\\),/;

export default function WebComboboxField<T extends WebComboboxKey>(
  props: Readonly<TextFieldProps & WebComboboxProps<T>>
) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const normalizeField = (value: T | T[] | null) => {
    return value ? (Array.isArray(value) ? value.join(",") : String(value)) : "";
  };
  const unmarshalizeField = (value: string) => {
    if (props.multiple && separator.test(value)) {
      return value.split(separator) as T;
    } else {
      return value as T;
    }
  };

  return (
    <Field data-invalid={isInvalid}>
      {props.label && <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>}
      {props.multiple ? (
        <WebCombobox
          config={props.config}
          id={field.name}
          name={field.name}
          value={unmarshalizeField(field.state.value)}
          onValueChange={(e, d) => {
            field.handleChange(normalizeField(e));
            props.onValueChange?.(e, d);
          }}
          multiple={props.multiple}
          max={props.max}
          required={props.required}
          readOnly={props.readOnly}
        />
      ) : (
        <WebCombobox
          config={props.config}
          id={field.name}
          name={field.name}
          value={unmarshalizeField(field.state.value)}
          onValueChange={(e, d) => {
            field.handleChange(normalizeField(e));
            props.onValueChange?.(e, d);
          }}
          required={props.required}
          readOnly={props.readOnly}
        />
      )}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
      {props.helpText && <FieldDescription>{props.helpText}</FieldDescription>}
    </Field>
  );
}
