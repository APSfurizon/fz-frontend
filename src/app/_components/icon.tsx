import "../styles/components/icon.css";

export const ICONS = Object.freeze({
    FIND_IN_PAGE: "find_in_page",
    CLOSE: "close",
    ADD_CIRCLE: "add_circle",
    ADD: "add",
    REMOVE: "remove",
    EDIT: "edit",
    EDIT_SQUARE: "edit_square",
    PROGRESS_ACTIVITY: "progress_activity"
});

export default function Icon ({iconName, style, className}: Readonly<{
    iconName: string, style?: object, className?: string;
}>) {
    return (<i className={"mdi" + " " + className} style={{...style}}>{iconName}</i>)
}