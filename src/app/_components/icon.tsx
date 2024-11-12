import { CSSProperties } from "react";
import "../styles/components/icon.css";

export const ICONS = Object.freeze({
    ADD: "add",
    ADD_CIRCLE: "add_circle",
    ARROW_DROP_DOWN: "arrow_drop_down",
    ARROW_DROP_UP: "arrow_drop_up",
    BED: "bed",
    BUG_REPORT: "bug_report",
    BOOKMARK_STAR: "bookmark_star",
    CANCEL: "cancel",
    CHECK: "check",
    CHECK_CIRCLE: "check_circle",
    CLOSE: "close",
    CONTEXTUAL_TOKEN: "contextual_token",
    EDIT: "edit",
    EDIT_SQUARE: "edit_square",
    ERROR: "error",
    FIND_IN_PAGE: "find_in_page",
    GROUPS: "groups",
    HELP: "help",
    HOME: "home",
    INFO: "info",
    LOGOUT: "logout",
    PERSON: "person",
    PERSON_BOOK: "person_book",
    PETS: "pets",
    PHOTO_CAMERA: "photo_camera",
    PROGRESS_ACTIVITY: "progress_activity",
    REMOVE: "remove",
    VISIBILITY: "visibility",
    VISIBILITY_OFF: "visibility_off",
    SEARCH:"search"
});

export default function Icon ({iconName, style, className}: Readonly<{
    iconName: string, style?: CSSProperties, className?: string;
}>) {
    return (<i className={`mdi ${className ?? ""}`} style={{...style}}>{iconName}</i>)
}