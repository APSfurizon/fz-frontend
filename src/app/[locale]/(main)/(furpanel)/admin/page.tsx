'use client'
import Button from "@/components/input/button";
import { ICONS } from "@/components/icon";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useTitle from "@/lib/api/hooks/useTitle";
import { useModalUpdate } from "@/components/context/modalProvider";
import ModalError from "@/components/modalError";
import { ReloadEventApiAction, ReloadOrdersApiAction } from "@/lib/api/admin/pretix";
import { runRequest } from "@/lib/api/global";
import { AdminCapabilitesResponse, EMPTY_CAPABILITIES, ExportHotelRoomsApiAction,
  GetAdminCapabilitiesApiAction } from "@/lib/api/admin/admin";
import { RemindBadgesApiAction, RemindFursuitBadgesApiAction, RemindOrderLinkApiAction,
  RemindRoomsNotFullApiAction } from "@/lib/api/admin/badge";
import BadgePrintingDialog from "./_dialogs/badgePrinting";
import FpMacroSection from "./_components/fpMacroSection";
import FpSection from "./_components/fpSection";
import LoadingPanel from "@/components/loadingPanel";

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const {showModal} = useModalUpdate();
  useTitle(t("furpanel.admin.title"));

  // Capabilities logic

  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<AdminCapabilitesResponse>(EMPTY_CAPABILITIES);

  useEffect(() => {
    setLoading(true);
    runRequest(new GetAdminCapabilitiesApiAction())
    .then ((result) => setCapabilities(result as AdminCapabilitesResponse))
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.errors"/>
    )).finally(()=>setLoading(false));
  }, [])

  // Pretix area logic

  // - Pretix data
  const [reloadEventLoading, setReloadEventLoading] = useState(false);
  const reloadEvent = () => {
    setReloadEventLoading(true);
    runRequest(new ReloadEventApiAction())
    .then(()=>{})
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix.data.errors"/>
    )).finally(()=>setReloadEventLoading(false));
  }

  const [reloadOrdersLoading, setReloadOrdersLoading] = useState(false);
  const reloadOrders = () => {
    setReloadOrdersLoading(true);
    runRequest(new ReloadOrdersApiAction())
    .then(()=>{})
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix.data.errors"/>
    )).finally(()=>setReloadOrdersLoading(false));
  }
  // Event area logic

  // - orders
  const [remindOrderLinkLoading, setRemindOrderLinkLoading] = useState(false);
  const remindOrderLink = () => {
    setRemindOrderLinkLoading(true);
    runRequest(new RemindOrderLinkApiAction())
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.orders.errors"/>
    )).finally(()=>setRemindOrderLinkLoading(false))
  }

  const [exportRoomsLoading, setExportRoomsLoading] = useState(false);
  const exportRooms = () => {
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
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.orders.errors"/>
    )).finally(()=>setExportRoomsLoading(false))
  }

  // - rooms
  const [remindRoomsNotFullLoading, setRemindRoomsNotFullLoading] = useState(false);
  const remindRoomsNotFull = () => {
    setRemindRoomsNotFullLoading(true);
    runRequest(new RemindRoomsNotFullApiAction())
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.rooms.errors"/>
    )).finally(()=>setRemindRoomsNotFullLoading(false))
  }
  // - badge
  const [renderBadgesLoading, setRenderBadgesLoading] = useState(false);
  const [renderBadgesModalOpen, setRenderBadgesModalOpen] = useState(false);

  const [remindBadgesLoading, setRemindBadgesLoading] = useState(false);
  const remindBadges = () => {
    setRemindBadgesLoading(true);
    runRequest(new RemindBadgesApiAction())
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors"/>
    )).finally(()=>setRemindBadgesLoading(false))
  }

  const [remindFursuitBadgesLoading, setRemindFursuitBadgesLoading] = useState(false);
  const remindFursuitBadges = () => {
    setRemindFursuitBadgesLoading(true);
    runRequest(new RemindFursuitBadgesApiAction())
    .catch((err)=>showModal(
      t("common.error"), 
      <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors"/>
    )).finally(()=>setRemindFursuitBadgesLoading(false))
  }

  return <>
    <div className="page">
      {loading && <LoadingPanel/>}
      {/* Pretix area */}
      <FpMacroSection title={t("furpanel.admin.pretix.title")} icon={ICONS.CONFIRMATION_NUMBER}>
        <FpSection title={t("furpanel.admin.pretix.data.title")}>
          <Button iconName={ICONS.EVENT_REPEAT} onClick={reloadEvent} debounce={5000}
            busy={reloadEventLoading} disabled={!capabilities.canRefreshPretixCache}>
            {t("furpanel.admin.pretix.data.reload_event")}
          </Button>
          <Button iconName={ICONS.SYNC} onClick={reloadOrders} debounce={5000}
            busy={reloadOrdersLoading} disabled={!capabilities.canRefreshPretixCache}>
            {t("furpanel.admin.pretix.data.reload_orders")}
          </Button>
        </FpSection>
      </FpMacroSection>
      {/* Event area */}
      <FpMacroSection title={t("furpanel.admin.events.title")} icon={ICONS.LOCAL_ACTIVITY}>
        <FpSection title={t("furpanel.admin.events.badges.title")}>
          <Button iconName={ICONS.PRINT} onClick={() => setRenderBadgesModalOpen(true)}
            busy={renderBadgesLoading} disabled={!capabilities.canRefreshPretixCache}>
            {t("furpanel.admin.events.badges.print_badges")}
          </Button>
          <Button iconName={ICONS.MAIL} onClick={remindBadges} debounce={5000}
            busy={remindBadgesLoading} disabled={!capabilities.canRemindBadgeUploads}>
            {t("furpanel.admin.events.badges.remind_badges")}
          </Button>
          <Button iconName={ICONS.MAIL} onClick={remindFursuitBadges} debounce={5000}
            busy={remindFursuitBadgesLoading} disabled={!capabilities.canRemindBadgeUploads}>
            {t("furpanel.admin.events.badges.remind_fursuits")}
          </Button>
        </FpSection>
        <FpSection title={t("furpanel.admin.events.rooms.title")}>
          <Button iconName={ICONS.MAIL} onClick={remindRoomsNotFull} debounce={5000}
            busy={remindRoomsNotFullLoading} disabled={!capabilities.canRemindRoomsNotFull}>
            {t("furpanel.admin.events.rooms.remind_rooms_not_full")}
          </Button>
        </FpSection>
        <FpSection title={t("furpanel.admin.events.orders.title")}>
          <Button iconName={ICONS.DOWNLOAD} onClick={exportRooms} debounce={5000}
            busy={exportRoomsLoading} disabled={!capabilities.canExportHotelList}>
            {t("furpanel.admin.events.orders.export_rooms")}
          </Button>
          <Button iconName={ICONS.MAIL} onClick={remindOrderLink} debounce={5000}
            busy={remindOrderLinkLoading} disabled={!capabilities.canRemindOrderLinking}>
            {t("furpanel.admin.events.orders.remind_order_linking")}
          </Button>
        </FpSection>
      </FpMacroSection>
      {/** Users area */}
      <FpMacroSection title={t("furpanel.admin.users.title")} icon={ICONS.PERSON}>
        <FpSection title={t("furpanel.admin.users.accounts.title")}>
          <Button iconName={ICONS.PERSON_SEARCH} onClick={()=>router.push("/admin/users/")}
            disabled={!capabilities.canManageMembershipCards}>
            {t("furpanel.admin.users.accounts.view.title")}
          </Button>
        </FpSection>
        <FpSection title={t("furpanel.admin.users.security.title")}>
          <Button iconName={ICONS.GROUPS} onClick={()=>router.push("/admin/roles/")}
            disabled={!capabilities.canUpgradeUser}>
            {t("furpanel.admin.users.security.roles.title")}
          </Button>
        </FpSection>
        <FpSection title={t("furpanel.admin.membership.title")}>
          <Button iconName={ICONS.ID_CARD} onClick={()=>router.push("/admin/memberships/a")}
            disabled={!capabilities.canManageMembershipCards}>
            {t("furpanel.admin.membership_manager.title")}
          </Button>
        </FpSection>
      </FpMacroSection>
    </div>
    <BadgePrintingDialog open={renderBadgesModalOpen} onClose={()=>setRenderBadgesModalOpen(false)}
      loading={renderBadgesLoading} setLoading={setRenderBadgesLoading}/>
  </>;
}
