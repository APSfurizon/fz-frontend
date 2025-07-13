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
    const { formReset = false, formDisabled = false, onFormChange, formLoading } = useFormContext();
    const isDisabled = disabled || formDisabled;
    const clickEvent = (event: MouseEvent<HTMLButtonElement>) => {
        if (!isDisabled && !busyState) {
            setChecked(prev => !prev);
            onFormChange(fieldName);
            if (onClick != undefined) onClick(event, !checked, setChecked, setBusyState);
        }
    }

    useEffect(()=>{
        if (initialValue !== undefined && (!areEquals(lastInitialValue, initialValue) || formReset)) {
            setChecked(initialValue);
        } else if (formReset) {
            setChecked(false);
            onFormChange(fieldName);
        }
        setLastInitialValue(initialValue);
    }, [initialValue, formReset])

    const isBusy = busyState || formLoading || busy

    return <>
        <input type="hidden" name={fieldName} value={String(checked)}></input>
        <button type="button" onClick={clickEvent} style={{...style}}
            disabled={isDisabled} className={"checkbox rounded-m horizontal-list" + " " + (className ?? "")}>
            <div className={`box rounded-s ${checked ? " checked" : ""}`}>
                {isBusy 
                ? <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
                : <Icon className="medium" iconName={checked ? ICONS.CHECK : ICONS.CLOSE}></Icon>
                }
                
            </div>
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </button>
    </>
}