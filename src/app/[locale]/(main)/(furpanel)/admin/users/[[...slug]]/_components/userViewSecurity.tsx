import { useModalUpdate } from "@/components/context/modalProvider";
import { useUser } from "@/components/context/userProvider";
import { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import { BanUserAction, GetUserAdminViewResponse, UnbanUserAction, UserIdRequestData } from "@/lib/api/admin/userView";
import { runRequest } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function UserViewSecurity ({
    userData,
    reloadData
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: ()=> void
}>) {
    const t = useTranslations();
    const {showModal} = useModalUpdate();
    const {userDisplay} = useUser();
    const [loading, setLoading] = useState(false);
    const isSelf = useMemo(()=>userData.personalInfo.userId === userDisplay?.display.userId, [userData, userDisplay]);
    
    // Ban logic
    const [banModalOpen, setBanModalOpen] = useState(false);

    const promptBan = () => {
        setUnbanModalOpen(false);
        setBanModalOpen(true);
    }

    const ban = () => {
        if (!userData.personalInfo.userId || isSelf) return;
        setLoading(true);
        const body: UserIdRequestData = {
            userId: userData.personalInfo.userId
        }
        runRequest(new BanUserAction(), undefined, body)
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>{
            setLoading(false);
            reloadData();
        });
    }
    
    // Unban logic
    const [unbanModalOpen, setUnbanModalOpen] = useState(false);

    const promptUnban = () => {
        setBanModalOpen(false);
        setUnbanModalOpen(true);
    }

    const unban = () => {
        if (!userData.personalInfo.userId) return;
        setLoading(true);
        const body: UserIdRequestData = {
            userId: userData.personalInfo.userId
        }
        runRequest(new UnbanUserAction(), undefined, body)
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors"/>
        )).finally(()=>{
            setLoading(false);
            reloadData();
        });
    }

    return <>
    <div className="vertical-list" style={{padding: "0.625em"}}>
        <div className="horizontal-list gap-2mm">
            {!userData.banned && <Button iconName={ICONS.ACCOUNT_CIRCLE_OFF}
                onClick={promptBan}
                disabled={isSelf}>
                {t("furpanel.admin.users.accounts.view.actions.ban")}
            </Button>}
            {userData.banned && <Button iconName={ICONS.ACCOUNT_CIRCLE}
                onClick={promptUnban}
                disabled={isSelf}>
                {t("furpanel.admin.users.accounts.view.actions.unban")}
            </Button>}
        </div>
    </div>
    <Modal open={banModalOpen} onClose={()=>setBanModalOpen(false)} busy={loading}
        title={t("furpanel.admin.users.accounts.view.messages.confirm_ban.title")}>
            <span className="descriptive">
                {t("furpanel.admin.users.accounts.view.messages.confirm_ban.description")}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")}
                    className="danger"
                    onClick={()=>setBanModalOpen(false)}
                    iconName={ICONS.CANCEL}
                    busy={loading}>
                        {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button title={t("furpanel.admin.users.accounts.view.actions.ban")}
                    onClick={()=>ban()}
                    iconName={ICONS.ACCOUNT_CIRCLE_OFF}
                    busy={loading}>
                        {t("furpanel.admin.users.accounts.view.actions.ban")}
                </Button>    
            </div>
    </Modal>
    <Modal open={unbanModalOpen} onClose={()=>setUnbanModalOpen(false)} busy={loading}
        title={t("furpanel.admin.users.accounts.view.messages.confirm_unban.title")}>
            <span className="descriptive">
                {t("furpanel.admin.users.accounts.view.messages.confirm_unban.description")}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")}
                    className="danger"
                    onClick={()=>setUnbanModalOpen(false)}
                    iconName={ICONS.CANCEL}
                    busy={loading}>
                        {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button title={t("furpanel.admin.users.accounts.view.actions.unban")}
                    onClick={()=>unban()}
                    iconName={ICONS.ACCOUNT_CIRCLE}
                    busy={loading}>
                        {t("furpanel.admin.users.accounts.view.actions.unban")}
                </Button>
            </div>
    </Modal>
    </>
}