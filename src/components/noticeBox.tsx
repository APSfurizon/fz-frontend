import { CSSProperties } from "react";
import Icon, { MaterialIcon } from "./icon";
import "@/styles/components/noticeBox.css";

export enum NoticeTheme {
    FAQ,
    Success,
    Warning,
    Error
}

type NoticeBoxProps = {
    title?: string,
    theme: NoticeTheme,
    icon?: MaterialIcon,
    children: React.ReactNode,
    headerStyle?:
    CSSProperties,
    style?: CSSProperties,
    className?: string
}

export default function NoticeBox({ title, theme, icon, children, headerStyle, style, className }:
    Readonly<NoticeBoxProps>) {
    let finalIcon: MaterialIcon = "HELP";
    switch (theme) {
        case NoticeTheme.FAQ:
            finalIcon = "HELP";
            className = "faq";
            break;
        case NoticeTheme.Success:
            finalIcon = "CHECK_CIRCLE";
            className = "success";
            break;
        case NoticeTheme.Warning:
            finalIcon = "ERROR";
            className = "warning";
            break;
        case NoticeTheme.Error:
            finalIcon = "CANCEL";
            className = "error";
            break;
    }
    finalIcon = icon ?? finalIcon;
    return (
        <div className={`notice-box ${className}`} style={{ ...style }}>
            <div className="header vertical-align-middle" style={{ ...headerStyle }}>
                <Icon className="medium" icon={finalIcon} />
                <span className="title">{title}</span>
            </div>
            <div className="answer descriptive">
                {children}
            </div>
        </div>
    )
}        