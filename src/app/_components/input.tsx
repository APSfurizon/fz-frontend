import { CSSProperties, useState } from "react";
import "../styles/components/input.css";
import Icon, { ICONS } from "./icon";

export default function CustomInput ({children,iconName,title,value,setValue, style,headerStyle, className, busy, onClick, disabled}: Readonly<{
    children?: React.ReactNode,
    iconName?: string,
    title?: string,
    value?: React.ComponentState,
    setValue?:React.ComponentState,
    style?: CSSProperties,
    headerStyle?: CSSProperties,
    className?: string,
    busy?: boolean,
    onClick?: React.MouseEventHandler,
    disabled?: boolean;
  }>) {
    const [inputValue, setInputValue] = useState(value);
    const iconPresent = iconName != undefined;

    const handleChange = (e:any) => {
        setInputValue(e.target.value);
        setValue && setValue(e.target.value);
    };
    return (
        <div className={`custom-input ${className}`} style={{...style}}>
            <div className="margin-bottom-1mm" style={{...headerStyle}}>
                <span>{title}</span>
            </div>
            <div className="answer">
                <input
                    className={"input-field rounded-s" + " " + (className ?? "")}
                    style={{...style, paddingRight: iconPresent ? '0.5em' : 'revert',height:"40px"}}
                    type="text"
                    id="input-field"
                    disabled={busy}
                    value={inputValue}
                    onChange={handleChange}
                />
                {busy && (
                    <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                )}
                {!busy && iconPresent && (
                    <Icon className="medium" iconName={iconName}></Icon>
                )}
            </div>
        </div>
    )
}