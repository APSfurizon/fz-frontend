import { ChangeEvent, CSSProperties, HTMLInputAutoCompleteAttribute, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import Icon, { ICONS } from "../icon";
import "@/styles/components/fpInput.css";
import { useTranslations } from "next-intl";
import { areEquals } from "@/lib/utils";
import { useFormContext } from "./dataForm";

export default function FpInput ({
    busy=false,
    className,
    disabled=false,
    fieldName,
    hasError=false,
    helpText,
    inputStyle,
    inputType="text",
    label,
    labelStyle,
    minLength,
    maxLength,
    onChange,
    onClick,
    onKeyDown,
    pattern,
    placeholder,
    icon,
    prefix,
    readOnly=false,
    required=false,
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
    inputType?: "text" | "email" | "password" | "number" | "date" | "tel",
    label?: string,
    labelStyle?: CSSProperties,
    minLength?: number,
    maxLength?: number,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    onClick?: (e: MouseEvent<HTMLInputElement>) => void,
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void,
    pattern?: RegExp,
    placeholder?: string,
    icon?: string,
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
    const { reset = false, globalDisabled = false, onFormChange } = useFormContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations("components");

    // Detect reset
    useEffect(()=>{
        setInputValue(initialValue ?? "");
    }, [reset]);

    useEffect(()=>{
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

    const isDisabled = disabled || globalDisabled;
    const isRequired = required && !isDisabled && !readOnly;

    return <>
        <div className={`jan-input ${className ?? ""}`} style={{...style}}>
            {label && <label className="title semibold small margin-bottom-1mm" style={{...labelStyle}}>{label}</label>}
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm"
                onClick={()=>inputRef.current?.focus()}>
                {prefix && <span className="title small color-subtitle">
                    {prefix}
                </span>}
                {icon && <Icon style={{marginLeft: '0.25em', marginRight: '0'}}
                    className="average"
                    iconName={icon}/>}
                <input
                    readOnly={readOnly}
                    required={isRequired}
                    name={fieldName}
                    className={`input-field title ${hasError ? "danger" : ""}`}
                    style={{...inputStyle}}
                    placeholder={placeholder ?? ""}
                    type={finalType}
                    disabled={isDisabled}
                    value={inputValue ?? ""}
                    onChange={handleChange}
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                    minLength={minLength}
                    maxLength={maxLength}
                    autoComplete={autocomplete}
                    ref={inputRef}
                />
                <span className={`${busy || isPassword ? "icon-container" : ""}`}>
                    {(busy) && (
                        <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                    )}
                    {!(busy) && (isPassword) && (
                        <a style={{cursor:'pointer'}} onClick={()=>setVisiblePassword(!visiblePassword)}>
                            <Icon className="medium"
                                iconName={visiblePassword ? ICONS.VISIBILITY : ICONS.VISIBILITY_OFF}/>
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