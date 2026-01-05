import {
    ChangeEvent, CSSProperties, FocusEvent, HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute,
    KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState
} from "react";
import Icon, { MaterialIcon } from "../icon";
import "@/styles/components/fpInput.css";
import { useTranslations } from "next-intl";
import { areEquals } from "@/lib/utils";
import { useFormContext } from "./dataForm";
import { UAParser } from "ua-parser-js";

function scrollToFocus(e: FocusEvent<HTMLInputElement>) {
    const isMobile = navigator.userAgent
        ? new UAParser(navigator.userAgent).getResult().device.type === "mobile"
        : false;
    if (!isMobile) return;
    const element = e.target;
    element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
}

export default function FpInput({
    busy = false,
    className,
    disabled = false,
    fieldName,
    hasError = false,
    helpText,
    inputStyle,
    inputType = "text",
    label,
    labelStyle,
    min,
    max,
    minLength,
    maxLength,
    onChange,
    onClick,
    onKeyDown,
    pattern,
    placeholder,
    icon,
    prefix,
    readOnly = false,
    required = false,
    style,
    initialValue,
    autocomplete
}: Readonly<{
    busy?: boolean,
    className?: string,
    disabled?: boolean,
    hasError?: boolean,
    /**Field name to be used in a form*/
    fieldName?: string,
    helpText?: string,
    inputStyle?: CSSProperties,
    inputType?: HTMLInputTypeAttribute,
    label?: string,
    labelStyle?: CSSProperties,
    min?: number | string,
    max?: number | string,
    minLength?: number,
    maxLength?: number,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onClick?: (e: MouseEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void,
    pattern?: RegExp,
    placeholder?: string,
    icon?: MaterialIcon,
    prefix?: string,
    readOnly?: boolean,
    required?: boolean,
    style?: CSSProperties,
    initialValue?: string | number,
    autocomplete?: HTMLInputAutoCompleteAttribute | undefined
}>) {
    /* States */
    const [inputValue, setInputValue] = useState(initialValue ?? "");
    const [lastInitialValue, setLastInitialValue] = useState<string | number>();
    const [visiblePassword, setVisiblePassword] = useState(false);
    const { formReset = false, formDisabled = false, onFormChange, formLoading } = useFormContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations("components");

    // Detect reset
    useEffect(() => {
        setInputValue(initialValue ?? "");
    }, [formReset]);

    useEffect(() => {
        if (!areEquals(initialValue, lastInitialValue)) {
            setInputValue(initialValue ?? "")
        }
        setLastInitialValue(initialValue);
    }, [initialValue]);

    /* Pattern validity */
    const patternValidity = (e: ChangeEvent<HTMLInputElement>) => {
        if (!pattern?.test(e.target.value)) {
            e.target.setCustomValidity(t("input.validation_fail"));
        } else {
            e.target.setCustomValidity("");
        }
    }

    /* Change handling */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (onChange) onChange(e);
        if (pattern) patternValidity(e);
        onFormChange(fieldName);
    };

    /* Calc input type */
    let finalType = inputType;
    const isPassword = inputType === "password";
    if (isPassword && visiblePassword) finalType = "text";

    const isDisabled = disabled || formDisabled;
    const isRequired = required && !isDisabled && !readOnly;
    const isBusy = busy || formLoading;
    const showViewPassword = useMemo(() => !!inputValue && String(inputValue).length > 0, [inputValue]);

    return <>
        <div className={`fp-input ${className ?? ""}`} style={{ ...style }}>
            {label && <label className="title semibold small margin-bottom-1mm" style={{ ...labelStyle }}>{label}</label>}
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm"
                onClick={() => inputRef.current?.focus()}>
                {prefix && <span className="title small color-subtitle">
                    {prefix}
                </span>}
                {icon && <Icon style={{ marginLeft: '0.25em', marginRight: '0' }}
                    className="average"
                    icon={icon} />}
                <input
                    readOnly={readOnly}
                    required={isRequired}
                    name={fieldName}
                    className={`input-field title ${hasError ? "danger" : ""}`}
                    style={{ ...inputStyle }}
                    placeholder={placeholder ?? ""}
                    type={finalType}
                    disabled={isDisabled}
                    value={inputValue ?? ""}
                    onChange={handleChange}
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                    minLength={minLength}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    autoComplete={autocomplete}
                    ref={inputRef}
                    onFocus={scrollToFocus}
                />
                <span className={`${isBusy || isPassword ? "icon-container" : ""}`}>
                    {(isBusy) && (
                        <Icon className="medium loading-animation" icon="PROGRESS_ACTIVITY"/>
                    )}
                    {!(isBusy) && (isPassword) && (
                        <a style={{ cursor: 'pointer', visibility: showViewPassword ? 'visible' : 'hidden' }}
                            onClick={() => setVisiblePassword(!visiblePassword)}>
                            <Icon className="medium"
                                icon={visiblePassword ? "VISIBILITY" : "VISIBILITY_OFF"} />
                        </a>
                    )}
                </span>
            </div>
            {helpText && helpText.length > 0 &&
                <span className="help-text tiny descriptive color-subtitle">
                    {helpText}
                </span>}
        </div>
    </>
}