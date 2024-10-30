import "../styles/components/button.css";
import Icon, { ICONS } from "./icon";

export default function Button ({children, iconName, style, className, busy, onClick, disabled}: Readonly<{
    children?: React.ReactNode,
    iconName?: string,
    style?: object,
    className?: string,
    busy?: boolean,
    onClick?: React.MouseEventHandler,
    disabled?: boolean;
  }>) {
    const iconPresent = iconName != undefined;
    return (
        <button onClick={busy ? undefined : onClick}
            disabled={busy || disabled}
            className={"button rounded-m" + " " + (className ?? "")}
            style={{...style, paddingRight: iconPresent ? '0.5em' : 'revert'}}>
            {busy && (
                <Icon className="medium loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
            )}
            {!busy && iconPresent && (
                <Icon className="medium" iconName={iconName}></Icon>
            )}
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </button>
    )
}