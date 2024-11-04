import { CSSProperties } from "react";
import Icon, { ICONS } from "./icon";
import "../styles/components/noticeBox.css";

export enum NoticeTheme {
    FAQ,
    Success,
    Warning,
    Error
}

export default function NoticeBox ({title, theme, customIcon, children, headerStyle, style, className}: 
Readonly<{title?: string, theme: NoticeTheme, customIcon?: string, children: React.ReactNode, headerStyle?: CSSProperties, style?: CSSProperties, className?: string}>) {
    let icon = null;
    let classStyle = null;
    switch (theme) {
        case NoticeTheme.FAQ:
            icon = ICONS.HELP;
            classStyle = "faq";
            break;
        case NoticeTheme.Success:
            icon = ICONS.CHECK_CIRCLE;
            className = "success";
            break;
        case NoticeTheme.Warning:
            icon = ICONS.ERROR;
            className = "warning";
            break;
        case NoticeTheme.Error:
            icon = ICONS.CANCEL;
            className = "error";
            break;
    }
    return (
        <div className={`notice-box ${className}`} style={{...style}}>
            <div className="header vertical-align-middle" style={{...headerStyle}}>
                <Icon className="medium" iconName={customIcon ?? icon}></Icon>
                <span>{title}</span>
            </div>
            <div className="answer">
                {children}
            </div>
        </div>
    )
}        