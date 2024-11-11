import { ChangeEvent, CSSProperties, useState } from "react";
import Icon, { ICONS } from "./icon";
import "../styles/components/janInput.css";

export default function JanInput ({busy=false, className, disabled=false, fieldName, hasError=false, inputStyle, inputType="text", label, labelStyle, placeholder, onChange, style, value="" }: Readonly<{
    busy?: boolean,
    className?: string,
    disabled?: boolean,
    hasError?: boolean,
    /**Field name to be used in a form*/
    fieldName?: string,
    inputStyle?: CSSProperties,
    inputType?: "text" | "password" | "number",
    label?: string,
    labelStyle?: CSSProperties,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string,
    style?: CSSProperties,
    value?: string,
  }>) {

    /* States */
    const [inputValue, setInputValue] = useState(value);
    const [visiblePassword, setVisiblePassword] = useState(false);
    
    /* Change handling */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onChange && onChange(e);
    };
    
    /* Calc input type */
    let finalType = inputType;
    let isPassword = inputType === "password";
    if (isPassword && visiblePassword) finalType = "text";

    return (
        <div className={`jan-input ${className}`} style={{...style}}>
            <label className="title semibold small margin-bottom-1mm" style={{...labelStyle}}>{label}</label>
            <div className="input-container horizontal-list flex-vertical-center rounded-s margin-bottom-1mm">
                <input
                    name={fieldName}
                    className={`input-field title ${hasError ? "danger" : ""}`}
                    style={{...inputStyle}}
                    placeholder={placeholder ?? ""}
                    type={finalType}
                    disabled={disabled}
                    value={inputValue}
                    onChange={handleChange}
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
    )
}