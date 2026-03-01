import { CSSProperties, MouseEvent, useEffect, useMemo, useState } from "react";
import "@/styles/components/button.css";
import Icon, { MaterialIcon } from "../icon";
import { useFormContext } from "./dataForm";

export default function Button({
    children,
    icon,
    style,
    className,
    busy,
    onClick,
    disabled,
    title,
    type = "button",
    debounce
}: Readonly<{
    children?: React.ReactNode,
    icon?: MaterialIcon,
    style?: CSSProperties,
    className?: string,
    busy?: boolean,
    onClick?: React.MouseEventHandler,
    disabled?: boolean,
    title?: string,
    type?: "submit" | "reset" | "button",
    debounce?: number
}>) {
    const formContext = useFormContext();
    const finalBusy = useMemo(() => formContext.formLoading || busy, [formContext.formLoading, busy])
    const [disabledState, setDisabledState] = useState(disabled);
    const iconPresent = icon != undefined;
    const onClickEvent = (e: MouseEvent<HTMLButtonElement>) => {
        if (finalBusy || disabledState || !onClick) return;
        if (debounce && !disabledState) {
            setDisabledState(true);
            setTimeout(() => setDisabledState(false), debounce);
        }
        return onClick(e);
    }

    useEffect(() => setDisabledState(disabled), [disabled]);

    const isCooldown = !finalBusy && debounce !== undefined && disabledState && !disabled;

    return (
        <button type={type} onClick={onClickEvent}
            title={title}
            disabled={finalBusy || disabledState}
            className={"button rounded-m" + " " + (className ?? "")}
            style={{ ...style, paddingRight: iconPresent ? '0.5em' : undefined }}>
            {finalBusy && <Icon className={`medium loading-animation`} icon="PROGRESS_ACTIVITY"/>}
            {!finalBusy && isCooldown && <Icon className={`medium`} icon="SNOOZE"/>}
            {!finalBusy && !isCooldown && iconPresent && <Icon className={`medium`} icon={icon}/>}
            {children && icon && <div className="spacer"></div>}
            {children && <span className="title normal spacer" style={{ fontSize: '15px', textAlign: "left" }}>
                {children}
            </span>}
        </button>
    )
}