"use client"
import Checkbox from "@/components/input/checkbox";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import FpInput from "@/components/input/fpInput";
import { RoleData, RoleOutputData } from "@/lib/api/admin/role";
import { nullifyEmptyString } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function RoleDataEditor() {
    const t = useTranslations("furpanel");
    const { loading, entity, entityChanged, setEntity } = useEntityEditor<RoleData, RoleData>();

    const onChange = (e: Partial<RoleData>) => {
        const newData = { ...entity, ...e };
        setEntity(newData);
    }

    return <>
        <div className="form-pair horizontal-list gap-2mm">
            <FpInput required initialValue={entity?.internalName} busy={loading}
                label={t("admin.users.security.roles.input.internal_name.label")}
                onChange={(e) => onChange({ internalName: nullifyEmptyString(e.target.value) })}></FpInput>
            <FpInput initialValue={entity?.displayName} busy={loading}
                label={t("admin.users.security.roles.input.display_name.label")}
                onChange={(e) => onChange({ displayName: nullifyEmptyString(e.target.value) })}></FpInput>

        </div>
        <div className="form-pair horizontal-list gap-2mm">
            <FpInput initialValue={entity?.roleAdmincountPriority} busy={loading} inputType="number"
                label={t("admin.users.security.roles.input.admin_count_priority.label")}
                onChange={(e) => onChange({ roleAdmincountPriority: parseInt(e.target.value) ?? 0 })}></FpInput>
        </div>
        <div className="form-pair horizontal-list gap-2mm">
            <Checkbox initialValue={entity?.showInAdminCount} onClick={(e, c) => onChange({ showInAdminCount: c })}
                busy={loading}>
                {t("admin.users.security.roles.input.show_admin_count.label")}
            </Checkbox>
        </div>
    </>
}