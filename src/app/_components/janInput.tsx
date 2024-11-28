import { ChangeEvent, CSSProperties, useState } from "react";
import Icon, { ICONS } from "./icon";
import "../styles/components/janInput.css";

export default function JanInput ({busy=false, className, disabled=false, fieldName, hasError=false, helpText, inputStyle, inputType="text", label, labelStyle, minLength, maxLength, onChange, placeholder, prefix, required=false, style, value="" }: Readonly<{
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
    placeholder?: string,
    prefix?: string,
    required?: boolean,
    style?: CSSProperties,
    value?: string,
  }>) {

    /* States */
    const [inputValue, setInputValue] = useState(value);
    const [visiblePassword, setVisiblePassword] = useState(false);
    
    /* Change handling */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(prefix ?? "" + e.target.value);
        onChange && onChange(e);
    };
    
    /* Calc input type */
    let finalType = inputType;
    let isPassword = inputType === "password";
    if (isPassword && visiblePassword) finalType = "text";

    return <>
        <div className={`jan-input ${className ?? ""}`} style={{...style}}>
            <label className="title semibold small margin-bottom-1mm" style={{...labelStyle}}>{label}</label>
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                <input
                    required={required}
                    name={fieldName}
                    className={`input-field title ${hasError ? "danger" : ""}`}
                    style={{...inputStyle}}
                    placeholder={placeholder ?? ""}
                    type={finalType}
                    disabled={disabled}
                    value={inputValue}
                    onChange={handleChange}
                    minLength={minLength}
                    maxLength={maxLength}
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
        </div>
        {helpText && helpText.length > 0 && <span className="help-text tiny descriptive color-subtitle">{helpText}</span>}
    </>
}