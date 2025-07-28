"use client"
import Icon from "@/components/icon";
import { useUser } from "@/components/context/userProvider";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
    const t = useTranslations("authentication");
    const router = useRouter();
    const { setUserDisplay } = useUser();
    useEffect(() => {
        setUserDisplay(undefined);
        router.replace("/login");
        router.refresh();
    }, [])

    return <>
        <div className="horizontal-list gap-4mm flex-center">
            <span className="title-pair">
                <Icon icon="design_services"></Icon>
                <span className="titular bold highlight">furpanel</span>
                <span> - </span>
                <span className="titular bold">{t('logout.title').toLowerCase()}</span>
            </span>
        </div>
    </>;
}