import Icon, { ICONS } from "./icon";
import { useState, MouseEvent, CSSProperties } from "react";
import "../styles/components/checkbox.css";

export default function Checkbox ({children, className, disabled, fieldName, onClick, style}: Readonly<{
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    fieldName?: string,
    onClick?: (event: MouseEvent<HTMLElement, globalThis.MouseEvent>, checked: boolean) => void,
    style?: CSSProperties,
  }>) {
    const [checked, setChecked] = useState(false);
    const clickPresent = onClick != undefined;
    return <>
        <input type="hidden" name={fieldName} value={""+checked}></input>
        <button type="button" onClick={(event)=>{if (!disabled) { setChecked(!checked); clickPresent && onClick(event, !checked); }}}
            disabled={disabled} className={"checkbox rounded-m horizontal-list" + " " + (className ?? "")}>
            <div className={`box rounded-s ${checked ? " checked" : ""}`}>
                <Icon className="medium" iconName={checked ? ICONS.CHECK : ICONS.CLOSE}></Icon>
            </div>
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </button>
    </>
}