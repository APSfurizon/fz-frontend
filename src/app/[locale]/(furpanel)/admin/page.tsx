"use client";
import FpButton from "@/components/input/fpButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import { ReloadEventApiAction, ReloadOrdersApiAction } from "@/lib/api/admin/pretix";
import { runRequest } from "@/lib/api/networking/main";
import {
  AdminCapabilitesResponse,
  ExportHotelRoomsApiAction,
  ExportTShirtsApiAction,
  GetAdminCapabilitiesApiAction,
} from "@/lib/api/admin/admin";
import {
  RemindBadgesApiAction,
  RemindFursuitBadgesApiAction,
  RemindFursuitBringToEventApiAction,
  RemindOrderLinkApiAction,
  RemindRoomsNotFullApiAction,
  SendMembershipCardByMailApiAction,
} from "@/lib/api/admin/badge";
import BadgePrintingDialog from "./_dialogs/badgePrinting";
import FpMacroSection from "./_components/fpMacroSection";
import FpSection from "./_components/fpSection";
import LoadingPanel from "@/components/loadingPanel";
import { PingApiAction } from "@/lib/api/admin/system";
import { ApiErrorResponse } from "@/lib/api/networking";

export default function AdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { showModal } = useModalUpdate();
  useTitle(t("furpanel.admin.title"));

  // Capabilities logic
  const [loading, setLoading] = useState(false);
  const [securityOnlyMode, setSecurityOnlyMode] = useState(false);
  const [capabilities, setCapabilities] = useState<AdminCapabilitesResponse>();

  useEffect(() => {
    setLoading(true);
    runRequest({ action: new GetAdminCapabilitiesApiAction() })
      .then((result) => {
        if (
          !result.canBanUsers &&
          !result.canChangeLoginData &&
          !result.canUpgradeUser &&
          !result.canManageMembershipCards &&
          !result.canRefreshPretixCache &&
          !result.canRemindOrderLinking &&
          !result.canRemindBadgeUploads &&
          !result.canRemindRoomsNotFull &&
          !result.canRemindFursuitBringToEvent &&
          !result.canViewUsers &&
          !result.canExportHotelList &&
          !result.canExportShirtList &&
          !result.canExportBadges &&
          result.security
        ) {
          setSecurityOnlyMode(true);
        } else {
          setSecurityOnlyMode(false);
        }
        setCapabilities(result);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setLoading(false));
  }, []);

  // System area logic

  // - Server area
  const [pingLoading, setPingLoading] = useState(false);
  const ping = () => {
    setPingLoading(true);
    runRequest({ action: new PingApiAction() })
      .then((e) => showModal(t("common.success"), <span>{e.message}</span>))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setPingLoading(false));
  };

  // Pretix area logic

  // - Pretix data
  const [reloadEventLoading, setReloadEventLoading] = useState(false);
  const reloadEvent = () => {
    setReloadEventLoading(true);
    runRequest({ action: new ReloadEventApiAction() })
      .then(() => {})
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setReloadEventLoading(false));
  };

  const [reloadOrdersLoading, setReloadOrdersLoading] = useState(false);
  const reloadOrders = () => {
    setReloadOrdersLoading(true);
    runRequest({ action: new ReloadOrdersApiAction() })
      .then(() => {})
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setReloadOrdersLoading(false));
  };
  // Event area logic

  // - orders
  const [remindOrderLinkLoading, setRemindOrderLinkLoading] = useState(false);
  const remindOrderLink = () => {
    setRemindOrderLinkLoading(true);
    runRequest({ action: new RemindOrderLinkApiAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setRemindOrderLinkLoading(false));
  };

  const [exportRoomsLoading, setExportRoomsLoading] = useState(false);
  const exportRooms = () => {
    setExportRoomsLoading(true);
    runRequest({ action: new ExportHotelRoomsApiAction() })
      .then((response) => response.blob())
      .then((exportBlob) => {
        const result = URL.createObjectURL(exportBlob);
        window.open(result, "_blank");
        URL.revokeObjectURL(result);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setExportRoomsLoading(false));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [exportShirtsLoading, setExportShirtsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exportShirts = () => {
    setExportShirtsLoading(true);
    runRequest({ action: new ExportTShirtsApiAction() })
      .then((response) => response.blob())
      .then((exportBlob) => {
        const result = URL.createObjectURL(exportBlob);
        window.open(result, "_blank");
        URL.revokeObjectURL(result);
      })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setExportShirtsLoading(false));
  };

  // - rooms
  const [remindRoomsNotFullLoading, setRemindRoomsNotFullLoading] = useState(false);
  const remindRoomsNotFull = () => {
    setRemindRoomsNotFullLoading(true);
    runRequest({ action: new RemindRoomsNotFullApiAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setRemindRoomsNotFullLoading(false));
  };
  // - membership cards
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sendMembershipCardByMailLoading, setSendMembershipCardByMailLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendMembershipCardByMail = () => {
    setSendMembershipCardByMailLoading(true);
    runRequest({ action: new SendMembershipCardByMailApiAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setSendMembershipCardByMailLoading(false));
  };
  // - badge
  const [renderBadgesLoading, setRenderBadgesLoading] = useState(false);
  const [renderBadgesModalOpen, setRenderBadgesModalOpen] = useState(false);

  const [remindBadgesLoading, setRemindBadgesLoading] = useState(false);
  const remindBadges = () => {
    setRemindBadgesLoading(true);
    runRequest({ action: new RemindBadgesApiAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setRemindBadgesLoading(false));
  };

  const [remindFursuitBadgesLoading, setRemindFursuitBadgesLoading] = useState(false);
  const remindFursuitBadges = () => {
    setRemindFursuitBadgesLoading(true);
    runRequest({ action: new RemindFursuitBadgesApiAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setRemindFursuitBadgesLoading(false));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [remindFursuitBringToEventLoading, setRemindFursuitBringToEventLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const remindFursuitBringToEvent = () => {
    setRemindFursuitBringToEventLoading(true);
    runRequest({ action: new RemindFursuitBringToEventApiAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setRemindFursuitBringToEventLoading(false));
  };

  return (
    <>
      <div className="stretch-page">
        {loading && <LoadingPanel />}
        {/* Security area */}
        <FpMacroSection title={t("furpanel.admin.security_management.title")} icon="SECURITY">
          <FpSection title={t("furpanel.admin.security_management.users_and_docs.title")}>
            <FpButton
              icon="PERSON_SEARCH"
              onClick={() => router.push(`/${locale}/admin/security/user-search`)}
              disabled={!capabilities?.security}
            >
              {t("furpanel.admin.security_management.users_and_docs.user_search")}
            </FpButton>
            <FpButton
              icon="FIND_IN_PAGE"
              onClick={() => router.push(`/${locale}/admin/security/documents`)}
              disabled={!capabilities?.security}
            >
              {t("furpanel.admin.security_management.users_and_docs.documents")}
            </FpButton>
          </FpSection>
          <FpSection title={t("furpanel.admin.security_management.reports.title")}>
            <FpButton
              icon="BOOKMARK_STAR"
              onClick={() => router.push(`/${locale}/admin/security/incidents`)}
              disabled={!capabilities?.security}
            >
              {t("furpanel.admin.security_management.reports.incident_log")}
            </FpButton>
          </FpSection>
          <FpSection title={t("furpanel.admin.security_management.logs.title")}>
            <FpButton
              icon="PACKAGE_2"
              onClick={() => router.push(`/${locale}/admin/security/assets`)}
              disabled={!capabilities?.security}
            >
              {t("furpanel.admin.security_management.logs.asset_manager")}
            </FpButton>
            <FpButton
              icon="ERROR"
              onClick={() => router.push(`/${locale}/admin/security/hazardous`)}
              disabled={!capabilities?.security}
            >
              {t("furpanel.admin.security_management.logs.hazardous_register")}
            </FpButton>
            <FpButton
              icon="SEARCH"
              onClick={() => router.push(`/${locale}/admin/security/lost-found`)}
              disabled={!capabilities?.security}
            >
              {t("furpanel.admin.security_management.logs.lost_and_found")}
            </FpButton>
          </FpSection>
        </FpMacroSection>
        {!securityOnlyMode && (
          <>
            {/* System area */}
            <FpMacroSection title={t("furpanel.admin.system.title")} icon="CONFIRMATION_NUMBER">
              <FpSection title={t("furpanel.admin.system.server.title")}>
                <FpButton
                  icon="VITAL_SIGNS"
                  onClick={ping}
                  debounce={5000}
                  busy={pingLoading}
                  disabled={!capabilities?.canRefreshPretixCache}
                >
                  {t("furpanel.admin.system.server.ping")}
                </FpButton>
              </FpSection>
            </FpMacroSection>
            {/* Pretix area */}
            <FpMacroSection title={t("furpanel.admin.pretix.title")} icon="CONFIRMATION_NUMBER">
              <FpSection title={t("furpanel.admin.pretix.data.title")}>
                <FpButton
                  icon="EVENT_REPEAT"
                  onClick={reloadEvent}
                  debounce={5000}
                  busy={reloadEventLoading}
                  disabled={!capabilities?.canRefreshPretixCache}
                >
                  {t("furpanel.admin.pretix.data.reload_event")}
                </FpButton>
                <FpButton
                  icon="SYNC"
                  onClick={reloadOrders}
                  debounce={5000}
                  busy={reloadOrdersLoading}
                  disabled={!capabilities?.canRefreshPretixCache}
                >
                  {t("furpanel.admin.pretix.data.reload_orders")}
                </FpButton>
              </FpSection>
            </FpMacroSection>
            {/* Event area */}
            <FpMacroSection title={t("furpanel.admin.events.title")} icon="LOCAL_ACTIVITY">
              <FpSection title={t("furpanel.admin.events.badges.title")}>
                <FpButton
                  icon="PRINT"
                  onClick={() => setRenderBadgesModalOpen(true)}
                  busy={renderBadgesLoading}
                  disabled={!capabilities?.canRefreshPretixCache}
                >
                  {t("furpanel.admin.events.badges.print_badges")}
                </FpButton>
                <FpButton
                  icon="MAIL"
                  onClick={remindBadges}
                  debounce={5000}
                  busy={remindBadgesLoading}
                  disabled={!capabilities?.canRemindBadgeUploads}
                >
                  {t("furpanel.admin.events.badges.remind_badges")}
                </FpButton>
                <FpButton
                  icon="MAIL"
                  onClick={remindFursuitBadges}
                  debounce={5000}
                  busy={remindFursuitBadgesLoading}
                  disabled={!capabilities?.canRemindBadgeUploads}
                >
                  {t("furpanel.admin.events.badges.remind_fursuits")}
                </FpButton>
              </FpSection>
              <FpSection title={t("furpanel.admin.events.rooms.title")}>
                <FpButton
                  icon="MAIL"
                  onClick={remindRoomsNotFull}
                  debounce={5000}
                  busy={remindRoomsNotFullLoading}
                  disabled={!capabilities?.canRemindRoomsNotFull}
                >
                  {t("furpanel.admin.events.rooms.remind_rooms_not_full")}
                </FpButton>
              </FpSection>
              <FpSection title={t("furpanel.admin.events.orders.title")}>
                <FpButton
                  icon="DOWNLOAD"
                  onClick={exportRooms}
                  debounce={5000}
                  busy={exportRoomsLoading}
                  disabled={!capabilities?.canExportHotelList}
                >
                  {t("furpanel.admin.events.orders.export_rooms")}
                </FpButton>
                <FpButton
                  icon="MAIL"
                  onClick={remindOrderLink}
                  debounce={5000}
                  busy={remindOrderLinkLoading}
                  disabled={!capabilities?.canRemindOrderLinking}
                >
                  {t("furpanel.admin.events.orders.remind_order_linking")}
                </FpButton>
              </FpSection>
            </FpMacroSection>
            {/** Users area */}
            <FpMacroSection title={t("furpanel.admin.users.title")} icon="PERSON">
              <FpSection title={t("furpanel.admin.users.accounts.title")}>
                <FpButton
                  icon="PERSON_SEARCH"
                  onClick={() => router.push("/admin/users/")}
                  disabled={!capabilities?.canViewUsers}
                >
                  {t("furpanel.admin.users.accounts.view.title")}
                </FpButton>
              </FpSection>
              <FpSection title={t("furpanel.admin.users.security.title")}>
                <FpButton
                  icon="GROUPS"
                  onClick={() => router.push("/admin/roles/")}
                  disabled={!capabilities?.canUpgradeUser}
                >
                  {t("furpanel.admin.users.security.roles.title")}
                </FpButton>
              </FpSection>
              <FpSection title={t("furpanel.admin.membership.title")}>
                <FpButton
                  icon="ID_CARD"
                  onClick={() => router.push("/admin/memberships/a")}
                  disabled={!capabilities?.canManageMembershipCards}
                >
                  {t("furpanel.admin.membership_manager.title")}
                </FpButton>
              </FpSection>
            </FpMacroSection>
          </>
        )}
      </div>
      <BadgePrintingDialog
        open={renderBadgesModalOpen}
        onClose={() => setRenderBadgesModalOpen(false)}
        loading={renderBadgesLoading}
        setLoading={setRenderBadgesLoading}
      />
    </>
  );
}
