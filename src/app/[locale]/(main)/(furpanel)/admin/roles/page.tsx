"use client"
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function RolesList () {

    const router = useRouter();
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");

    return <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <a href="#" onClick={()=>router.back()}><Icon iconName={ICONS.ARROW_BACK}/></a>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">{t("admin.membership_manager.header")}</span>
            </div>

            <div className="spacer"></div>
            <Button iconName={ICONS.REFRESH} onClick={()=>{}} debounce={3000}>{tcommon("reload")}</Button>
            <Button iconName={ICONS.ADD} onClick={()=>{}} >{t("admin.membership_manager.actions.add")}</Button>
        </div>
    </div>
}