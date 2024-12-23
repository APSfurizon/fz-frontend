"use client"
import { Url } from "next/dist/shared/lib/router/router";
import { usePathname } from 'next/navigation'
import Link from "next/link";
import Icon from "./icon";
import "../styles/components/toolLink.css";
import { CSSProperties } from "react";

export default function ToolLink ({iconName, iconStyle, href, children, style, className}: Readonly<{
    iconName: string, iconStyle?: CSSProperties, href: Url, children?: React.ReactNode, style?: CSSProperties, className?: string;
}>) {
    const path = usePathname();
    const activeClass = path === href.toString() || path?.endsWith(`${href}`) ? "active": path;
    return (
        <div className={`tool-link rounded-m ${activeClass} ${className ?? ""}`} style={{...style}}>
            <Link href={href}>
            {iconName !== undefined && <Icon iconName={iconName} style={{...iconStyle}}></Icon>}
            <span className="title small semibold">{children}</span>
        </Link>
        </div>
    )
}