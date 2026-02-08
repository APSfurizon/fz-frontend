import { useModalUpdate } from "@/components/context/modalProvider";
import { useUser } from "@/components/context/userProvider";
import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import Modal from "@/components/modal";
import ErrorMessage from "@/components/errorMessage";
import { BanUserAction, GetUserAdminViewResponse, UnbanUserAction, UserIdRequestData } from "@/lib/api/admin/userView";
import { ChangeEmailAction } from "@/lib/api/authentication/recover";
import { runRequest } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function UserViewSecurity({
    userData,
    reloadData
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: () => void
}>) {
    const t = useTranslations();
    const { showModal } = useModalUpdate();
    const { userDisplay } = useUser();
    const [loading, setLoading] = useState(false);
    const isSelf = useMemo(() => userData.personalInfo.userId === userDisplay?.display.userId, [userData, userDisplay]);

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
            .catch((err) => showModal(t("common.error"), <ErrorMessage error={err} />))
            .finally(() => {
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
            .catch((err) => showModal(t("common.error"), <ErrorMessage error={err} />))
            .finally(() => {
                setLoading(false);
                reloadData();
            });
    }

    // Change email logic
    const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);

    // Change password logic
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    return <>
        <div className="vertical-list gap-2mm" style={{ padding: "0.625em" }}>
            <div className="horizontal-list flex-wrap gap-2mm">
                <FpInput fieldName="email"
                    readOnly
                    inputType="email"
                    label={t("authentication.login.label_email")}
                    initialValue={userData.email} />
            </div>
            <div className="horizontal-list gap-2mm">
                {!userData.banned && <Button icon="ACCOUNT_CIRCLE_OFF"
                    onClick={promptBan}
                    disabled={isSelf}>
                    {t("furpanel.admin.users.accounts.view.actions.ban")}
                </Button>}
                {userData.banned && <Button icon="ACCOUNT_CIRCLE"
                    onClick={promptUnban}
                    disabled={isSelf}>
                    {t("furpanel.admin.users.accounts.view.actions.unban")}
                </Button>}
                <Button icon="MAIL"
                    onClick={() => setChangeEmailModalOpen (true)}>
                    {t("furpanel.admin.users.accounts.view.actions.change_email")}
                </Button>
                <Button icon="KEY">
                    {t("furpanel.admin.users.accounts.view.actions.change_password")}
                </Button>
            </div>
        </div>
        <Modal open={banModalOpen} onClose={() => setBanModalOpen(false)} busy={loading}
            title={t("furpanel.admin.users.accounts.view.messages.confirm_ban.title")}>
            <span className="descriptive">
                {t("furpanel.admin.users.accounts.view.messages.confirm_ban.description")}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")}
                    className="danger"
                    onClick={() => setBanModalOpen(false)}
                    icon="CANCEL"
                    busy={loading}>
                    {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button title={t("furpanel.admin.users.accounts.view.actions.ban")}
                    onClick={() => ban()}
                    icon="ACCOUNT_CIRCLE_OFF"
                    busy={loading}>
                    {t("furpanel.admin.users.accounts.view.actions.ban")}
                </Button>
            </div>
        </Modal>
        <Modal open={unbanModalOpen} onClose={() => setUnbanModalOpen(false)} busy={loading}
            title={t("furpanel.admin.users.accounts.view.messages.confirm_unban.title")}>
            <span className="descriptive">
                {t("furpanel.admin.users.accounts.view.messages.confirm_unban.description")}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")}
                    className="danger"
                    onClick={() => setUnbanModalOpen(false)}
                    icon="CANCEL"
                    busy={loading}>
                    {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button title={t("furpanel.admin.users.accounts.view.actions.unban")}
                    onClick={() => unban()}
                    icon="ACCOUNT_CIRCLE"
                    busy={loading}>
                    {t("furpanel.admin.users.accounts.view.actions.unban")}
                </Button>
            </div>
        </Modal>
        <Modal open={changeEmailModalOpen}
            onClose={() => setChangeEmailModalOpen(false)}
            title={t("furpanel.admin.users.accounts.view.actions.change_email")}>
                <DataForm action={new ChangeEmailAction}
                    hideSave
                    className="gap-2mm"
                    onSuccess={reloadData}>
                    <input type="hidden" name="userId" value={userData.personalInfo.userId} />
                    <FpInput inputType="email"
                        fieldName="email"
                        initialValue={userData.email}
                        label={t("authentication.register.form.email.label")}
                        placeholder={t("authentication.register.form.email.placeholder")} />
                    <div className="horizontal-list gap-4mm">
                        <Button type="button" className="danger" icon="CANCEL" onClick={() => setChangeEmailModalOpen(false)}>
                                {t("common.cancel")}
                        </Button>
                        <div className="spacer"></div>
                        <Button type="submit" className="success" icon="CHECK">
                            {t("common.confirm")}
                        </Button>
                    </div>
                </DataForm>
        </Modal>
        <Modal open={changePasswordModalOpen}
            onClose={() => setChangePasswordModalOpen(false)}
            title={t("furpanel.admin.users.accounts.view.actions.change_email")}>
                <DataForm action={new ChangeEmailAction}
                    hideSave
                    className="gap-2mm"
                    onSuccess={reloadData}>
                    <input type="hidden" name="userId" value={userData.personalInfo.userId} />
                    <FpInput inputType="email"
                        fieldName="email"
                        initialValue={userData.email}
                        label={t("authentication.register.form.email.label")}
                        placeholder={t("authentication.register.form.email.placeholder")} />
                    <div className="horizontal-list gap-4mm">
                        <Button type="button" className="danger" icon="CANCEL" onClick={() => setChangeEmailModalOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <div className="spacer"></div>
                        <Button type="submit" className="success" icon="CHECK">
                            {t("common.confirm")}
                        </Button>
                    </div>
                </DataForm>
        </Modal>
    </>
}