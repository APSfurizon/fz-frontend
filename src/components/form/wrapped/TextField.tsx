import { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import { FormComponentBaseProps, useFieldContext } from "..";
import { Field, FieldDescription, FieldError, FieldLabel, Input } from "../base";

type TextFieldProps = FormComponentBaseProps & {
  type?: HTMLInputTypeAttribute;
  autocomplete?: HTMLInputAutoCompleteAttribute;
};

export default function TextField(props: Readonly<TextFieldProps>) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      {props.label && <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>}
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        type={props.type}
        autoComplete={props.autocomplete}
        placeholder={props.placeholder}
        required={props.required}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
      {props.helpText && <FieldDescription>{props.helpText}</FieldDescription>}
    </Field>
  );
}
