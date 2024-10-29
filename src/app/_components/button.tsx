import "../styles/components/button.css";
import Icon from "./icon";

export default function Button ({children, iconName, style, className}: Readonly<{
    children?: React.ReactNode, style?: object, className?: string, iconName?: string;
  }>) {
    const iconPresent = iconName != undefined;
    return (
        <button className={"button rounded-m" + " " + (className ?? "")} style={{...style, paddingRight: iconPresent ? '0.5em' : 'revert'}}>
            {iconPresent && (
                <Icon className="medium" iconName={iconName}></Icon>
            )}
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </button>
    )
}