"use client"
import AutoInput from "@/components/autoInput";
import Button from "@/components/button";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import { ICONS } from "@/components/icon";
import Modal from "@/components/modal";
import { RoleData, RoleMember, RoleOutputData, RoleOutputMember } from "@/lib/api/admin/role";
import { AutoInputUsersManager, SponsorType } from "@/lib/api/user";
import { AutoInputFilter, AutoInputSearchResult } from "@/lib/components/autoInput";
import { useTranslations } from "next-intl";
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from "react";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import "@/styles/table.css";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import DataForm from "@/components/dataForm";
import { DummyFormAction } from "@/lib/components/dataForm";
import Checkbox from "@/components/checkbox";
import { MediaData } from "@/lib/api/media";

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

const EMPTY_ROLE_MEMBER: RoleMember = {
    displayData: {
        userId: 0,
        sponsorship: SponsorType.NONE
    },
    tempRole: false
}

export default function RoleMembersEditor () {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const {entity, viewEntity, entityChanged, setEntity} = useEntityEditor<RoleData, RoleData>();
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [selectedUserTemp, setSelectedUserTemp] = useState<RoleMember> ();
    const [temporaryUserTemp, setTemporaryUserTemp] = useState<boolean>();

    const closeAddMemberModal = () => {
        setSelectedUserTemp(undefined);
        setTemporaryUserTemp(undefined);
        setAddMemberOpen(false);
    }

    const patchSelectedUserTemp = (newValue?: RoleMember) => {
        let newSelectedUserTemp: RoleMember;
        if (selectedUserTemp) {
            newSelectedUserTemp = {...selectedUserTemp, ...newValue};
        } else if (newValue) {
            newSelectedUserTemp = newValue;
        } else {
            return;
        }
        setSelectedUserTemp(newSelectedUserTemp);
    }

    const selectMember = (values: AutoInputSearchResult[], newValues?: AutoInputSearchResult[], removedValue?: AutoInputSearchResult) => {
        const value = newValues && newValues.length > 0 ? flattenSearchResult(newValues[0]) : undefined;
        patchSelectedUserTemp(value);
    }

    const setTemporary = (event: MouseEvent<HTMLButtonElement>, checked: boolean,
        setChecked: Dispatch<SetStateAction<boolean>>,
        setBusy: Dispatch<SetStateAction<boolean>>) => {
            setTemporaryUserTemp(checked);
    }

    const addMember = () => {
        if (!selectedUserTemp) return;
        const toAdd = {...selectedUserTemp, tempRole: temporaryUserTemp ?? false}
        const newEntity: RoleData = {...entity, users: [...entity.users, toAdd]};
        setEntity(newEntity);
        closeAddMemberModal();
    }

    const removeMember = (id: number) => {
        const newEntity = {...entity, users: entity.users.filter(eu=>eu.displayData.userId !== id)}
        setEntity(newEntity);
    }

    return <>
    <div className="horizontal-list gap-2mm">
        <div className="spacer"></div>
        <Button iconName={ICONS.ADD} onClick={()=>{setAddMemberOpen(true)}}>{tcommon("CRUD.add")}</Button>
    </div>
    {/* Permissions table */}
    <div className="table-container rounded-m">
        <div className="table rounded-m">
            {entity?.users?.map((roleMember, mi) => <div key={mi} className="row horizontal-list flex-vertical-center gap-2mm flex-wrap">
                <div className="data">
                    <span className="title average">{roleMember.displayData.userId}</span>
                </div>
                <div className="data">
                    <Image unoptimized src={getImageUrl(roleMember.displayData.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                        width={32} height={32} alt="image"/>
                </div>
                <div className="data">
                    <span>{roleMember.displayData.fursonaName}</span>
                </div>
                <div className="spacer"></div>
                <div className="data">
                    <Checkbox disabled initialValue={roleMember.tempRole}>
                        {t("admin.users.security.roles.input.temporary_member.label")}
                    </Checkbox>
                </div>
                <div className="data">
                    <Button iconName={ICONS.DELETE} onClick={() => removeMember(roleMember.displayData.userId)}></Button>
                </div>
            </div>)}
        </div>
    </div>
    <Modal open={addMemberOpen} onClose={()=>closeAddMemberModal()}
        title={t("admin.users.security.roles.input.add_member.label")} style={{minWidth: '400px'}}>
        <DataForm action={new DummyFormAction} shouldReset={!addMemberOpen} hideSave
            className="vertical-list gap-2mm">
            <AutoInput manager={new AutoInputUsersManager} onChange={selectMember}
                filterOut={new AutoInputFilter (entity?.users.map(eu=>eu.displayData.userId), [])}
                label={t("admin.users.security.roles.input.select_user.label")}>
            </AutoInput>
            <div className="vertical-list gap-2mm">
                <Checkbox onClick={setTemporary} initialValue={temporaryUserTemp}>
                    {t("admin.users.security.roles.input.temporary_member.label")}
                </Checkbox>
                <span className="descriptive tiny color-subtitle">
                    {t("admin.users.security.roles.input.temporary_member.help")}
                </span>
            </div>
        </DataForm>
        <div className="horizontal-list gap-4mm">
            <Button type="button" className="danger" iconName={ICONS.CANCEL} 
                onClick={()=>setAddMemberOpen(false)}>{tcommon("cancel")}</Button>
            <div className="spacer"></div>
            <Button type="submit" className="success" iconName={ICONS.CHECK}
                onClick={()=>addMember()} disabled={!!!selectedUserTemp}>
                    {tcommon("confirm")}
            </Button>
        </div>
    </Modal>
    </>
}