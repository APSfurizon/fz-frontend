"use client"
import { Url } from "next/dist/shared/lib/router/router";
import { usePathname } from 'next/navigation'
import Link from "next/link";
import Icon, { MaterialIcon } from "./icon";
import "@/styles/components/toolLink.css";
import { CSSProperties, MouseEventHandler } from "react";
import { useLocale } from "next-intl";

export default function ToolLink({
    iconName,
    iconStyle,
    href,
    children,
    style,
    className,
    onClick
}: Readonly<{
    iconName: MaterialIcon,
    iconStyle?: CSSProperties,
    href: Url,
    children?: React.ReactNode,
    style?: CSSProperties,
    className?: string,
    onClick?: MouseEventHandler;
}>) {
    const path = usePathname();
    const locale = useLocale();
    const currentPath = "https://localhost" + path.replaceAll(`/${locale}`, "");
    const resolved = new URL(href.toString(), currentPath).href;
    const activeClass = currentPath.includes(resolved) ? "active" : "";
    return <Link href={href}
        onClick={onClick}
        className={`tool-link rounded-m ${activeClass} ${className ?? ""}`}
        style={{ ...style }}>
        {iconName !== undefined && <Icon icon={iconName} style={{ ...iconStyle }}></Icon>}
        <span className="title small semibold">{children}</span>
    </Link>
}