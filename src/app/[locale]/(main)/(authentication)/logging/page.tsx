"use client"
import Icon from "@/components/icon";
import { useUser } from "@/components/context/userProvider";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Logging() {
    const t = useTranslations("authentication");
    const router = useRouter();
    const {setUserDisplay} = useUser();
    const params = useSearchParams();

    useEffect(()=>{
        setUserDisplay(undefined);
        router.replace(params.get("continue") ?? "/home");
        router.refresh();
    }, [])

    return <>
    <div className="horizontal-list gap-4mm flex-center">
        <span className="title-pair">
            <Icon iconName="design_services"></Icon>
            <span className="titular bold highlight">furpanel</span>
            <span> - </span>
            <span className="titular bold">{t('logging_in.title').toLowerCase()}</span>
        </span>
    </div>
    </>;
}