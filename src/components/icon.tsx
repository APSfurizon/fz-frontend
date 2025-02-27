import { CSSProperties } from "react";
import "@/styles/components/icon.css";

export const ICONS = Object.freeze({
    ACCOUNT_CIRCLE: "account_circle",
    ACCOUNT_CIRCLE_OFF: "account_circle_off",
    ADD: "add",
    ADD_CIRCLE: "add_circle",
    ARROW_DROP_DOWN: "arrow_drop_down",
    ARROW_DROP_UP: "arrow_drop_up",
    ARROW_BACK: "arrow_back",
    ARROW_FORWARD: "arrow_forward",
    BED: "bed",
    BEDROOM_PARENT: "bedroom_parent",
    BUG_REPORT: "bug_report",
    BOOKMARK_STAR: "bookmark_star",
    CALENDAR_ADD_ON: "calendar_add_on",
    CANCEL: "cancel",
    CHECK: "check",
    CHECK_CIRCLE: "check_circle",
    CLOSE: "close",
    CLOUD_UPLOAD: "cloud_upload",
    CONFIRMATION_NUMBER: "confirmation_number",
    CONSTRUCTION: "construction",
    CONTENT_COPY: "content_copy",
    CONTEXTUAL_TOKEN: "contextual_token",
    DELETE: "delete",
    DESIGN_SERVICES: "design_services",
    DISABLED_BY_DEFAULT: "disabled_by_default",
    DO_NOT_DISTURB_ON: "do_not_disturb_on",
    DOOR_OPEN: "door_open",
    EDIT: "edit",
    EDIT_SQUARE: "edit_square",
    ERROR: "error",
    EVENT_REPEAT: "event_repeat",
    FEATURED_SEASONAL_AND_GIFTS: "featured_seasonal_and_gifts",
    FIBER_MANUAL_RECORD: "fiber_manual_record",
    FILE_COPY: "file_copy",
    FILE_OPEN: "file_open",
    FIND_IN_PAGE: "find_in_page",
    FOREST: "forest",
    GROUPS: "groups",
    HELP: "help",
    HOME: "home",
    ID_CARD: "id_card",
    INFO: "info",
    KEY: "key",
    KEYBOARD_ARROW_LEFT: "keyboard_arrow_left",
    KEYBOARD_ARROW_RIGHT: "keyboard_arrow_right",
    LOCAL_ACTIVITY: "local_activity",
    LOCATION_CITY: "location_city",
    LOCK: "lock",
    LOGOUT: "logout",
    MAIL: "mail",
    MENU: "menu",
    OPEN_IN_NEW: "open_in_new",
    PACKAGE_2: "package_2",
    PERSON: "person",
    PERSON_ADD: "person_add",
    PERSON_BOOK: "person_book",
    PERSON_SEARCH: "person_search",
    PETS: "pets",
    PHOTO_CAMERA: "photo_camera",
    PRINT: "print",
    PROGRESS_ACTIVITY: "progress_activity",
    REFRESH: "refresh",
    REMOVE: "remove",
    REPLAY: "replay",
    RESET_SETTINGS: "reset_settings",
    ROTATE_LEFT: "rotate_left",
    ROTATE_RIGHT: "rotate_right",
    SEARCH:"search",
    SECURITY: "security",
    SEND: "send",
    SAVE: "save",
    SHOPPING_CART: "shopping_cart",
    SHOPPING_CART_CHECKOUT: "shopping_cart_checkout",
    SNOOZE: "snooze",
    STAR: "star",
    SYNC: "sync",
    VISIBILITY: "visibility",
    VISIBILITY_OFF: "visibility_off",
});

export default function Icon ({iconName, style, className}: Readonly<{
    iconName: string, style?: CSSProperties, className?: string;
}>) {
    return (<i className={`mdi ${className ?? ""}`} style={{...style}}>{iconName}</i>)
}