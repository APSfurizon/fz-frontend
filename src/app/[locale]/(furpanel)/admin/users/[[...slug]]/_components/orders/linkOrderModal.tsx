import { useState } from "react";
import { useUserViewContext } from "../../page";
import Button from "@/components/input/button";
import { useTranslations } from "next-intl";
import Modal from "@/components/modal";
import DataForm from "@/components/input/dataForm";
import { ManuallyLinkOrderFormAction } from "@/lib/api/admin/admin";
import FpInput from "@/components/input/fpInput";

export default function LinkOrderModal() {
    const {userData, reloadAll} = useUserViewContext();
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const t = useTranslations("");

    return <>
        <Button icon="LINK"
            title={t("furpanel.admin.users.accounts.view.orders_table.actions.link_order.title")}
            onClick={() => setLinkModalOpen(true)}/>
        <Modal open={linkModalOpen}
            onClose={() => setLinkModalOpen(false)}
            icon="LINK"
            title={t("furpanel.admin.users.accounts.view.orders_table.actions.link_order.title")}>
            <p>{t.rich("furpanel.admin.users.accounts.view.orders_table.actions.link_order.description", {
                user: userData!.badgeData.mainBadge!.fursonaName!,
                b: (chunks) => <b>{chunks}</b>
            })}</p>
            <DataForm hideSave
                action={new ManuallyLinkOrderFormAction}
                shouldReset={!linkModalOpen}
                onSuccess={reloadAll}>
                    <input type="hidden" name="userId" value={userData?.personalInfo.userId}/>
                    <FpInput inputType="text"
                        fieldName="orderCode"
                        label={t("furpanel.admin.users.accounts.view.orders_table.actions.link_order.order_code.label")}/>
                    <div className="horizontal-list gap-4mm margin-top-2mm">
                        <Button type="button"
                            className="danger"
                            icon="CANCEL"
                            onClick={() => setLinkModalOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <div className="spacer"></div>
                        <Button type="submit"
                            className="success"
                            icon="CHECK">
                            {t("common.confirm")}
                        </Button>
                    </div>
            </DataForm>
        </Modal>
    </>
}