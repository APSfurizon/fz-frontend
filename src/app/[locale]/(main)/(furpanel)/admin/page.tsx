'use client'
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import { MouseEvent, useEffect, useState } from "react";
import { UserData } from "@/lib/api/user";
import Checkbox from "@/components/checkbox";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useTitle from "@/lib/api/hooks/useTitle";
import { useModalUpdate } from "@/lib/context/modalProvider";
import ModalError from "@/components/modalError";
import { ReloadEventApiAction, ReloadOrdersApiAction } from "@/lib/api/admin/pretix";
import { runRequest } from "@/lib/api/global";
import { AdminCapabilitesResponse, EMPTY_CAPABILITIES, ExportHotelRoomsApiAction, GetAdminCapabilitiesApiAction } from "@/lib/api/admin/admin";
import { GetRenderedBadgesApiAction, RemindBadgesApiAction, RemindFursuitBadgesApiAction, RemindOrderLinkApiAction } from "@/lib/api/admin/badge";

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
  // Event area logic

  // - orders
  const [remindOrderLinkLoading, setRemindOrderLinkLoading] = useState(false);
  const remindOrderLink = (e: MouseEvent<HTMLButtonElement>) => {
    setRemindOrderLinkLoading(true);
    runRequest(new RemindOrderLinkApiAction())
    .catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.orders.errors"/>
    )).finally(()=>setRemindOrderLinkLoading(false))
  }

  const [exportRoomsLoading, setExportRoomsLoading] = useState(false);
  const exportRooms = (e: MouseEvent<HTMLButtonElement>) => {
    setExportRoomsLoading(true);
    runRequest(new ExportHotelRoomsApiAction())
    .then ((response) => {
      const res = response as Response;
      res.blob().then((exportBlob) => {
        const result = URL.createObjectURL(exportBlob);
        window.open(result, "_blank");
        URL.revokeObjectURL(result);
      })
    }).catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.orders.errors"/>
    )).finally(()=>setExportRoomsLoading(false))
  }

  // - badge
  const [renderBadgesLoading, setRenderBadgesLoading] = useState(false);
  const renderBadges = (e: MouseEvent<HTMLButtonElement>) => {
    setRenderBadgesLoading(true);
    runRequest(new GetRenderedBadgesApiAction())
    .then ((response) => {
      const res = response as Response;
      res.blob().then((badgesBlob) => {
        const result = URL.createObjectURL(badgesBlob);
        window.open(result, "_blank");
        URL.revokeObjectURL(result);
      })
    }).catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors"/>
    )).finally(()=>setRenderBadgesLoading(false))
  }

  const [remindBadgesLoading, setRemindBadgesLoading] = useState(false);
  const remindBadges = (e: MouseEvent<HTMLButtonElement>) => {
    setRemindBadgesLoading(true);
    runRequest(new RemindBadgesApiAction())
    .catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors"/>
    )).finally(()=>setRemindBadgesLoading(false))
  }

  const [remindFursuitBadgesLoading, setRemindFursuitBadgesLoading] = useState(false);
  const remindFursuitBadges = (e: MouseEvent<HTMLButtonElement>) => {
    setRemindFursuitBadgesLoading(true);
    runRequest(new RemindFursuitBadgesApiAction())
    .catch((err)=>showModal(
      tcommon("error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors"/>
    )).finally(()=>setRemindFursuitBadgesLoading(false))
  }

  return (
    <div className="page">
      {/* Pretix area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.CONFIRMATION_NUMBER}></Icon>
          <span className="title medium">{t("admin.pretix.title")}</span>
        </div>
        {/* Shop data area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.pretix.data.title")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm">
            <Button iconName={ICONS.EVENT_REPEAT} onClick={reloadEvent} debounce={5000}
              busy={reloadEventLoading} disabled={!capabilities.canRefreshPretixCache}>
              {t("admin.pretix.data.reload_event")}
            </Button>
            <Button iconName={ICONS.SYNC} onClick={reloadOrders} debounce={5000}
              busy={reloadOrdersLoading} disabled={!capabilities.canRefreshPretixCache}>
              {t("admin.pretix.data.reload_orders")}
            </Button>
          </div>
        </div>
      </div>
      {/* Event area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.LOCAL_ACTIVITY}></Icon>
          <span className="title medium">{t("admin.events.title")}</span>
        </div>
        {/* badge area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.events.badges.title")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm flex-wrap">
            <Button iconName={ICONS.PRINT} onClick={renderBadges} debounce={5000}
              busy={renderBadgesLoading} disabled={!capabilities.canRefreshPretixCache}>
              {t("admin.events.badges.print_badges")}
            </Button>
            <Button iconName={ICONS.MAIL} onClick={remindBadges} debounce={5000}
              busy={remindBadgesLoading} disabled={!capabilities.canRemindBadgeUploads}>
              {t("admin.events.badges.remind_badges")}
            </Button>
            <Button iconName={ICONS.MAIL} onClick={remindFursuitBadges} debounce={5000}
              busy={remindFursuitBadgesLoading} disabled={!capabilities.canRemindBadgeUploads}>
              {t("admin.events.badges.remind_fursuits")}
            </Button>
          </div>
        </div>
        {/* orders area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.events.orders.title")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm flex-wrap">
            <Button iconName={ICONS.DOWNLOAD} onClick={exportRooms} debounce={5000}
              busy={exportRoomsLoading} disabled={!capabilities.canExportHotelList}>
              {t("admin.events.orders.export_rooms")}
            </Button>
            <Button iconName={ICONS.MAIL} onClick={remindOrderLink} debounce={5000}
              busy={remindOrderLinkLoading} disabled={!capabilities.canRemindOrderLinking}>
              {t("admin.events.orders.remind_order_linking")}
            </Button>
          </div>
        </div>
      </div>
      {/* Users area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.PERSON}></Icon>
          <span className="title medium">{t("admin.users.title")}</span>
        </div>
        {/* Users generic area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.users.accounts.title")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm">
            <Button iconName={ICONS.PERSON_SEARCH} onClick={()=>router.push("/admin/users/")}
              disabled={!capabilities.canManageMembershipCards}>
              {t("admin.users.accounts.view.title")}
            </Button>
          </div>
        </div>
        {/* Users security area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.users.security.title")}
            </span>
          </div>
          <div className="horizontal-list gap-2mm">
            <Button iconName={ICONS.GROUPS} onClick={()=>router.push("/admin/roles/")}
              disabled={!capabilities.canManageMembershipCards}>
              {t("admin.users.security.roles.title")}
            </Button>
          </div>
        </div>
      </div>
      {/* Membership area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.ID_CARD}></Icon>
          <span className="title medium">{t("admin.membership.title")}</span>
        </div>
        {/* Membership card area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.membership.cards.title")}
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
