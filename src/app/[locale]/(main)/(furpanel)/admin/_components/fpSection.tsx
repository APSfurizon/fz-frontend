import Icon from "@/components/icon"
import { CSSProperties } from "react"

export default function FpSection({
    children,
    icon,
    title,
    titleStyle,
    style
}: Readonly<{
    children?: React.ReactNode,
    icon?: string,
    title?: string,
    titleStyle?: CSSProperties,
    style?: CSSProperties
}>) {
    return <div style={{ ...style }} className="vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            {icon && <Icon className="large" icon={icon}></Icon>}
            <span style={{ ...titleStyle }} className="title average">{title}</span>
        </div>
        <div className="horizontal-list gap-2mm">
            {children}
        </div>
    </div>
}