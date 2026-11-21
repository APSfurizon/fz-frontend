"use client";
import { GetBadgeStatusAction } from "@/lib/api/badge/badge";
import { runRequest } from "@/lib/api/networking";
import "@/styles/furpanel/reservation/widgets/reservationWidget.scss";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useLocale, useTranslations } from "next-intl";

export default function BadgeWidget() {
  // Translation functions
  const t = useTranslations();
  const locale = useLocale();
  const formatter = useFormatter();

  const query = useQuery({
    queryKey: ["badge-widget"],
    queryFn: ({ signal }) => runRequest({ action: new GetBadgeStatusAction(), signal }),
    staleTime: 10_000,
  });
}
