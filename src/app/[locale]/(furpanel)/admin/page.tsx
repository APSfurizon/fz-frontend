'use client'
import Button from "@/components/input/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import { ReloadEventApiAction, ReloadOrdersApiAction } from "@/lib/api/admin/pretix";
import { runRequest } from "@/lib/api/global";
import {
  AdminCapabilitesResponse, ExportHotelRoomsApiAction,
  ExportTShirtsApiAction, GetAdminCapabilitiesApiAction
} from "@/lib/api/admin/admin";
import {
  RemindBadgesApiAction, RemindFursuitBadgesApiAction,
  RemindFursuitBringToEventApiAction, RemindOrderLinkApiAction,
  RemindRoomsNotFullApiAction
} from "@/lib/api/admin/badge";
import BadgePrintingDialog from "./_dialogs/badgePrinting";
import FpMacroSection from "./_components/fpMacroSection";
import FpSection from "./_components/fpSection";
import LoadingPanel from "@/components/loadingPanel";
import { PingApiAction } from "@/lib/api/admin/system";
import { useUser } from "@/components/context/userProvider";

const ADMIN_ROLE_NAMES = new Set(["root", "main_staff", "super_admin", "admin"]);

function normalizeRole(internalName?: string) {
  return (internalName ?? "").toLowerCase().trim();
}

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const { showModal } = useModalUpdate();
  const { userDisplay } = useUser();
  useTitle(t("furpanel.admin.title"));

  const roles = userDisplay?.roles ?? [];
  const isTeamSecurity = roles.some((role) => normalizeRole(role.internalName) === "team_security");
  const isAdminRole = roles.some((role) => ADMIN_ROLE_NAMES.has(normalizeRole(role.internalName)));
  const securityOnlyMode = isTeamSecurity && !isAdminRole;

  // Capabilities logic

  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<AdminCapabilitesResponse>();

  useEffect(() => {
    setLoading(true);
    runRequest({ action: new GetAdminCapabilitiesApiAction() })
      .then((result) => setCapabilities(result))
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setLoading(false));
  }, [])

  // System area logic

  // - Server area
  const [pingLoading, setPingLoading] = useState(false);
  const ping = () => {
    setPingLoading(true);
    runRequest({ action: new PingApiAction() })
      .then((e) => showModal(
        t("common.success"),
        <span>{e.message}</span>
      )).catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setPingLoading(false));
  }

  // Pretix area logic

  // - Pretix data
  const [reloadEventLoading, setReloadEventLoading] = useState(false);
  const reloadEvent = () => {
    setReloadEventLoading(true);
    runRequest({ action: new ReloadEventApiAction() })
      .then(() => { })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setReloadEventLoading(false));
  }

  const [reloadOrdersLoading, setReloadOrdersLoading] = useState(false);
  const reloadOrders = () => {
    setReloadOrdersLoading(true);
    runRequest({ action: new ReloadOrdersApiAction() })
      .then(() => { })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setReloadOrdersLoading(false));
  }
  // Event area logic

  // - orders
  const [remindOrderLinkLoading, setRemindOrderLinkLoading] = useState(false);
  const remindOrderLink = () => {
    setRemindOrderLinkLoading(true);
    runRequest({ action: new RemindOrderLinkApiAction() })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setRemindOrderLinkLoading(false))
  }

  const [exportRoomsLoading, setExportRoomsLoading] = useState(false);
  const exportRooms = () => {
    setExportRoomsLoading(true);
    runRequest({ action: new ExportHotelRoomsApiAction() })
      .then((response) => {
        response.blob().then((exportBlob) => {
          const result = URL.createObjectURL(exportBlob);
          window.open(result, "_blank");
          URL.revokeObjectURL(result);
        })
      }).catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setExportRoomsLoading(false))
  }

  const [exportShirtsLoading, setExportShirtsLoading] = useState(false);
  const exportShirts = () => {
    setExportShirtsLoading(true);
    runRequest({ action: new ExportTShirtsApiAction() })
      .then((response) => {
        response.blob().then((exportBlob) => {
          const result = URL.createObjectURL(exportBlob);
          window.open(result, "_blank");
          URL.revokeObjectURL(result);
        })
      }).catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setExportShirtsLoading(false))
  }

  // - rooms
  const [remindRoomsNotFullLoading, setRemindRoomsNotFullLoading] = useState(false);
  const remindRoomsNotFull = () => {
    setRemindRoomsNotFullLoading(true);
    runRequest({ action: new RemindRoomsNotFullApiAction() })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setRemindRoomsNotFullLoading(false))
  }
  // - badge
  const [renderBadgesLoading, setRenderBadgesLoading] = useState(false);
  const [renderBadgesModalOpen, setRenderBadgesModalOpen] = useState(false);

  const [remindBadgesLoading, setRemindBadgesLoading] = useState(false);
  const remindBadges = () => {
    setRemindBadgesLoading(true);
    runRequest({ action: new RemindBadgesApiAction() })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setRemindBadgesLoading(false))
  }

  const [remindFursuitBadgesLoading, setRemindFursuitBadgesLoading] = useState(false);
  const remindFursuitBadges = () => {
    setRemindFursuitBadgesLoading(true);
    runRequest({ action: new RemindFursuitBadgesApiAction() })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setRemindFursuitBadgesLoading(false))
  }

  const [remindFursuitBringToEventLoading, setRemindFursuitBringToEventLoading] = useState(false);
  const remindFursuitBringToEvent = () => {
    setRemindFursuitBringToEventLoading(true);
    runRequest({ action: new RemindFursuitBringToEventApiAction() })
      .catch((err) => showModal(
        t("common.error"),
        <ErrorMessage error={err} />
      )).finally(() => setRemindFursuitBringToEventLoading(false))
  }

  return <>
    <div className="stretch-page">
      {loading && <LoadingPanel />}
      {/* Security area */}
      <FpMacroSection title="Gestione Security" icon="SECURITY">
        <FpSection title="Utenti e Documenti">
          <Button icon="PERSON_SEARCH" onClick={() => router.push("/admin/security/user-search")}>
            Ricerca Utente
          </Button>
          <Button icon="FIND_IN_PAGE" onClick={() => router.push("/admin/security/documents")}>
            Documents
          </Button>
        </FpSection>
        <FpSection title="Segnalazioni">
          <Button icon="BOOKMARK_STAR" onClick={() => router.push("/admin/security/incidents")}>
            Registro Incidenti
          </Button>
        </FpSection>
        <FpSection title="Registri">
          <Button icon="PACKAGE_2" onClick={() => router.push("/admin/security/assets")}>
            Asset Manager
          </Button>
          <Button icon="ERROR" onClick={() => router.push("/admin/security/hazardous")}>
            Hazardous Register
          </Button>
          <Button icon="SEARCH" onClick={() => router.push("/admin/security/lost-found")}>
            Lost and Found
          </Button>
        </FpSection>
      </FpMacroSection>
      {!securityOnlyMode && <>
        {/* System area */}
        <FpMacroSection title={t("furpanel.admin.system.title")} icon="CONFIRMATION_NUMBER">
          <FpSection title={t("furpanel.admin.system.server.title")}>
            <Button icon="VITAL_SIGNS" onClick={ping} debounce={5000}
              busy={pingLoading} disabled={!capabilities?.canRefreshPretixCache}>
              {t("furpanel.admin.system.server.ping")}
            </Button>
          </FpSection>
        </FpMacroSection>
        {/* Pretix area */}
        <FpMacroSection title={t("furpanel.admin.pretix.title")} icon="CONFIRMATION_NUMBER">
          <FpSection title={t("furpanel.admin.pretix.data.title")}>
            <Button icon="EVENT_REPEAT" onClick={reloadEvent} debounce={5000}
              busy={reloadEventLoading} disabled={!capabilities?.canRefreshPretixCache}>
              {t("furpanel.admin.pretix.data.reload_event")}
            </Button>
            <Button icon="SYNC" onClick={reloadOrders} debounce={5000}
              busy={reloadOrdersLoading} disabled={!capabilities?.canRefreshPretixCache}>
              {t("furpanel.admin.pretix.data.reload_orders")}
            </Button>
          </FpSection>
        </FpMacroSection>
        {/* Event area */}
        <FpMacroSection title={t("furpanel.admin.events.title")} icon="LOCAL_ACTIVITY">
          <FpSection title={t("furpanel.admin.events.badges.title")}>
            <Button icon="PRINT" onClick={() => setRenderBadgesModalOpen(true)}
              busy={renderBadgesLoading} disabled={!capabilities?.canExportBadges}>
              {t("furpanel.admin.events.badges.print_badges")}
            </Button>
            <Button icon="MAIL" onClick={remindBadges} debounce={5000}
              busy={remindBadgesLoading} disabled={!capabilities?.canRemindBadgeUploads}>
              {t("furpanel.admin.events.badges.remind_badges")}
            </Button>
            <Button icon="MAIL" onClick={remindFursuitBadges} debounce={5000}
              busy={remindFursuitBadgesLoading} disabled={!capabilities?.canRemindBadgeUploads}>
              {t("furpanel.admin.events.badges.remind_fursuits")}
            </Button>
            <Button icon="MAIL" onClick={remindFursuitBringToEvent} debounce={5000}
              busy={remindFursuitBringToEventLoading} disabled={!capabilities?.canRemindFursuitBringToEvent}>
              {t("furpanel.admin.events.badges.remind_fursuits_bring_to_event")}
            </Button>
          </FpSection>
          <FpSection title={t("furpanel.admin.events.rooms.title")}>
            <Button icon="MAIL" onClick={remindRoomsNotFull} debounce={5000}
              busy={remindRoomsNotFullLoading} disabled={!capabilities?.canRemindRoomsNotFull}>
              {t("furpanel.admin.events.rooms.remind_rooms_not_full")}
            </Button>
          </FpSection>
          <FpSection title={t("furpanel.admin.events.orders.title")}>
            <Button icon="DOWNLOAD" onClick={exportRooms} debounce={5000}
              busy={exportRoomsLoading} disabled={!capabilities?.canExportHotelList}>
              {t("furpanel.admin.events.orders.export_rooms")}
            </Button>
            <Button icon="DOWNLOAD" onClick={exportShirts} debounce={5000}
              busy={exportShirtsLoading} disabled={!capabilities?.canExportShirtList}>
              {t("furpanel.admin.events.orders.export_tshirts")}
            </Button>
            <Button icon="MAIL" onClick={remindOrderLink} debounce={5000}
              busy={remindOrderLinkLoading} disabled={!capabilities?.canRemindOrderLinking}>
              {t("furpanel.admin.events.orders.remind_order_linking")}
            </Button>
          </FpSection>
        </FpMacroSection>
        {/** Users area */}
        <FpMacroSection title={t("furpanel.admin.users.title")} icon="PERSON">
          <FpSection title={t("furpanel.admin.users.accounts.title")}>
            <Button icon="PERSON_SEARCH" onClick={() => router.push("/admin/users/")}
              disabled={!capabilities?.canViewUsers}>
              {t("furpanel.admin.users.accounts.view.title")}
            </Button>
          </FpSection>
          <FpSection title={t("furpanel.admin.users.security.title")}>
            <Button icon="GROUPS" onClick={() => router.push("/admin/roles/")}
              disabled={!capabilities?.canUpgradeUser}>
              {t("furpanel.admin.users.security.roles.title")}
            </Button>
          </FpSection>
          <FpSection title={t("furpanel.admin.membership.title")}>
            <Button icon="ID_CARD" onClick={() => router.push("/admin/memberships/a")}
              disabled={!capabilities?.canManageMembershipCards}>
              {t("furpanel.admin.membership_manager.title")}
            </Button>
          </FpSection>
        </FpMacroSection>
      </>}
    </div>
    <BadgePrintingDialog open={renderBadgesModalOpen} onClose={() => setRenderBadgesModalOpen(false)}
      loading={renderBadgesLoading} setLoading={setRenderBadgesLoading} />
  </>;
}
