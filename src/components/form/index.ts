import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Button } from "../common";
import Checkbox from "../input/checkbox";
import { Combobox } from "../ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import { Input } from "../ui/input";
import { InputGroup } from "../ui/input-group";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select } from "../ui/select";
import { Switch } from "../ui/switch";
import { Toggle } from "../ui/toggle";
import { ToggleGroup } from "../ui/toggle-group";
import TextField from "./wrapped/TextField";

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export type FormComponentBaseProps = {
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
};

export const { useAppForm } = createFormHook({
  fieldComponents: {
    Checkbox,
    Combobox,
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
    Input,
    InputGroup,
    Label,
    RadioGroup,
    RadioGroupItem,
    Select,
    Switch,
    Toggle,
    ToggleGroup,

    TextField,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});
