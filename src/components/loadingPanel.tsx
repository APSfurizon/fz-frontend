import { useTranslations } from "next-intl";
import Icon, { ICONS } from "@/components/icon";

export default function LoadingPanel ({showText = true, className, children}: Readonly<{
    showText?: boolean,
    className?: string,
    children?: React.ReactNode
}>) {
    const tcommon = useTranslations("common");

    return <div aria-busy="true" className={`horizontal-list gap-2mm flex-vertical-center ${className ?? ""}`}>
        <Icon className="loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
        {children ?? <span className="">{showText && tcommon("loading")}</span>}
    </div>
}