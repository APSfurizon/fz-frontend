"use client"
import AutoInput from "@/components/autoInput";
import Button from "@/components/button";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import { ICONS } from "@/components/icon";
import Modal from "@/components/modal";
import { RoleData, RoleMember, RoleOutputData, RoleOutputMember } from "@/lib/api/admin/role";
import { AutoInputUsersManager } from "@/lib/api/user";
import { AutoInputFilter, AutoInputSearchResult } from "@/lib/components/autoInput";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import "@/styles/table.css";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import DataForm from "@/components/dataForm";
import { DummyFormAction } from "@/lib/components/dataForm";

interface RoleMemberTemp {
    userId: number,
    name: string,
    profilePictureUrl?: string,
    temporaryRole: boolean
}

function flattenRoleMember(member: RoleMember): RoleMemberTemp {
    return {
        userId: member.displayData.userId,
        name: member.displayData.fursonaName!,
        profilePictureUrl: member.displayData.propic?.mediaUrl,
        temporaryRole: member.tempRole
    }
}

function flattenSearchResult(searchResult: AutoInputSearchResult): RoleMemberTemp {
    return {
        userId: searchResult.id!,
        name: searchResult.description!,
        profilePictureUrl: searchResult.imageUrl,
        temporaryRole: false
    }
}

export default function RoleMembersEditor () {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const {entity, viewEntity, entityChanged, setEntity} = useEntityEditor<RoleOutputData, RoleData>();
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [loadedUsersCache, setLoadedUsersCache] = useState<Record<number, RoleMemberTemp>> ({});
    const [selectedUserTemp, setSelectedUserTemp] = useState<RoleMemberTemp> ();

    useEffect(()=>{
        const flattenedUsers: RoleMemberTemp[] = viewEntity?.users.map(veu => flattenRoleMember(veu)) ?? [];
        const flattenedRecords: Record<number, RoleMemberTemp> = Object.fromEntries(flattenedUsers.map(fu=>[fu.userId, fu]));
        setLoadedUsersCache(flattenedRecords);
    }, [viewEntity]);

    const closeAddMemberModal = () => {
        setSelectedUserTemp(undefined);
        setAddMemberOpen(false);
    }

    const selectMember = (values: AutoInputSearchResult[], newValues?: AutoInputSearchResult[], removedValue?: AutoInputSearchResult) => {
        const value = newValues && newValues.length > 0 ? flattenSearchResult(newValues[0]) : undefined;
        setSelectedUserTemp(value);
    }

    const addMember = () => {
        if (!selectedUserTemp) return;
        const newMember: RoleOutputMember = {
            userId: selectedUserTemp.userId,
            tempRole: false
        }
        const newEntity: RoleOutputData = {...entity, users: [...entity.users, newMember]};
        const newUserCache = {...loadedUsersCache}
        newUserCache[selectedUserTemp.userId] = selectedUserTemp;
        setLoadedUsersCache(newUserCache);
        setEntity(newEntity);
        closeAddMemberModal();
    }

    const removeMember = (id: number) => {
        const newEntity = {...entity, users: entity.users.filter(eu=>eu.userId !== id)}
        const newUserCache = {...loadedUsersCache}
        delete newUserCache[id];
        setLoadedUsersCache(newUserCache);
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
                    <span className="title average">{roleMember.userId}</span>
                </div>
                <div className="data">
                    <Image unoptimized src={getImageUrl(loadedUsersCache[roleMember.userId]?.profilePictureUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                        width={32} height={32} alt="image"/>
                </div>
                <div className="data">
                    <span>{loadedUsersCache[roleMember.userId]?.name}</span>
                </div>
                <div className="spacer"></div>
                <div className="data">
                    <Button iconName={ICONS.DELETE} onClick={() => removeMember(roleMember.userId)}></Button>
                </div>
            </div>)}
        </div>
    </div>
    <Modal open={addMemberOpen} onClose={()=>closeAddMemberModal()}
        title={t("admin.users.security.roles.input.add_member.label")} style={{minWidth: '400px'}}>
        <DataForm action={new DummyFormAction} shouldReset={!addMemberOpen} hideSave>
            <AutoInput manager={new AutoInputUsersManager} onChange={selectMember}
                filterOut={new AutoInputFilter (entity?.users.map(eu=>eu.userId), [])}>
            </AutoInput>
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