import { CSSProperties } from "react";
import Icon, { MaterialIcon } from "./icon";
import "@/styles/components/noticeBox.css";

export enum NoticeTheme {
    FAQ,
    Success,
    Warning,
    Error
}

export default function NoticeBox({ title, theme, customIcon, children, headerStyle, style, className }:
    Readonly<{ title?: string, theme: NoticeTheme, customIcon?: MaterialIcon, children: React.ReactNode, headerStyle?: CSSProperties, style?: CSSProperties, className?: string }>) {
    let icon: MaterialIcon = "HELP";
    switch (theme) {
        case NoticeTheme.FAQ:
            icon = "HELP";
            className = "faq";
            break;
        case NoticeTheme.Success:
            icon = "CHECK_CIRCLE";
            className = "success";
            break;
        case NoticeTheme.Warning:
            icon = "ERROR";
            className = "warning";
            break;
        case NoticeTheme.Error:
            icon = "CANCEL";
            className = "error";
            break;
    }
    return (
        <div className={`notice-box ${className}`} style={{ ...style }}>
            <div className="header vertical-align-middle" style={{ ...headerStyle }}>
                <Icon className="medium" icon={customIcon ?? icon}/>
                <span className="title">{title}</span>
            </div>
            <div className="answer descriptive">
                {children}
            </div>
        </div>
    )
}        