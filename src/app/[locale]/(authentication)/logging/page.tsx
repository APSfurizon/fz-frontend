"use client"
import Icon from "@/components/icon";
import { useUser } from "@/components/context/userProvider";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Logging() {
    const t = useTranslations("authentication");
    const router = useRouter();
    const { setUpdateUser } = useUser();
    const params = useSearchParams();

    useEffect(() => {
        setUpdateUser(true);
        router.replace(params.get("continue") ?? "/home");
    }, [])

    return <>
        <div className="horizontal-list gap-4mm flex-center">
            <span className="title-pair">
                <Icon icon="DESIGN_SERVICES" />
                <span className="titular bold highlight">furpanel</span>
                <span> - </span>
                <span className="titular bold">{t('logging_in.title').toLowerCase()}</span>
            </span>
        </div>
    </>;
}