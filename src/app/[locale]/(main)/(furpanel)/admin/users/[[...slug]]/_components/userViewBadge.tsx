import { useModalUpdate } from "@/components/context/modalProvider";
import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import Upload from "@/components/input/upload";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import { GetUserAdminViewResponse, ShowInNosecountApiAction, ShowInNosecountApiInput } from "@/lib/api/admin/userView";
import { BadgeDataChangeFormAction, DeleteBadgeAction, UploadBadgeAction } from "@/lib/api/badge/badge";
import { AutoInputCountriesManager } from "@/lib/api/geo";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { getFlagEmoji } from "@/lib/components/userPicture";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function UserViewBadge({
    userData,
    reloadData,
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: () => void
}>) {
    const t = useTranslations();
    const { showModal, hideModal } = useModalUpdate();

    // Hide from nosecount logic
    const [nosecountSetLoading, setNosecountSetLoading] = useState(false);
    const toggleShowInNosecount = (show: boolean) => {
        setNosecountSetLoading(true);
        const data: ShowInNosecountApiInput = {
            userId: userData.badgeData.mainBadge!.userId,
            showInNosecount: show
        }
        runRequest(new ShowInNosecountApiAction(), undefined, data)
            .then(() => { reloadData() })
            .catch((err) => showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors" />
            )).finally(() => setNosecountSetLoading(false));
    }

    const [badgeLoading, setBadgeLoading] = useState(false);

    // Delete badge picture logic
    const promptBadgeDelete = () => {
        showModal(t("furpanel.badge.messages.confirm_deletion.title"),
            <div className="vertical-list gap-2mm">
                <span>{t("furpanel.badge.messages.confirm_deletion.description")}</span>
                <div className="horizontal-list">
                    <Button type="button" className="danger" iconName={"CANCEL"}
                        onClick={hideModal}>{t("common.cancel")}</Button>
                    <div className="spacer"></div>
                    <Button type="submit" className="success" iconName={"CHECK"}
                        onClick={() => deleteBadge(userData.personalInfo.userId!)}>
                        {t("common.confirm")}
                    </Button>
                </div>
            </div>,
            "DELETE"
        );
    }

    const deleteBadge = (userId: number) => {
        hideModal();
        setBadgeLoading(true);
        runRequest(new DeleteBadgeAction(), [String(userId)])
            .then(() => reloadData())
            .catch((err) => showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.errors" />
            )).finally(() => {
                setBadgeLoading(false);
                hideModal();
            });
    }

    // Upload badge picture logic
    const uploadBadge = (blob?: Blob) => {
        if (!blob) return;
        const dataToUpload: FormData = new FormData();
        dataToUpload.append("image", blob);
        setBadgeLoading(true);
        runRequest(new UploadBadgeAction(), [String(userData.badgeData.mainBadge!.userId)], dataToUpload)
            .then(() => {
                reloadData();
            }).catch((err) => showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"></ModalError>
            )).finally(() => setBadgeLoading(false));
    }

    // Change data
    const [changeDataModalOpen, setChangeDataModalOpen] = useState(false);

    const onChangeFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
        showModal(
            t("common.error"),
            <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors">
            </ModalError>
        )
    }

    return <>
        <div className="horizontal-list gap-4mm flex-wrap">
            <div>
                <Upload initialMedia={userData.badgeData.mainBadge?.propic} requireCrop busy={badgeLoading}
                    setBlob={uploadBadge} onDelete={promptBadgeDelete} viewSize={130} />
            </div>
            <div className="vertical-list title gap-2mm">
                <p className="average">
                    <span className="bold">{t("furpanel.admin.users.accounts.view.badges.fursona_name")}:</span>
                    &nbsp;
                    {userData.badgeData.mainBadge?.fursonaName}
                </p>
                <p className="average">
                    <span className="bold">{t("furpanel.admin.users.accounts.view.badges.locale")}:</span>
                    &nbsp;
                    {getFlagEmoji(userData.badgeData.mainBadge?.locale ?? 'un')}
                </p>
                <div className="spacer" />
                <div className="horizontal-list gap-2mm flex-wrap">
                    <Button iconName={userData.showInNousecount ? "VISIBILITY_OFF" : "VISIBILITY"}
                        busy={nosecountSetLoading}
                        onClick={() => toggleShowInNosecount(!userData.showInNousecount)}>
                        {userData.showInNousecount
                            ? t("furpanel.admin.users.accounts.view.badges.hide_from_nosecount")
                            : t("furpanel.admin.users.accounts.view.badges.show_from_nosecount")}
                    </Button>
                    <Button busy={badgeLoading} iconName={"EDIT_SQUARE"} onClick={() => setChangeDataModalOpen(true)}>
                        {t("furpanel.badge.actions.edit_badge")}
                    </Button>
                </div>
            </div>
        </div>
        {/* Badge data edit modal */}
        <Modal title={t("furpanel.badge.actions.edit_badge")}
            open={changeDataModalOpen}
            onClose={() => setChangeDataModalOpen(false)}
            busy={badgeLoading}>
            <DataForm action={new BadgeDataChangeFormAction} loading={badgeLoading} setLoading={setBadgeLoading} hideSave
                className="gap-2mm" onFail={onChangeFail} onSuccess={reloadData}>
                <input type="hidden" name="userId" value={userData.badgeData.mainBadge?.userId} />
                <FpInput inputType="text"
                    fieldName="fursonaName"
                    initialValue={changeDataModalOpen ? userData.badgeData.mainBadge?.fursonaName : ""}
                    label={t("furpanel.badge.input.new_name.label")}
                    placeholder={t("furpanel.badge.input.new_name.placeholder")} />
                <AutoInput fieldName="locale" required={true} minDecodeSize={2}
                    manager={new AutoInputCountriesManager}
                    label={t("furpanel.badge.input.new_locale.label")}
                    placeholder={t("furpanel.badge.input.new_locale.placeholder")}
                    helpText={t("furpanel.badge.input.new_locale.help")}
                    initialData={userData.badgeData.mainBadge?.locale
                        ? [userData.badgeData.mainBadge?.locale]
                        : undefined} />
                <div className="horizontal-list gap-4mm">
                    <Button type="button" className="danger" iconName={"CANCEL"} busy={badgeLoading}
                        onClick={() => setChangeDataModalOpen(false)}>{t("common.cancel")}</Button>
                    <div className="spacer"></div>
                    <Button type="submit" className="success" iconName={"CHECK"} busy={badgeLoading}>
                        {t("common.confirm")}</Button>
                </div>
            </DataForm>
        </Modal>
    </>;
}