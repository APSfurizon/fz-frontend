import { useModalUpdate } from "@/components/context/modalProvider";
import { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import LoadingPanel from "@/components/loadingPanel";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import { GetRenderedCommonBadgesApiAction, GetRenderedFursuitBadgesApiAction } from "@/lib/api/admin/badge";
import { ApiAction, runRequest } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from "react";

enum StepType {
    CHOOSE_PRINT_MODE,
    SIMPLE,
    ADVANCED_SETTINGS,
}

export default function BadgePrintingDialog ({
    open,
    onClose,
    loading,
    setLoading
}: Readonly<{
    open: boolean,
    onClose: Function,
    loading: boolean,
    setLoading: Dispatch<SetStateAction<boolean>>
}>) {
    const t = useTranslations();
    const {showModal} = useModalUpdate();
    const [step, setStep] = useState(StepType.CHOOSE_PRINT_MODE);
    const router = useRouter();

    const closeModal = () => {
        setStep(StepType.CHOOSE_PRINT_MODE);
        onClose && onClose();
    }

    useEffect(()=> {
        if (!open) {
            setStep(StepType.CHOOSE_PRINT_MODE);
        }
    }, [open])

    const renderFursuit = () => renderBadges(new GetRenderedFursuitBadgesApiAction ());
    const renderCommon = () => renderBadges(new GetRenderedCommonBadgesApiAction ());

    const renderBadges = (action: ApiAction<any, any>, e?: MouseEvent<HTMLButtonElement>) => {
        setLoading(true);
        runRequest(action)
        .then ((response) => {
            const res = response as Response;
            res.blob().then((badgesBlob) => {
            const result = URL.createObjectURL(badgesBlob);
            window.open(result, "_blank");
            URL.revokeObjectURL(result);
            });
            closeModal();
        }).catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors"/>
        )).finally(()=>setLoading(false))
    }

    return <Modal icon={ICONS.BADGE} title={t("furpanel.admin.events.badges.print_badges")} open={open} onClose={closeModal}>
        {step == StepType.CHOOSE_PRINT_MODE && <>
            <span className="title">{t("furpanel.admin.events.badges.print.select_mode")}</span>
            <div className="horizontal-list gap-4mm">
                <Button busy={loading} onClick={()=>setStep(StepType.SIMPLE)} iconName={ICONS.CHECK_CIRCLE}>{t("furpanel.admin.events.badges.print.simple_mode.title")}</Button>
                <Button busy={loading} onClick={()=>router.push('admin/badge/print')} iconName={ICONS.TUNE}>{t("furpanel.admin.events.badges.print.advanced_mode.title")}</Button>
            </div>
        </>}
        {step == StepType.SIMPLE && <>
            <span className="title">{t("furpanel.admin.events.badges.print.simple_mode.choose_badge")}</span>
            <div className="horizontal-list gap-4mm">
                <Button busy={loading} onClick={()=>renderCommon()} iconName={ICONS.PERSON}>{t("furpanel.admin.events.badges.print.simple_mode.common")}</Button>
                <Button busy={loading} onClick={()=>renderFursuit()} iconName={ICONS.PETS}>{t("furpanel.admin.events.badges.print.simple_mode.fursuit")}</Button>
            </div>
        </>}
    </Modal>
}