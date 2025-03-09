"use client"
import Checkbox from "@/components/checkbox";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import JanInput from "@/components/janInput";
import { RoleData, RoleOutputData } from "@/lib/api/admin/role";
import { nullifyEmptyString } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function RoleDataEditor () {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const {entity, entityChanged, setEntity} = useEntityEditor<RoleOutputData, RoleData>();

    const onChange = (e: Partial<RoleOutputData>) => {
        const newData = {...entity, ...e};
        setEntity(newData);
    }

    console.log("rerender");

    return <>
        <div className="form-pair horizontal-list gap-2mm">
            <JanInput required initialValue={entity?.roleInternalName}
                label={t("admin.users.security.roles.input.internal_name.label")}
                onChange={(e)=>onChange({roleInternalName: nullifyEmptyString(e.target.value)})}></JanInput>
            <JanInput initialValue={entity?.roleDisplayName}
                label={t("admin.users.security.roles.input.display_name.label")}
                onChange={(e)=>onChange({roleDisplayName: nullifyEmptyString(e.target.value)})}></JanInput>
            
        </div>
        <div className="form-pair horizontal-list gap-2mm">
        <Checkbox initialValue={entity?.showInAdminCount} onClick={(e, c)=>onChange({showInAdminCount: c})}>
            {t("admin.users.security.roles.input.show_admin_count.label")}
        </Checkbox>
        </div>
    </>
}