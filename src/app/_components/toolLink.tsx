"use client"
import { Url } from "next/dist/shared/lib/router/router";
import { usePathname } from 'next/navigation'
import Link from "next/link";
import Icon from "./icon";
import "../styles/components/toolLink.css";

export default function ToolLink ({iconName, href, children, style, className}: Readonly<{
    iconName: string, href: Url, children?: React.ReactNode, style?: object, className?: string;
}>) {
    const path = usePathname();
    const activeClass = path === href.toString() || path?.endsWith(`${href}`) ? "active": path;
    return (
        <div className={`tool-link rounded-m ${activeClass} ${className ?? ""}`} style={{...style}}>
            <Link href={href}>
            {iconName !== undefined && <Icon iconName={iconName}></Icon>}
            <span className="title semibold">{children}</span>
        </Link>
        </div>
    )
}