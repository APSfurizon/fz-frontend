import { CSSProperties } from "react";
import Icon from "./icon";
import "@/styles/components/noticeBox.css";

export enum NoticeTheme {
    FAQ,
    Success,
    Warning,
    Error
}

export default function NoticeBox({ title, theme, customIcon, children, headerStyle, style, className }:
    Readonly<{ title?: string, theme: NoticeTheme, customIcon?: string, children: React.ReactNode, headerStyle?: CSSProperties, style?: CSSProperties, className?: string }>) {
    let icon = null;
    let classStyle = null;
    switch (theme) {
        case NoticeTheme.FAQ:
            icon = "HELP";
            classStyle = "faq";
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
                <Icon className="medium" icon={customIcon ?? icon}></Icon>
                <span className="title">{title}</span>
            </div>
            <div className="answer descriptive">
                {children}
            </div>
        </div>
    )
}        