export const ICONS = Object.freeze({
    FIND_IN_PAGE: "find_in_page",
    CLOSE: "close"
});

export default function Icon ({iconName, style, className}: Readonly<{
    iconName: string, style?: object, className?: string;
}>) {
    return (<i className={"mdi " + className} style={{...style}}>{iconName}</i>)
}