"use client"
import AutoInput from "@/components/input/autoInput";
import Button from "@/components/input/button";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import Modal from "@/components/modal";
import { RoleData, RoleMember } from "@/lib/api/admin/role";
import { AutoInputUsersManager, SponsorType } from "@/lib/api/user";
import { AutoInputChangedParams, AutoInputFilter, AutoInputSearchResult } from "@/lib/components/autoInput";
import { useTranslations } from "next-intl";
import { MouseEvent, useState } from "react";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import "@/styles/table.css";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import DataForm from "@/components/input/dataForm";
import { DummyFormAction } from "@/lib/components/dataForm";
import Checkbox from "@/components/input/checkbox";
import { MediaData } from "@/lib/api/media";
import { useModalUpdate } from "@/components/context/modalProvider";

function flattenSearchResult(searchResult: AutoInputSearchResult): RoleMember {
    const flattenedMedia: MediaData = {
        mediaId: 0,
        mediaUrl: searchResult.imageUrl ?? "",
        mimeType: "image/webp"
    }
    return {
        tempRole: false,
        displayData: {
            userId: searchResult.id!,
            sponsorship: SponsorType.NONE,
            fursonaName: searchResult.description,
            propic: searchResult.imageUrl ? flattenedMedia : undefined
        }
    }
}

export default function RoleMembersEditor() {
    const t = useTranslations();
    const { entity, setEntity } = useEntityEditor<RoleData, RoleData>();
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [selectedUserTemp, setSelectedUserTemp] = useState<RoleMember>();
    const [temporaryUserTemp, setTemporaryUserTemp] = useState<boolean>();
    const { showModal } = useModalUpdate();

    const closeAddMemberModal = () => {
        setSelectedUserTemp(undefined);
        setTemporaryUserTemp(undefined);
        setAddMemberOpen(false);
    }

    const patchSelectedUserTemp = (newValue?: RoleMember) => {
        let newSelectedUserTemp: RoleMember;
        if (selectedUserTemp) {
            newSelectedUserTemp = { ...selectedUserTemp, ...newValue };
        } else if (newValue) {
            newSelectedUserTemp = newValue;
        } else {
            return;
        }
        setSelectedUserTemp(newSelectedUserTemp);
    }

    const changeUserTemporaryRole = (member: RoleMember, newStatus: boolean) => {
        const newRoleMember: RoleMember = { ...member, tempRole: newStatus };
        const newUsers: RoleMember[] = [...entity.users].map(record => {
            if (member.displayData.userId === record.displayData.userId) {
                return newRoleMember;
            }
            return record;
        });
        const newEntity: RoleData = { ...entity, users: newUsers };
        setEntity(newEntity);
    }

    const selectMember = (p: AutoInputChangedParams) => {
        const value = p.newValues && p.newValues.length > 0 ? flattenSearchResult(p.newValues[0]) : undefined;
        patchSelectedUserTemp(value);
    }

    const setTemporary = (event: MouseEvent<HTMLButtonElement>, checked: boolean) => {
        setTemporaryUserTemp(checked);
    }

    const addMember = () => {
        if (!selectedUserTemp) return;
        const toAdd = { ...selectedUserTemp, tempRole: temporaryUserTemp ?? false }
        if (entity.users.find(usr => usr.displayData.userId === toAdd.displayData.userId)) {
            showModal(t("furpanel.admin.users.security.roles.messages.duplicate_user.title"),
                <span className="descriptive">
                    {t("furpanel.admin.users.security.roles.messages.duplicate_user.description")}
                </span>, "ERROR");
            return;
        }
        const newEntity: RoleData = { ...entity, users: [...entity.users, toAdd] };
        setEntity(newEntity);
        closeAddMemberModal();
    }

    const removeMember = (id: number) => {
        const newEntity = { ...entity, users: entity.users.filter(eu => eu.displayData.userId !== id) }
        setEntity(newEntity);
    }

    const purgeTemporaryMembers = () => {
        const newEntity = { ...entity, users: entity.users.filter(eu => !!!eu.tempRole) }
        setEntity(newEntity);
    }

    return <>
        <div className="horizontal-list gap-2mm">
            <div className="spacer"></div>
            <Button className="danger" iconName={"HOURGLASS_DISABLED"} onClick={() => { purgeTemporaryMembers() }}>
                {t("furpanel.admin.users.security.roles.actions.purge_temporary_roles")}
            </Button>
            <Button iconName={"ADD"} onClick={() => { setAddMemberOpen(true) }}>
                {t("common.CRUD.add")}
            </Button>
        </div>
        {/* Permissions table */}
        <div className="table-container rounded-m">
            <div className="table rounded-m">
                {entity?.users?.map((roleMember, mi) => <div key={mi} className="row horizontal-list flex-vertical-center gap-2mm flex-wrap">
                    <div className="data">
                        <Image unoptimized src={getImageUrl(roleMember.displayData.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                            width={32} height={32} alt="image" className="rounded-s" />
                    </div>
                    <div className="data">
                        <span>{roleMember.displayData.fursonaName}</span>
                    </div>
                    <div className="spacer"></div>
                    <div className="data">
                        <Checkbox initialValue={roleMember.tempRole}
                            onClick={(e, checked) => changeUserTemporaryRole(roleMember, checked)}>
                            {t("furpanel.admin.users.security.roles.input.temporary_member.label")}
                        </Checkbox>
                    </div>
                    <div className="data">
                        <Button iconName={"DELETE"} onClick={() => removeMember(roleMember.displayData.userId)} />
                    </div>
                </div>)}
            </div>
        </div>
        <Modal open={addMemberOpen} onClose={() => closeAddMemberModal()}
            title={t("furpanel.admin.users.security.roles.input.add_member.label")} style={{ minWidth: '400px' }}>
            <DataForm action={new DummyFormAction} shouldReset={!addMemberOpen} hideSave
                className="vertical-list gap-2mm">
                <AutoInput manager={new AutoInputUsersManager} onChange={selectMember}
                    filterOut={new AutoInputFilter(entity?.users.map(eu => eu.displayData.userId), [])}
                    label={t("furpanel.admin.users.security.roles.input.select_user.label")} param={[true]}>
                </AutoInput>
                <div className="vertical-list gap-2mm">
                    <Checkbox onClick={setTemporary} initialValue={temporaryUserTemp}>
                        {t("furpanel.admin.users.security.roles.input.temporary_member.label")}
                    </Checkbox>
                    <span className="descriptive tiny color-subtitle">
                        {t("furpanel.admin.users.security.roles.input.temporary_member.help")}
                    </span>
                </div>
            </DataForm>
            <div className="horizontal-list gap-4mm">
                <Button type="button" className="danger" iconName={"CANCEL"}
                    onClick={() => setAddMemberOpen(false)}>{t("common.cancel")}</Button>
                <div className="spacer"></div>
                <Button type="submit" className="success" iconName={"CHECK"}
                    onClick={() => addMember()} disabled={!!!selectedUserTemp}>
                    {t("common.confirm")}
                </Button>
            </div>
        </Modal>
    </>
}