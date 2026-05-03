"use client";

import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";

export default function DealerPage() {
    const t = useTranslations("common");
    useTitle(t("header.dealer"));

    return (
        <div className="page vertical-list gap-4mm">
            <span className="title large">{t("header.dealer")}</span>
            <span className="descriptive">{t("coming_soon")}</span>
        </div>
    );
}
