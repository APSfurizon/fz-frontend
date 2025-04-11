import { ChangeEvent, CSSProperties, HTMLInputAutoCompleteAttribute, MouseEvent, useEffect, useState } from "react";
import Icon, { ICONS } from "../icon";
import "@/styles/components/janInput.css";
import { useTranslations } from "next-intl";
import { areEquals } from "@/lib/utils";
import { useFormContext } from "./dataForm";

export default function JanInput ({busy=false, className, disabled=false, fieldName, hasError=false, helpText, inputStyle, inputType="text", label, labelStyle, minLength, maxLength, onChange, onClick, pattern, placeholder, prefix, readOnly=false, required=false, style, initialValue, autocomplete }: Readonly<{
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
    onClick?: (e: MouseEvent<HTMLInputElement>) => void
    pattern?: RegExp,
    placeholder?: string,
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
    const { reset = false } = useFormContext();
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
        onChange && onChange(e);
        pattern && patternValidity(e);
    };
    
    /* Calc input type */
    let finalType = inputType;
    let isPassword = inputType === "password";
    if (isPassword && visiblePassword) finalType = "text";

    return <>
        <div className={`jan-input ${className ?? ""}`} style={{...style}}>
            <label className="title semibold small margin-bottom-1mm" style={{...labelStyle}}>{label}</label>
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                {prefix && <span className="title small color-subtitle">
                    {prefix}
                </span>}
                <input
                    readOnly={readOnly}
                    required={required}
                    name={fieldName}
                    className={`input-field title ${hasError ? "danger" : ""}`}
                    style={{...inputStyle}}
                    placeholder={placeholder ?? ""}
                    type={finalType}
                    disabled={disabled}
                    value={inputValue ?? ""}
                    onChange={handleChange}
                    onClick={onClick}
                    minLength={minLength}
                    maxLength={maxLength}
                    autoComplete={autocomplete}
                />
                <span className={`${busy || isPassword ? "icon-container" : ""}`}>
                    {(busy) && (
                        <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                    )}
                    {!(busy) && (isPassword) && (
                        <a style={{cursor:'pointer'}} onClick={()=>setVisiblePassword(!visiblePassword)}>
                            <Icon className="medium" iconName={visiblePassword ? ICONS.VISIBILITY : ICONS.VISIBILITY_OFF}></Icon>
                        </a>
                    )}
                </span>
            </div>
            {helpText && helpText.length > 0 && <span className="help-text tiny descriptive color-subtitle">{helpText}</span>}
        </div>
    </>
}