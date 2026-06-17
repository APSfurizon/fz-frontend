"use client";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import LoadingPanel from "@/components/loadingPanel";
import Modal from "@/components/modal";
import { ApiErrorResponse } from "@/lib/api/networking";
import { runRequest } from "@/lib/api/networking/main";
import { UserOrderLinkingAction, UserOrderLinkingData } from "@/lib/api/user";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderLinkPage() {
  const params = useSearchParams();
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showModal } = useModalUpdate();

  const code = params.get("c");
  const secret = params.get("s");
  // TODO: const message = params.get("m");

  useEffect(() => {
    if (!code || !secret) router.replace("/home");
    setLoading(true);
    const userOrderLinkData: UserOrderLinkingData = {
      orderCode: code!,
      orderSecret: secret!,
    };
    runRequest({
      action: new UserOrderLinkingAction(),
      body: userOrderLinkData,
    })
      .then(() => router.replace("/booking"))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Modal
      open
      busy={loading}
      onClose={() => {
        router.replace("/home");
      }}
      title={t("furpanel.user.linking.title")}
      icon="LOCAL_ACTIVITY"
    >
      {loading && <LoadingPanel>{t("furpanel.user.linking.description")}</LoadingPanel>}
    </Modal>
  );
}
