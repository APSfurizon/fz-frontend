"use client"
import { Url } from "next/dist/shared/lib/router/router";
import { usePathname } from 'next/navigation'
import Link from "next/link";
import Icon, { MaterialIcon } from "./icon";
import "@/styles/components/toolLink.css";
import { CSSProperties, MouseEventHandler } from "react";

export default function ToolLink({
    icon,
    iconStyle,
    href,
    children,
    style,
    className,
    onClick
}: Readonly<{
    icon: MaterialIcon,
    iconStyle?: CSSProperties,
    href: Url,
    children?: React.ReactNode,
    style?: CSSProperties,
    className?: string,
    onClick?: MouseEventHandler;
}>) {
    const currentPath = `https://localhost${usePathname()}`;
    const resolved = new URL(href.toString(), currentPath).href;
    const activeClass = currentPath.includes(resolved) ? "active" : "";
    return <Link href={href}
        onClick={onClick}
        className={`tool-link rounded-m ${activeClass} ${className ?? ""}`}
        style={{ ...style }}>
        {icon !== undefined && <Icon icon={icon} style={{ ...iconStyle }} />}
        <span className="title small semibold">{children}</span>
    </Link>
}