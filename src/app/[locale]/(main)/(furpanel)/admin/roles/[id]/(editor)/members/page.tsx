"use client"
import AutoInput from "@/components/autoInput";
import Button from "@/components/button";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import { ICONS } from "@/components/icon";
import Modal from "@/components/modal";
import { RoleData, RoleMember, RoleOutputData } from "@/lib/api/admin/role";
import { AutoInputUsersManager } from "@/lib/api/user";
import { AutoInputFilter, AutoInputSearchResult } from "@/lib/components/autoInput";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import "@/styles/table.css";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface RoleMemberTemp {
    userId: number,
    name: string,
    profilePictureUrl: string,
    temporaryRole: boolean
}

function flattenRoleMember(member: RoleMember): RoleMemberTemp {
    return {
        userId: member.displayData.userId,
        name: member.displayData.fursonaName!,
        profilePictureUrl: member.displayData.propic?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC,
        temporaryRole: member.tempRole
    }
}

export default function RoleMembersEditor () {
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const {entity, viewEntity, entityChanged, setEntity} = useEntityEditor<RoleOutputData, RoleData>();
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [loadedUsersCache, setLoadedUsersCache] = useState<Record<number, RoleMemberTemp>> ({});
    const [selectedUserTemp, setSelectedUserTemp] = useState<string> ();

    useEffect(()=>{
        const flattenedUsers: RoleMemberTemp[] = viewEntity?.users.map(veu => flattenRoleMember(veu)) ?? [];
        const flattenedRecords: Record<number, RoleMemberTemp> = Object.fromEntries(flattenedUsers.map(fu=>[fu.userId, fu]));
        setLoadedUsersCache(flattenedRecords);
    }, [viewEntity]);

    const closeAddMemberModal = () => {
        setAddMemberOpen(false);
    }

    const selectMember = (values: AutoInputSearchResult[], newValues?: AutoInputSearchResult[], removedValue?: AutoInputSearchResult) => {

    }

    const addMember = () => {
        
    }

    const removeMember = (id: number) => {

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
        <AutoInput manager={new AutoInputUsersManager} onChange={selectMember}
            filterOut={new AutoInputFilter (entity?.users.map(eu=>eu.userId), [])}>
        </AutoInput>
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