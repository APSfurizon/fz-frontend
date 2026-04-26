"use client";

import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";

export default function SchedulePage() {
    const t = useTranslations("common");
    useTitle(t("header.schedule"));

    return (
        <div className="page vertical-list gap-4mm">
            <span className="title large">{t("header.schedule")}</span>
            <span className="descriptive">{t("coming_soon")}</span>
        </div>
    );
}
