import Icon, { MaterialIcon } from "@/components/icon"
import { CSSProperties } from "react"

export default function FpMacroSection({
    children,
    icon,
    title,
    titleStyle,
    style
}: Readonly<{
    children?: React.ReactNode,
    icon?: MaterialIcon,
    title?: string,
    titleStyle?: CSSProperties,
    style?: CSSProperties
}>) {
    return <div style={{ ...style }} className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            {icon && <Icon className="x-large" icon={icon}></Icon>}
            <span style={{ ...titleStyle }} className="title medium">{title}</span>
        </div>
        {children}
    </div>
}