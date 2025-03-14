"use client"
import Icon, { ICONS } from "@/components/icon";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import { runRequest } from "@/lib/api/global";
import { UserOrderLinkingAction, UserOrderLinkingData } from "@/lib/api/user";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderLinkPage() {
    const params = useSearchParams();
    const t = useTranslations();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {showModal} = useModalUpdate();

    const code = params.get("c");
    const secret = params.get("s");
    const message = params.get("m");
    
    useEffect(()=>{
        if (!code || !secret) router.replace("/home");
        setLoading(true);
        const userOrderLinkData: UserOrderLinkingData = {
            orderCode: code!,
            orderSecret: secret!
        }
        runRequest(new UserOrderLinkingAction(), undefined, userOrderLinkData)
        .then(()=>router.replace("/booking"))
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="user.linking.errors"></ModalError>
        )).finally(()=>setLoading(false));
    }, [])

    return <Modal open={true} busy={loading} onClose={()=>{router.replace("/home")}} title={t("furpanel.user.linking.title")} icon={ICONS.LOCAL_ACTIVITY}>
        {loading && <span className="title horizontal-list flex-vertical-center gap-2mm">
            <Icon className="loading-animation" iconName={ICONS.PROGRESS_ACTIVITY}></Icon>
            {t("furpanel.user.linking.description")}
        </span>}
    </Modal>
}