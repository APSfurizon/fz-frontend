'use client'
import UserPicture from "@/app/_components/userPicture";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { MouseEvent, useEffect, useState } from "react";
import { UserData } from "@/app/_lib/api/user";
import Checkbox from "@/app/_components/checkbox";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import ModalError from "@/app/_components/modalError";
import { ReloadEventApiAction, ReloadOrdersApiAction } from "@/app/_lib/api/admin/pretix";
import { runRequest } from "@/app/_lib/api/global";
import { AdminCapabilitesResponse, EMPTY_CAPABILITIES, GetAdminCapabilitiesApiAction } from "@/app/_lib/api/admin/admin";

export default function AdminPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const router = useRouter();
  const {showModal} = useModalUpdate();
  useTitle(t("admin.title"));

  // Capabilities logic

  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<AdminCapabilitesResponse>(EMPTY_CAPABILITIES);

  useEffect(() => {
    setLoading(true);
    runRequest(new GetAdminCapabilitiesApiAction ())
    .then ((result) => setCapabilities(result as AdminCapabilitesResponse))
    .catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.errors"/>
    )).finally(()=>setLoading(false));
  }, [])

  // Pretix area logic

  // - Pretix data
  const [reloadEventLoading, setReloadEventLoading] = useState(false);
  const reloadEvent = (e: MouseEvent<HTMLButtonElement>) => {
    setReloadEventLoading(true);
    runRequest(new ReloadEventApiAction())
    .then((result)=>{})
    .catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix_data.errors"/>
    )).finally(()=>setReloadEventLoading(false));
  }

  const [reloadOrdersLoading, setReloadOrdersLoading] = useState(false);
  const reloadOrders = (e: MouseEvent<HTMLButtonElement>) => {
    setReloadOrdersLoading(true);
    runRequest(new ReloadOrdersApiAction())
    .then((result)=>{})
    .catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix_data.errors"/>
    )).finally(()=>setReloadOrdersLoading(false));
  }

  return (
    <div className="page">
      {/* Pretix area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.CONFIRMATION_NUMBER}></Icon>
          <span className="title medium">{t("admin.sections.pretix")}</span>
        </div>
        {/* Shop data area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.sections.pretix_data")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm">
            <Button iconName={ICONS.EVENT_REPEAT} onClick={reloadEvent} debounce={5000}
              busy={reloadEventLoading} disabled={!capabilities.canRefreshPretixCache}>
              {t("admin.pretix_data.reload_event")}
            </Button>
            <Button iconName={ICONS.SYNC} onClick={reloadOrders} debounce={5000}
              busy={reloadOrdersLoading} disabled={!capabilities.canRefreshPretixCache}>
              {t("admin.pretix_data.reload_orders")}
            </Button>
          </div>
        </div>
      </div>
      {/* Users area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.PERSON}></Icon>
          <span className="title medium">{t("admin.sections.users")}</span>
        </div>
        {/* Users generic area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.sections.users_accounts")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm">
            <Button iconName={ICONS.PERSON_SEARCH} onClick={()=>router.push("/admin/users/")}
              disabled={!capabilities.canManageMembershipCards}>
              {t("admin.users.title")}
            </Button>
          </div>
        </div>
      </div>
      {/* Membership area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.ID_CARD}></Icon>
          <span className="title medium">{t("admin.sections.membership")}</span>
        </div>
        {/* Membership card area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.sections.membership_cards")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm">
            <Button iconName={ICONS.ID_CARD} onClick={()=>router.push("/admin/memberships/a")}
              disabled={!capabilities.canManageMembershipCards}>
              {t("admin.membership_manager.title")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
