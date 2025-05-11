import Icon, { ICONS } from "../icon";
import { useState, MouseEvent, CSSProperties, Dispatch, SetStateAction, useEffect } from "react";
import "@/styles/components/checkbox.css";
import { areEquals } from "@/lib/utils";
import { useFormContext } from "./dataForm";

export default function Checkbox ({
    initialValue,
    children,
    className,
    busy,
    disabled,
    fieldName,
    onClick,
    style
}: Readonly<{
    initialValue?: boolean,
    children?: React.ReactNode,
    className?: string,
    busy?: boolean,
    disabled?: boolean,
    fieldName?: string,
    onClick?: (event: MouseEvent<HTMLButtonElement>,
        checked: boolean, setChecked: Dispatch<SetStateAction<boolean>>,
        setBusy: Dispatch<SetStateAction<boolean>>) => void,
    style?: CSSProperties,
  }>) {
    const [checked, setChecked] = useState(initialValue ?? false);
    const [lastInitialValue, setLastInitialValue] = useState<boolean> ();
    const [busyState, setBusyState] = useState(busy ?? false);
    const { reset = false } = useFormContext();

    const clickEvent = (event: MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !busyState) {
            setChecked(!checked);
            if (onClick != undefined) onClick(event, !checked, setChecked, setBusyState);
        }
    }

    useEffect(()=>setBusyState(busy ?? false), [busy]);

    useEffect(()=>{
        if (initialValue !== undefined && (!areEquals(lastInitialValue, initialValue) || reset)) {
            setChecked(initialValue);
        } else if (reset) {
            setChecked(false);
        }
        setLastInitialValue(initialValue);
    }, [initialValue, reset])

    return <>
        <input type="hidden" name={fieldName} value={""+checked}></input>
        <button type="button" onClick={clickEvent} style={{...style}}
            disabled={disabled} className={"checkbox rounded-m horizontal-list" + " " + (className ?? "")}>
            <div className={`box rounded-s ${checked ? " checked" : ""}`}>
                {busyState 
                ? <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                : <Icon className="medium" iconName={checked ? ICONS.CHECK : ICONS.CLOSE}></Icon>
                }
                
            </div>
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </button>
    </>
}