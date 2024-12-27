import { CSSProperties, EventHandler, MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import "../styles/components/button.css";
import Icon, { ICONS } from "./icon";

export default function Button ({children, iconName, style, className, busy, onClick, disabled, title, type = "button", debounce}: Readonly<{
    children?: React.ReactNode,
    iconName?: string,
    style?: CSSProperties,
    className?: string,
    busy?: boolean,
    onClick?: React.MouseEventHandler,
    disabled?: boolean,
    title?: string,
    type?: "submit" | "reset" | "button",
    debounce?: number
  }>) {
    const [disabledState, setDisabledState] = useState(disabled);
    const iconPresent = iconName != undefined;
    const onClickEvent = (e: MouseEvent<HTMLButtonElement>) => {
        if (busy || disabledState || !onClick) return;
        if (debounce && !disabledState) {
            setDisabledState(true);
            setTimeout(()=>setDisabledState(false), debounce);
        }
        return onClick(e);
    }

    useEffect(()=>setDisabledState(disabled), [disabled]);

    return (
        <button type={type} onClick={onClickEvent}
            title={title}
            disabled={busy || disabledState}
            className={"button rounded-m" + " " + (className ?? "")}
            style={{...style, paddingRight: iconPresent ? '0.5em' : undefined}}>
            {busy && (
                <Icon className={`medium loading-animation`} iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
            )}
            {!busy && iconPresent && (
                <Icon className={`medium`} iconName={iconName}></Icon>
            )}
            {children && <span className="title normal spacer" style={{fontSize: '15px', textAlign:"left"}}>{children}</span>}
        </button>
    )
}