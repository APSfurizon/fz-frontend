import Icon, { ICONS } from "./icon";
import { useState, MouseEvent } from "react";
import "../styles/components/checkbox.css";

export default function Checkbox ({children, style, className, onClick, disabled}: Readonly<{
    children?: React.ReactNode,
    style?: object,
    className?: string,
    onClick?: React.MouseEventHandler,
    disabled?: boolean;
  }>) {
    const [checked, setChecked] = useState(false);
    const clickPresent = onClick != undefined;
    return (
        <button onClick={(event)=>{if (!disabled) { setChecked(!checked); clickPresent && onClick(event); }}}
        disabled={disabled} className={"checkbox rounded-m horizontal-list" + " " + (className ?? "")}>
            <div className={`box rounded-s ${checked ? " checked" : ""}`}>
                <Icon className="medium" iconName={checked ? ICONS.CHECK : ICONS.CLOSE}></Icon>
            </div>
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </button>
    )
}