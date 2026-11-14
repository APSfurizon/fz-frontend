import { GetBadgeStatusAction } from "@/lib/api/badge/badge";
import { runRequest } from "@/lib/api/networking/main";
import { BookingOrderApiAction } from "@/lib/api/reservation";
import "@/styles/furpanel/booking.css";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { ReservationWidget } from "./widgets";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("furpanel.booking.title") + " - Furpanel",
  };
}

export default async function ReservationPage() {
  const cookieStore = await cookies();
  const queryClient = new QueryClient();

  // Reservation data
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  await queryClient.query({
    queryKey: ["reservation-widget"],
    queryFn: ({ signal }) => runRequest({ action: new BookingOrderApiAction(), cookieStore, signal }),
    staleTime: 10_000,
  });
  // Badge data
  const badgeData = await runRequest({ action: new GetBadgeStatusAction(), cookieStore });

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="widget-container">
          <ReservationWidget />
        </div>
      </HydrationBoundary>
    </>
  );
}
