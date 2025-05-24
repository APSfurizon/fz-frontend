import { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import { GetUserAdminViewResponse, ShowInNosecountApiAction, ShowInNosecountApiInput } from "@/lib/api/admin/userView";
import { runRequest } from "@/lib/api/global";
import { getFlagEmoji } from "@/lib/components/userPicture";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function UserViewBadge({
    userData,
    reloadData,
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: () => void
}>) {
    const t = useTranslations();

    const [nosecountSetLoading, setNosecountSetLoading] = useState(false);
    const toggleShowInNosecount = (show: boolean) => {
        setNosecountSetLoading(true);
        const data: ShowInNosecountApiInput = {
            userId: userData.badgeData.mainBadge!.userId,
            showInNosecount: show
        }
        runRequest(new ShowInNosecountApiAction(), undefined, data)
        .then(()=>{reloadData()})
        .catch(()=>{})
        .finally(()=>setNosecountSetLoading(false));
    }

    return <>
    <div className="horizontal-list gap-4mm flex-wrap">
        <div className="user-picture-container vertical-list flex-vertical-center">
            <div className="image-container rounded-m">
                <Image unoptimized className="rounded-s profile-picture"
                    src={getImageUrl(userData.badgeData.mainBadge?.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                    alt={t("common.header.alt_profile_picture")} quality={100} width={128} height={128}>
                </Image>
            </div>
        </div>
        <div className="vertical-list title gap-2mm">
            <div className="horizontal-list">
                <p className="average">
                    <span className="bold">{t("furpanel.admin.users.accounts.view.badges.fursona_name")}:</span>
                    &nbsp;
                    {userData.badgeData.mainBadge?.fursonaName}
                </p>
            </div>
            <div className="horizontal-list">
                <p className="average">
                    <span className="bold">{t("furpanel.admin.users.accounts.view.badges.locale")}:</span>
                    &nbsp;
                    {getFlagEmoji(userData.badgeData.mainBadge?.locale ?? 'un')}
                </p>
            </div>
            <div className="spacer"></div>
            <div className="horizontal-list gap-2mm flex-wrap">
                <Button iconName={ICONS.DELETE}>
                    {t("furpanel.admin.users.accounts.view.badges.delete_badge_picture")}
                </Button>
                <Button iconName={userData.showInNousecount ? ICONS.VISIBILITY_OFF : ICONS.VISIBILITY}
                    busy={nosecountSetLoading}
                    onClick={()=>toggleShowInNosecount(!userData.showInNousecount)}>
                    {userData.showInNousecount
                        ? t("furpanel.admin.users.accounts.view.badges.hide_from_nosecount")
                        : t("furpanel.admin.users.accounts.view.badges.show_from_nosecount")}
                </Button>
            </div>
        </div>
    </div>
    </>;
}