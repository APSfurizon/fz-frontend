import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import LoadingPanel from "@/components/loadingPanel";
import Modal from "@/components/modal";
import ErrorMessage from "@/components/errorMessage";
import FpTable from "@/components/table/fpTable";
import { runRequest } from "@/lib/api/global";
import {
  DestroyAllSessionsAction, DestroySessionAction, DestroySessionData, GetAllSessionsAction, UserSession
} from "@/lib/api/user";
import { uaFriendly } from "@/lib/userAgent";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function UserSessions() {
  const t = useTranslations();
  const formatter = useFormatter();
  const convertToDateTime = (dateStr: string) => formatter.dateTime(new Date(dateStr), { dateStyle: "medium" });
  const router = useRouter();
  const { showModal, hideModal } = useModalUpdate();

  const [sessions, setSessions] = useState<UserSession[]>();
  const [loading, setLoading] = useState(false);

  // Sessions loading
  useEffect(() => {
    if (sessions !== undefined) return;
    setLoading(true);
    runRequest({ action: new GetAllSessionsAction() })
      .then((result) => setSessions(result.sessions))
      .catch((err) => {
        showModal(
          t("common.error"),
          <ErrorMessage error={err} />
        );
        setSessions([]);
      }).finally(() => setLoading(false));
  }, [sessions]);

  // Session deletion logic
  const [destroyConfirmModalOpen, setDestroyConfirmModalOpen] = useState(false);

  const destroyAllSessions = () => {
    if (!sessions) return;
    setLoading(true);
    runRequest({ action: new DestroyAllSessionsAction() })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err} />))
      .finally(() => {
        setLoading(false);
        setDestroyConfirmModalOpen(false);
        router.replace("/logout");
      });
  }

  const promptDestroySession = (sessionId: string) => {
    showModal(
      t("furpanel.user.sessions.actions.terminate_session"),
      <>
        <span className="descriptive">{t("furpanel.user.sessions.messages.confirm_terminate_session")}</span>
        <div className="bottom-toolbar">
          <Button title={t("common.cancel")} className="danger" onClick={() => hideModal()}
            icon="CANCEL" busy={loading}>{t("common.cancel")}</Button>
          <div className="spacer"></div>
          <Button title={t("furpanel.user.sessions.actions.terminate_session")}
            onClick={() => destroySession(sessionId)}
            icon="CLOSE"
            busy={loading}>
            {t("furpanel.user.sessions.actions.terminate_session")}
          </Button>
        </div>
      </>
    )
  }

  const destroySession = (sessionId: string) => {
    if (!sessions) return;
    setLoading(true);
    const sessionData: DestroySessionData = { sessionId: sessionId };
    runRequest({
      action: new DestroySessionAction(),
      body: sessionData
    }).then(() => {
      hideModal();
      setSessions(undefined);
    })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err} />))
      .finally(() => setLoading(false));
  }

  // Table logic
  const sessionColHelper = createColumnHelper<UserSession>();
  const sessionColumns: ColumnDef<UserSession, any>[] = useMemo(() => [
    sessionColHelper.accessor(itm => convertToDateTime(itm.createdAt), {
      id: "created",
      header: t("furpanel.user.sessions.headers.created")
    }),
    sessionColHelper.accessor(itm => uaFriendly(itm.userAgent), {
      id: "userAgent",
      header: t("furpanel.user.sessions.headers.user_agent")
    }),
    sessionColHelper.accessor(itm => convertToDateTime(itm.lastUsageAt), {
      id: "lastUsed",
      header: t("furpanel.user.sessions.headers.last_usage")
    }),
    sessionColHelper.display({
      id: "terminate",
      header: "",
      cell: (props) => <Button onClick={() => promptDestroySession(props.row.original.sessionId)}
        icon="CLOSE" title={t("furpanel.user.sessions.actions.terminate_session")}
        busy={loading}
        style={{ display: 'inline' }} />,
      enableResizing: false,
      maxSize: 50
    })
  ], [loading]);

  return <>
    {sessions
      ? <FpTable<UserSession> key={String(loading)}
        columns={sessionColumns}
        rows={sessions}
        pinnedColumns={{ right: ["terminate"] }} />
      : <LoadingPanel />
    }
    <div className="horizontal-list">
      <div className="spacer"></div>
      <Button className="danger" icon="CLOSE" onClick={() => setDestroyConfirmModalOpen(true)}>
        {t("furpanel.user.sessions.actions.terminate_all_sessions")}
      </Button>
    </div>
    <Modal open={destroyConfirmModalOpen} onClose={() => setDestroyConfirmModalOpen(false)}
      title={t("furpanel.user.sessions.actions.terminate_all_sessions")}>
      <span className="descriptive">{t("furpanel.user.sessions.messages.confirm_terminate_all_sessions")}</span>
      <div className="bottom-toolbar">
        <Button title={t("common.cancel")}
          className="danger"
          onClick={() => setDestroyConfirmModalOpen(false)}
          icon="CANCEL"
          busy={loading}>
          {t("common.cancel")}
        </Button>
        <div className="spacer" />
        <Button title={t("furpanel.user.sessions.actions.terminate_all_sessions")}
          onClick={() => destroyAllSessions()}
          icon="CLOSE"
          busy={loading}>
          {t("furpanel.user.sessions.actions.terminate_all_sessions")}
        </Button>
      </div>
    </Modal>
  </>
}